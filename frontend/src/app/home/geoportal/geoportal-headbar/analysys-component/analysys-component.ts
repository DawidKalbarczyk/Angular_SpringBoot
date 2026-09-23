import { Component, inject, signal } from '@angular/core';
import { GeoserverService } from '../../../../services/GeoserverService/geoserver-service';
import { ObjSelection } from '../../../../services/obj-selection/obj-selection';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { ZoomToObject } from '../../../../services/zoom-to-object/zoom-to-object';
import { CommonModule } from '@angular/common';
import { PopUpService } from '../../../../services/pop-up-service/pop-up-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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


          private http = inject(HttpClient);
          public async deleteObjFromSelection(objectId: string): Promise<void> {
            for (let i = 0; i < this.objectSelection.selectedObjects().length; i++) {
              const obj = this.objectSelection.selectedObjects()[i];
              if (obj.features[0].id === objectId) {
                this.objectSelection.selectedNumberOfObjects.update(n => n - 1);
                this.objectSelection.selectedObjects.update(objects => {
                  return objects.filter(ob => ob.features[0].id !== objectId);
                })
                await firstValueFrom(
                  this.http.delete('/analysys/delete-table-from-selection', {
                    params: {
                      userId: this.objectSelection.userId,
                      time: this.objectSelection.time,
                    }
                  })
                ).catch((error) => {
                  console.error('Error deleting object from selection:', error);
                });
                

                const idsString = this.objectSelection.selectedObjects().map(obj => obj.features[0].id.split('.')[1]).join(',');
                const newUserId = this.objectSelection.getUserId();
                const newTime = this.objectSelection.getTime();
                const formData = new FormData();
                formData.append('userId', newUserId);
                formData.append('layer', this.objectSelection.selectedSelectOptionLayer());
                formData.append('ids', `(${idsString})`);
                formData.append('time', newTime);
                await firstValueFrom(
                  this.http.post('/analysys/create-table-from-selection', formData, {responseType: 'text'})
                );

                const tableName = `user_${newUserId}_temp_table_${newTime}`;
                await this.http.post('/analysys/create-layer', {
                  tableName: tableName,
                  title: tableName,
                  sld: this.objectSelection.getSLD(newUserId, newTime, this.objectSelection.selectedSelectOptionLayer()),
                  userId: newUserId,
                }).toPromise();
                //Obsluga http rquest do backendu w celu usuniecia obiektu z bazy danych
                
              }
            }
          }
          

          public popUpService = inject(PopUpService);
        }
