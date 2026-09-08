import { Component, inject } from '@angular/core';
import { GeoportalHeadbar} from './geoportal-headbar/geoportal-headbar';
import { ReturnCorner } from "../../global-components/return-corner/return-corner";
import { MapComponent } from "./map-component/map-component";
import { AuthorBar } from "../../global-components/author-bar/author-bar";
import { MeasureComponent } from "./geoportal-headbar/measure-component/measure-component";
import { AnalysysComponent } from "./geoportal-headbar/analysys-component/analysys-component";
import { AMService } from '../../services/a-m-service/a-m-service';


@Component({
  selector: 'app-geoportal',
  imports: [GeoportalHeadbar, ReturnCorner, MapComponent, AuthorBar, MeasureComponent, AnalysysComponent],
  templateUrl: './geoportal.html',
  styleUrl: './geoportal.scss',
})
export class Geoportal {
  public AMservice = inject(AMService);

}
