import { Component, inject} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { LayerVisibility, LayerKey } from '../../../services/layer-visibility/layer-visibility';
import { InfoToggle } from '../../../services/info-toggle/info-toggle';
import { InfoComponent } from './info-component/info-component';


@Component({
  selector: 'app-geoportal-headbar',
  imports: [MatSlideToggleModule],
  templateUrl: './geoportal-headbar.html',
  styleUrl: './geoportal-headbar.scss',
})
export class GeoportalHeadbar {
  public isLayersOut = false;
  public isBaseLayerOut = false;
  public mapLayerService = inject(LayerVisibility);
  public infoToggleService = inject(InfoToggle);

  layersOut(): void {
    this.isLayersOut = !this.isLayersOut;
    this.isBaseLayerOut = false;
  }
  baseLayerOut(): void {
    this.isBaseLayerOut = !this.isBaseLayerOut;
    this.isLayersOut = false;
  }
}

