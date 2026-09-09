import { Component, inject, signal } from '@angular/core';
import { GeoserverService } from '../../../../services/GeoserverService/geoserver-service';

@Component({
  selector: 'app-analysys-component',
    imports: [],
      templateUrl: './analysys-component.html',
        styleUrl: './analysys-component.scss',
        })
        export class AnalysysComponent {
          public inputText = signal<string>('');

          public analysysPicked = signal<boolean>(false);

          public pickAnalysys() {
            this.analysysPicked.set(true);
          }   

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
        }
