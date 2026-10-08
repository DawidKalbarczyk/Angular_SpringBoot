import { Component, computed, effect, inject, signal } from '@angular/core';
import { GeoserverService } from '../../../../services/GeoserverService/geoserver-service';
import { ObjSelection } from '../../../../services/obj-selection/obj-selection';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ZoomToObject } from '../../../../services/zoom-to-object/zoom-to-object';
import { CommonModule } from '@angular/common';
import { PopUpService } from '../../../../services/pop-up-service/pop-up-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AMService } from '../../../../services/a-m-service/a-m-service';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../../services/login-service/login-service';
import { Map } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorImageLayer from 'ol/layer/VectorImage';
import TileWMS from 'ol/source/TileWMS';

@Component({
  selector: 'app-analysys-component',
  imports: [TranslatePipe, FormsModule, CommonModule],
  templateUrl: './analysys-component.html',
  styleUrl: './analysys-component.scss',
})
export class AnalysysComponent {
  public inputText = signal<string>('');

  public zoomToObject = inject(ZoomToObject);
  public GeoserverService = inject(GeoserverService);
  public loginService = inject(LoginService);
  
  public userCreation(userId: string, func: 'createWorkspace' | 'createTempWorkspace' | 'createDatastore' | 'createTempDatastore' ) {
    this.GeoserverService[func](userId).subscribe({
      next: (response) => {
        console.log('Workspace created successfully:', response);
      },
      error: (error) => {
        console.error('Error creating workspace:', error);
      }
    })
  }

  public objectSelection = inject(ObjSelection);
  private http = inject(HttpClient);
  
  

  public popUpService = inject(PopUpService);
  public AMService = inject(AMService);
  public async getLayerInfo(layerName: string): Promise<void> {
    let realGeoserverLayerName = '';
    switch (layerName) {
      case 'vectorLayer':
        realGeoserverLayerName = 'sql_data';
        break;
      case 'boundsLayerCities':
        realGeoserverLayerName = 'boundscities';
        break;
      case 'boundsLayerGminy':
        realGeoserverLayerName = 'boundsgminy';
        break;
      case 'boundsLayerPowiaty':
        realGeoserverLayerName = 'boundspowiaty';
        break;
      case 'boundsLayerWojewodz':
        realGeoserverLayerName = 'boundswojewodz';
        break;
      case 'boundsLayerPanstwo':
        realGeoserverLayerName = 'boundspanstwo';
        break;
      default:
        console.warn('Unknown layer name:', layerName);
    }

    const workspace = "AngularLocal";
    const layer = realGeoserverLayerName;

    const url = `http://geoserver:8080/geoserver/rest/workspaces/${workspace}/featuretypes/${layer}.json`;
    const response = await firstValueFrom(this.http.get<any>('/save/get-xml-as-json?url=' + url));
    
    let data: any;
    const argumentName = layer;
    if (response?.featureType?.name === argumentName) {
        data = response;
    }
    console.log(data);
    const filteredData = data
      ? {
          ...data,
          featureType: {
            ...data.featureType,
            attributes: {
              ...data.featureType.attributes,
              attribute: data.featureType.attributes.attribute.filter(
                (attribute: { name?: string }) => attribute.name !== 'wkb_geometry'
              ),
            },
          },
        }
      : data;
    this.responseData.set(filteredData);
    };

    private numericAttributes = 
    ['jpt_powier', 'jpt_powi_1', 
      'shape_leng', 'shape_le_1', 'shape_area'];

    public disableOption = computed(() =>
      !this.numericAttributes.includes(this.attributeAttribute())
    // jezeli zwraca tak to zaprzeczmy
    );
   
    













    private map = this.AMService.map;
    private attributeTileLayer!: TileLayer;
    private attributeVectorLayer!: VectorImageLayer;
    public submitType = signal<'new' | 'update'>('new');

    public responseData = signal<any>(null);
    public attributeLayer: string = "";
    public attributeAttribute = signal<string>('');
    public attributeSign: string = "=";
    public attributeCondition: string = "";
    public attributeSQLResponse = signal<string>('');
    
  
    private async createNewAttributeSelection(): Promise<void> {
      dodac gdzies tu aby zabijalo poprzednia tabele
      //this.map.removeLayer('attributeSelectionLayer'); - to nie dziala
      const formData = new FormData();
      formData.append('attributeLayer', this.attributeLayer);
      formData.append('attributeAttribute', this.attributeAttribute());
      formData.append('attributeSign', this.attributeSign);
      formData.append('attributeCondition', (() => {
        if (this.attributeCondition === 'shape_leng' || this.attributeCondition === 'shape_le_1' || this.attributeCondition === 'shape_area') {
          return String(Number(this.attributeCondition) * 1_000_000);
        } else {
          return this.attributeCondition;
        }
      })());
       
      const userId = this.objectSelection.getUserId();
      const time = this.objectSelection.getTime();
      formData.append('userId', userId);
      formData.append('time', time);

      
      try {
        const response = await firstValueFrom(this.http.post('/attribute-analysis/new-attribute-selection', formData, { responseType: 'text' }));
        console.log("Happily returning from backend: ", response);

      } catch (error) {
        console.error('Error submitting new attribute selection:', error);
      }
      const SLD = this.objectSelection.getSLD(userId, time, this.attributeLayer);
      if (this.attributeLayer !== 'vectorLayer') {
        this.attributeTileLayer = new TileLayer({
          properties: { layerName: 'attributeSelectionLayer'},
          source: new TileWMS({
            url: `${window.location.origin}/geoserver/user_${userId}_temp/wms?`,
            params: {
              'LAYERS': `user_${userId}_temp_table_${time}`,
              'TILED': true,
              'SLD_BODY': SLD
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
          }),
          visible: true
        });
      } else if (this.attributeLayer === 'vectorLayer') {
      } else {
        console.log("Unknown layer type selected at analysys-component: ", this.attributeLayer);
      }


      this.map.addLayer(this.attributeTileLayer || this.attributeVectorLayer);
    }







    private updateAttributeSelection(): void {

    }

    public attributeFormSubmit(type: 'new' | 'update'): void {
      if (type === 'new') {
        this.createNewAttributeSelection();
        console.log('Submitting new attribute form with values:');
      } else if (type === 'update') {
        this.updateAttributeSelection();
        console.log('Submitting update attribute form with values:');
      }
    }
  }
  
