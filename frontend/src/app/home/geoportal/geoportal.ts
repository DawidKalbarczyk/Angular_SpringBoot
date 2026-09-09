import { Component, inject, OnDestroy, HostListener } from '@angular/core';
import { GeoportalHeadbar} from './geoportal-headbar/geoportal-headbar';
import { ReturnCorner } from "../../global-components/return-corner/return-corner";
import { MapComponent } from "./map-component/map-component";
import { AuthorBar } from "../../global-components/author-bar/author-bar";
import { MeasureComponent } from "./geoportal-headbar/measure-component/measure-component";
import { AnalysysComponent } from "./geoportal-headbar/analysys-component/analysys-component";
import { AMService } from '../../services/a-m-service/a-m-service';
import { GeoserverService } from '../../services/GeoserverService/geoserver-service';


@Component({
  selector: 'app-geoportal',
  imports: [GeoportalHeadbar, ReturnCorner, MapComponent, AuthorBar, MeasureComponent, AnalysysComponent],
  templateUrl: './geoportal.html',
  styleUrl: './geoportal.scss',
})
export class Geoportal implements OnDestroy{
  public AMservice = inject(AMService);
  public GeoserverService = inject(GeoserverService);
  private userId: string = "124"; 

  @HostListener('window:pagehide')
  onPageHide(): void {
    fetch(`/create/delete-temp?userId=${this.userId}`, { 
      method: 'DELETE',
      keepalive: true 
    })
  }
  
  ngOnDestroy(): void {
    this.GeoserverService.deleteTemps("124").subscribe({
      next: (response) => {
        console.log('Temporary workspaces and datastores deleted successfully:', response);
      },
      error: (error) => {
        console.error('Error deleting temporary workspaces and datastores:', error);
      }
    });
  }

}
