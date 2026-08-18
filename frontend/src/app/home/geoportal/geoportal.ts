import { Component } from '@angular/core';
import { GeoportalHeadbar } from './geoportal-headbar/geoportal-headbar';
import { ReturnCorner } from "../../global-components/return-corner/return-corner";
import { MapComponent } from "./map-component/map-component";
import { AuthorBar } from "../../global-components/author-bar/author-bar";

@Component({
  selector: 'app-geoportal',
  imports: [GeoportalHeadbar, ReturnCorner, MapComponent, AuthorBar],
  templateUrl: './geoportal.html',
  styleUrl: './geoportal.scss',
})
export class Geoportal {}
