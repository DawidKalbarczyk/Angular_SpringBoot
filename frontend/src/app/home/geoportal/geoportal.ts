import { Component } from '@angular/core';
import { GeoportalHeadbar } from './geoportal-headbar/geoportal-headbar';
import { ReturnCorner } from "../../global-components/return-corner/return-corner";
import { MapComponent } from "./map-component/map-component";

@Component({
  selector: 'app-geoportal',
  imports: [GeoportalHeadbar, ReturnCorner, MapComponent],
  templateUrl: './geoportal.html',
  styleUrl: './geoportal.scss',
})
export class Geoportal {}
