import { Component, inject, signal } from '@angular/core';
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

  public responseData = signal<any>(null);
  public attributeLayer: string = "";
  public attributeAttribute: string = "";
  public attributeSign: string = "=";
  public attributeCondition: string = "";
  public attributeFormSubmit(): void {
    console.log('Form submitted with values:', {
      layer: this.attributeLayer,
      attribute: this.attributeAttribute,
      sign: this.attributeSign,
      condition: this.attributeCondition
    });
  }
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
    this.responseData.set(data);
    };

    
  }
  
