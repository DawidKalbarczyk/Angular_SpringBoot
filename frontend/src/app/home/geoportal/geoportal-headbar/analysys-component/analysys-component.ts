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
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import { LayerVisibility } from '../../../../services/layer-visibility/layer-visibility';

@Component({
  selector: 'app-analysys-component',
  imports: [TranslatePipe, FormsModule, CommonModule],
  templateUrl: './analysys-component.html',
  styleUrl: './analysys-component.scss',
})
export class AnalysysComponent {
  private highlightedSLD = ``

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
    ['jpt_powier', 'jpt_powi_1', 'wspgeog', 'wspxy',
      'shape_leng', 'shape_le_1', 'shape_area', 'liczbamies'];

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
    private oldTime: string = '';
    private oldUserId: string = '';
    private oldAttributeLayer: string = '';
    
    public clearAttributeSelection(): void {
      if (this.attributeTileLayer) {
        this.map.removeLayer(this.attributeTileLayer);
      }
      if (this.attributeVectorLayer) {
        this.map.removeLayer(this.attributeVectorLayer);
      }
      this.attributeAttribute.set('');
      this.attributeSign = '=';
      this.attributeCondition = '';
      this.AMService.showResolution('map');
    }
  
    private async createNewAttributeSelection(): Promise<void> {
      if (this.attributeLayer) {
        this.map.removeLayer(this.attributeTileLayer || this.attributeVectorLayer);
      }

      if (this.oldTime !== '' && this.oldUserId !== '') {
        await firstValueFrom(this.http.delete(`/attribute-analysis/delete-attribute-selection?oldUserId=${this.oldUserId}&oldTime=${this.oldTime}`, { responseType: 'text' }));
      }

      const newTime = this.objectSelection.getTime();
      const newUserId = this.objectSelection.getUserId();
      //this.map.removeLayer('attributeSelectionLayer'); - to nie dziala
      const formData = new FormData();
      formData.append('attributeLayer', this.attributeLayer);
      formData.append('attributeAttribute', this.attributeAttribute());
      formData.append('attributeSign', this.attributeSign);
      formData.append('attributeCondition', (() => {
        if (this.attributeAttribute() === 'shape_leng' || this.attributeAttribute() === 'shape_le_1' || this.attributeAttribute() === 'shape_area') {
          return String(Number(this.attributeCondition) * 1_000_000);
        } else {
          return this.attributeCondition;
        }
      })());

      formData.append('userId', newUserId);
      formData.append('time', newTime);

      
      try {
        const response = await firstValueFrom(this.http.post('/attribute-analysis/new-attribute-selection', formData, { responseType: 'text' }));
        console.log("Happily returning from backend: ", response);

      } catch (error) {
        console.error('Error submitting new attribute selection:', error);
      }

      if (this.attributeLayer !== 'vectorLayer') {
        this.attributeTileLayer = new TileLayer({
          properties: { layerName: 'attributeSelectionLayer'},
          source: new TileWMS({
            url: `${window.location.origin}/geoserver/user_${newUserId}_temp/wms?`,
            params: {
              'LAYERS': `user_${newUserId}_temp_table_${newTime}`,
              'TILED': true,
              'SLD_BODY': this.objectSelection.getSLD(newUserId, newTime, this.attributeLayer)
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
          }),
          visible: true
        });
        this.map.addLayer(this.attributeTileLayer);

      /// Specjalnie robię jako VectorImageLayer aby w przyszłości móc rozszerzyć o edycję zapisanej już warstwy
      ///
      ///
      ///
      } else if (this.attributeLayer === 'vectorLayer') {
        this.attributeVectorLayer = new VectorImageLayer({
          properties: { layerName: 'attributeSelectionLayer'},
          source: new VectorSource({
            format: new GeoJSON(),
            url: `${window.location.origin}/geoserver/user_${newUserId}_temp/ows?` +
              `service=WFS&version=1.0.0&request=GetFeature` +
              `&typeName=user_${newUserId}_temp:user_${newUserId}_temp_table_${newTime}` +
              `&outputFormat=application/json&srsname=EPSG:3857`
          }),
          visible: true,
          style: (feature, resolution) => {
            const showText = resolution < this.AMService.analysisResolution();

            return new Style({
              image: new CircleStyle({
                radius: 10,
                fill: new Fill({ color: '#36f1b9' }),
                stroke: new Stroke({ color: '#fff', width: 1.5 }),
              }),
              text: showText
                ? new Text({
                text: String(feature.get('nazwa') ?? ''),
                fill: new Fill({ color: '#ffffff' }),
                stroke: new Stroke({ color: '#000', width: 2 }),
              }) : undefined,
              zIndex: 99999,
            });
          },
          declutter: false,
          
        });


        
        this.map.addLayer(this.attributeVectorLayer);
        this.AMService.showResolution('analysys');

      } else {
        console.log("Unknown layer type selected at analysys-component: ", this.attributeLayer);
      }

    
      this.map.getLayers().forEach((layer) => {
        if (layer.get('layerKey') === 'vectorLayer') {
          const visibility = this.layerVisibility.layersVisibility();
          visibility.vectorLayer = false;
          layer.setVisible(false);
        }
      });

      this.oldTime = newTime;
      this.oldUserId = newUserId;
      this.oldAttributeLayer = this.attributeLayer;
    }


    private layerVisibility = inject(LayerVisibility);




    private async updateAttributeSelection(): Promise<void> {
      if (this.oldAttributeLayer) {
        this.map.removeLayer(this.attributeTileLayer || this.attributeVectorLayer);
      }
      // NIe ma newTime i newUser bo operacja na tej samej tabeli
      if (this.attributeLayer !== this.oldAttributeLayer) {
        console.error('Cannot update attribute selection: attribute layer has changed.');
        return;
      }
      const formData = new FormData();
      formData.append('attributeLayer', this.attributeLayer);
      formData.append('attributeAttribute', this.attributeAttribute());
      formData.append('attributeSign', this.attributeSign);
      formData.append('attributeCondition', (() => {
        if (this.attributeAttribute() === 'shape_leng' || this.attributeAttribute() === 'shape_le_1' || this.attributeAttribute() === 'shape_area') {
          return String(Number(this.attributeCondition) * 1_000_000);
        } else {
          return this.attributeCondition;
        }
      })());
      formData.append('userId', this.oldUserId);
      formData.append('time', this.oldTime);
      try {
        const response = await firstValueFrom(this.http.post('/attribute-analysis/update-attribute-selection', formData, { responseType: 'text' }));
        console.log("Happily returning UPDATE from backend: ", response);
      } catch (error) {
        console.error('Error submitting update attribute selection:', error);
      }

      if (this.attributeLayer !== 'vectorLayer') {
        this.attributeTileLayer = new TileLayer({
          properties: { layerName: 'attributeSelectionLayer'},
          source: new TileWMS({
            url: `${window.location.origin}/geoserver/user_${this.oldUserId}_temp/wms?`,
            params: {
              'LAYERS': `user_${this.oldUserId}_temp_table_${this.oldTime}`,
              'TILED': true,
              'SLD_BODY': this.objectSelection.getSLD(this.oldUserId, this.oldTime, this.attributeLayer),

              // "Jeżeli nie wiesz jak coś działa to lepiej tego nie ruszać...."
              // Nie wiem dlaczego, ale powoduje to wywalenie cache'a z geoservera i wczytanie nowej warstwy
              '_v': Date.now()

              /////////////////////////////////////
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
          }),
          visible: true
        });
        this.map.removeLayer(this.attributeTileLayer);
        this.map.addLayer(this.attributeTileLayer);
      } else if (this.attributeLayer === 'vectorLayer') {
        this.attributeVectorLayer = new VectorImageLayer({
          properties: { layerName: 'attributeSelectionLayer'},
          source: new VectorSource({
            format: new GeoJSON(),
            url: `${window.location.origin}/geoserver/user_${this.oldUserId}_temp/ows?` +
              `service=WFS&version=1.0.0&request=GetFeature` +
              `&typeName=user_${this.oldUserId}_temp:user_${this.oldUserId}_temp_table_${this.oldTime}` +
              `&outputFormat=application/json&srsname=EPSG:3857`
          }),
          visible: true,
          style: (feature, resolution) => {
            const showText = resolution < this.AMService.analysisResolution();

            return new Style({
              image: new CircleStyle({
                radius: 15,
                fill: new Fill({ color: '#36f1b9' }),
                stroke: new Stroke({ color: '#fff', width: 1.5 }),
              }),
              text: showText
                ? new Text({
                  text: String(feature.get('nazwa') ?? ''),
                  fill: new Fill({ color: '#ffffff' }),
                  stroke: new Stroke({ color: '#000', width: 2 }),
                }) : undefined,
              zIndex: 99999,
                });
          },
          declutter: false,
        });
        this.map.removeLayer(this.attributeVectorLayer);
        this.map.addLayer(this.attributeVectorLayer);
        this.AMService.showResolution('analysys');
      } else {
        console.log("Unknown layer type selected at analysys-component: ", this.attributeLayer);
      }
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
  
