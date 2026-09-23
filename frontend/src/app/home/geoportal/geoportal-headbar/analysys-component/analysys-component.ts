import { Component, inject, signal } from '@angular/core';
import { GeoserverService } from '../../../../services/GeoserverService/geoserver-service';
import { ObjSelection } from '../../../../services/obj-selection/obj-selection';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ZoomToObject } from '../../../../services/zoom-to-object/zoom-to-object';
import { CommonModule } from '@angular/common';
import { PopUpService } from '../../../../services/pop-up-service/pop-up-service';

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
          
          
          public testFunc(): void {
            console.log('Selected Layer:', this.objectSelection.selectedSelectOptionLayer());
          }


          public async deleteObjFromSelection(objectId: string): Promise<void> {
            for (let i = 0; i < this.objectSelection.selectedObjects().length; i++) {
              const obj = this.objectSelection.selectedObjects()[i];
              if (obj.features[0].id === objectId) {
                //Obsluga http rquest do backendu w celu usuniecia obiektu z bazy danych
                this.objectSelection.selectedNumberOfObjects.update(n => n - 1);
                this.objectSelection.selectedObjects.update(objects => {
                  return objects.filter(ob => ob.features[0].id !== objectId);
                })
              }
            }
          }
          

          public popUpService = inject(PopUpService);
        }
