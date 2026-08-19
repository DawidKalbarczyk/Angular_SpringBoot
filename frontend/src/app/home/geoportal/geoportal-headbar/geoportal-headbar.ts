import { Component, inject} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { LayerVisibility, LayerKey } from '../../../services/layer-visibility/layer-visibility';
import { InfoToggle } from '../../../services/info-toggle/info-toggle';


@Component({
  selector: 'app-geoportal-headbar',
  imports: [MatSlideToggleModule],
  templateUrl: './geoportal-headbar.html',
  styleUrl: './geoportal-headbar.scss',
})
export class GeoportalHeadbar {
  public isLayersOut = false;
  public mapLayerService = inject(LayerVisibility);
  public infoToggleService = inject(InfoToggle);

  layersOut(): void {
    this.isLayersOut = !this.isLayersOut;
  }
}


