import { AfterViewInit, Component, effect, inject } from '@angular/core';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import TileWMS from 'ol/source/TileWMS';
import { LayerVisibility, LayerKey } from '../../../services/layer-visibility/layer-visibility';

@Component({
  selector: 'app-map-component',
  imports: [],
  templateUrl: './map-component.html',
  styleUrl: './map-component.scss',
})
export class MapComponent implements AfterViewInit {
  private mapLayersVisibility = inject(LayerVisibility);

  private osmLayer!: TileLayer;
  private boundsLayerCities!: VectorLayer;
  private boundsLayerGminy!: VectorLayer;
  private boundsLayerPowiaty!: VectorLayer;
  private boundsLayerWojewodz!: VectorLayer;
  private boundsLayerPanstwo!: VectorLayer;
  private map!: Map;
  private vectorLayer!: VectorLayer;
  private vectorSource!: VectorSource;

  constructor() {
    effect(() => {
      const visibility = this.mapLayersVisibility.layersVisibility();
      this.vectorLayer?.setVisible(visibility.vectorLayer);
      this.boundsLayerCities?.setVisible(visibility.boundsLayerCities);
      this.boundsLayerGminy?.setVisible(visibility.boundsLayerGminy);
      this.boundsLayerPowiaty?.setVisible(visibility.boundsLayerPowiaty);
      this.boundsLayerWojewodz?.setVisible(visibility.boundsLayerWojewodz);
      this.boundsLayerPanstwo?.setVisible(visibility.boundsLayerPanstwo);
    })
  }


  ngAfterViewInit(): void {
    const visibility = this.mapLayersVisibility.layersVisibility();

    this.osmLayer = new TileLayer({
      source: new OSM(),
    });


    this.vectorLayer = this.buildVectorLayer('sql_data', 'nazwa');
    this.boundsLayerCities = this.buildVectorLayer('boundscities', 'jpt_nazwa_');
    this.boundsLayerGminy = this.buildVectorLayer('boundsgminy', 'jpt_nazwa_');
    this.boundsLayerPowiaty = this.buildVectorLayer('boundspowiaty', 'jpt_nazwa_');
    this.boundsLayerWojewodz = this.buildVectorLayer('boundswojewodz', 'jpt_nazwa_');
    this.boundsLayerPanstwo = this.buildVectorLayer('boundspanstwo', 'jpt_nazwa_');

    this.map = new Map({
      target: 'map',
      layers: [
        this.osmLayer,
        this.boundsLayerPanstwo,
        this.boundsLayerWojewodz,
        this.boundsLayerPowiaty,
        this.boundsLayerGminy,
        this.boundsLayerCities,
        this.vectorLayer,
      ],
      view: new View({
        center: fromLonLat([19.3, 52.2]),
        zoom: 7,
      }),
    });
  }

  private buildVectorLayer(url: string, atrybut: string): VectorLayer {
    const wfsUrl =
      `${window.location.origin}/geoserver/AngularAppSpring/ows?` +
      `service=WFS&version=1.0.0&request=GetFeature` +
      `&typeName=AngularAppSpring:${url}` +
      `&outputFormat=application/json&srsname=EPSG:3857`;

    this.vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: wfsUrl,
    });

    // Po załadowaniu danych nadaj każdemu obiektowi stabilny indeks
    this.vectorSource.once('featuresloadend', () => {
      const features = this.vectorSource.getFeatures();
      features.forEach((f, i) => f.set('__idx', i));
    });

    return new VectorLayer({
      source: this.vectorSource,
      visible: this.mapLayersVisibility.isVisible('vectorLayer'),
      style: (feature, resolution) => this.decimatedStyle(feature, resolution, atrybut),
      updateWhileAnimating: false,
      updateWhileInteracting: false,
    });
  }

  private decimatedStyle(feature: FeatureLike, resolution: number, atrybut: string): Style | undefined {
    const idx = feature.get('__idx') ?? 0;
    const skip = this.getSkipFactor(resolution);

    // pokaż tylko co "skip"-ty punkt
    if (idx % skip !== 0) {
      return undefined; // nie renderuj tego obiektu w ogóle
    }

    const showLabel = resolution < 350; // próg dobierz eksperymentalnie

    return new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: '#3399CC' }),
        stroke: new Stroke({ color: '#fff', width: 1.5 }),
      }),
      text: showLabel
        ? new Text({
            text: feature.get(atrybut) ?? '',
            offsetY: -12,
            font: '15px Arial',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
          })
        : undefined,
    });
  }

  private getSkipFactor(resolution: number): number {
    if (resolution > 2000) return 50;   // bardzo daleko -> co 50. punkt
    if (resolution > 1000) return 25;
    if (resolution > 500) return 10;
    if (resolution > 200) return 5;
    if (resolution > 50) return 2;
    return 1; 
  }
}

