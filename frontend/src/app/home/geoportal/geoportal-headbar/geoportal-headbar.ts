import { Component, inject } from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { LayerVisibility, LayerKey } from '../../../services/layer-visibility/layer-visibility';


@Component({
  selector: 'app-geoportal-headbar',
  imports: [MatSlideToggleModule],
  templateUrl: './geoportal-headbar.html',
  styleUrl: './geoportal-headbar.scss',
})
export class GeoportalHeadbar {
  isLayersOut = false;
  mapLayerService = inject(LayerVisibility);


  layersOut(): void {
    this.isLayersOut = !this.isLayersOut;
  }
}


