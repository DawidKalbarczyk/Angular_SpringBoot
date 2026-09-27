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

@Component({
  selector: 'app-analysys-component',
    imports: [TranslatePipe],
      templateUrl: './analysys-component.html',
        styleUrl: './analysys-component.scss',
        })
        export class AnalysysComponent {
          public inputText = signal<string>('');

          public zoomToObject = inject(ZoomToObject);
          public GeoserverService = inject(GeoserverService);
          
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
          
        }
