import { Component, effect, inject, signal} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { LayerVisibility, LayerKey } from '../../../services/layer-visibility/layer-visibility';
import { InfoToggle } from '../../../services/info-toggle/info-toggle';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SlicePipe } from '@angular/common';
import { ZoomToObject } from '../../../services/zoom-to-object/zoom-to-object';
import { InfoFeatures } from '../../../services/info-features/info-features';
import { UpperCasePipe } from '@angular/common';
import { AMService } from '../../../services/a-m-service/a-m-service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

export interface HeadbarKeys {
  search: boolean;
  baseLayer: boolean;
  info: boolean;
  layers: boolean;
}

export interface SearchResult {
  idprng: number;
  st_asgeojson: string;
  nazwa: string;
  rodzaj: string;
  powiat: string;
  gmina: string;
}


@Component({
  selector: 'app-geoportal-headbar',
  imports: [MatSlideToggleModule, SlicePipe, UpperCasePipe, TranslatePipe],
  templateUrl: './geoportal-headbar.html',
  styleUrl: './geoportal-headbar.scss',
})
export class GeoportalHeadbar {
  constructor(private http: HttpClient) {
    effect(() => {
      if (this.infoFeatures.isCursorDragged()) {
        this.headbarKeys.search = false;
        this.zoomToObject.isListRendered.set(false);
      }
    });
  }
  
  public mapLayerService = inject(LayerVisibility);
  public infoToggleService = inject(InfoToggle);
  public zoomToObject = inject(ZoomToObject);
  public headbarKeys: HeadbarKeys = {
    search: false,
    baseLayer: false,
    info: false,
    layers: false,
  }
  public infoFeatures = inject(InfoFeatures);


  checkButt(arg: keyof HeadbarKeys): void {
    for (const key in this.headbarKeys) {
      const typedKey = key as keyof HeadbarKeys;
      if (key !== arg) {
        this.headbarKeys[typedKey] = false;
      } else {
        this.headbarKeys[typedKey] = !this.headbarKeys[typedKey];
      }
    }
    this.infoToggleService.isInfoClicked.set(this.headbarKeys.info);
    this.mapLayerService.isLayerClicked.set(this.headbarKeys.layers);
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
  infoOut(): void {
    this.checkButt('info');
  }
  public AMservice = inject(AMService);
  


  public inputValue = signal<string>('');
  public searchResults = signal<{ data: SearchResult[] }>({ data: [] });
  searchItems(query: string) {
    const params = new HttpParams().set('searchTerm', query);

    this.http.get('/query/get_query', { params }).subscribe(
      (response) => {
        console.log('Search results:', response);
        this.searchResults.set(response as { data: SearchResult[] });
      },
      (error) => {
        console.error('Error fetching search results:', error);
      }
    );
    this.zoomToObject.isListRendered.set(false);
  }

  public wasSearchResultClicked = signal<boolean>(false);
  
}

