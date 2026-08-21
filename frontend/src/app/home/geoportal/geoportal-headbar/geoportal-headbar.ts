import { Component, inject} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { LayerVisibility, LayerKey } from '../../../services/layer-visibility/layer-visibility';
import { InfoToggle } from '../../../services/info-toggle/info-toggle';
import { InfoComponent } from './info-component/info-component';
import { MapComponent } from '../map-component/map-component';

export interface HeadbarKeys {
  search: boolean;
  baseLayer: boolean;
  layers: boolean;
}


@Component({
  selector: 'app-geoportal-headbar',
  imports: [MatSlideToggleModule],
  templateUrl: './geoportal-headbar.html',
  styleUrl: './geoportal-headbar.scss',
})
export class GeoportalHeadbar {
  public mapLayerService = inject(LayerVisibility);
  public infoToggleService = inject(InfoToggle);
  public headbarKeys: HeadbarKeys = {
    search: false,
    baseLayer: false,
    layers: false,
  }

  checkButt(arg: keyof HeadbarKeys): void {
    for (const key in this.headbarKeys) {
      const typedKey = key as keyof HeadbarKeys;
      if (key !== arg) {
        this.headbarKeys[typedKey] = false;
      } else {
        this.headbarKeys[typedKey] = !this.headbarKeys[typedKey];
      }
    }
  }

  searchOut(): void {
    this.checkButt('search');
  }
  layersOut(): void {
    this.checkButt('layers');
  }
  baseLayerOut(): void {
    this.checkButt('baseLayer');
  }

  
}

