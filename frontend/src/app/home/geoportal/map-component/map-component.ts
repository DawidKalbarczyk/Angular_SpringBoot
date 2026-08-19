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
import { InfoToggle } from '../../../services/info-toggle/info-toggle';
import { InfoComponent } from '../geoportal-headbar/info-component/info-component';


@Component({
  selector: 'app-map-component',
  imports: [InfoComponent],
  templateUrl: './map-component.html',
  styleUrl: './map-component.scss',
})
export class MapComponent implements AfterViewInit {
  private mapLayersVisibility = inject(LayerVisibility);
  private infoToggleService = inject(InfoToggle);

  private osmLayer!: TileLayer;
  private ortoLayer!: TileLayer;
  private budLayer!: TileLayer;
  private commonLayer!: TileLayer;
  private boundsLayerCities!: TileLayer;
  private boundsLayerGminy!: TileLayer;
  private boundsLayerPowiaty!: TileLayer;
  private boundsLayerWojewodz!: TileLayer;
  private boundsLayerPanstwo!: TileLayer;
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
    });
  }

  ngAfterViewInit(): void {
    this.osmLayer = new TileLayer({
      source: new OSM(),
    });

    this.boundsLayerPanstwo = this.tileLayer('boundsLayerPanstwo', 'boundspanstwo');
    this.boundsLayerWojewodz = this.tileLayer('boundsLayerWojewodz', 'boundswojewodz');
    this.boundsLayerPowiaty = this.tileLayer('boundsLayerPowiaty', 'boundspowiaty');
    this.boundsLayerGminy = this.tileLayer('boundsLayerGminy', 'boundsgminy');
    this.boundsLayerCities = this.tileLayer('boundsLayerCities', 'boundscities');

    this.vectorLayer = this.buildVectorLayer();

    this.ortoLayer = new TileLayer({
      source: new TileWMS({
        url: `${window.location.origin}/geoserver/AngularAppSpring/wms?`,
        params: {
          'LAYERS': 'AngularAppSpring:ORTOFOTOMAPA',
          'TILED': true,
          'VERSION': '1.1.1',
        },
        serverType: 'geoserver',
        transition: 300,
        crossOrigin: 'anonymous',
      }),
      visible: true,
    });

    this.commonLayer = new TileLayer({
      source: new TileWMS({
        url: `${window.location.origin}/geoserver/AngularAppSpring/wms?`,
        params: {
          'LAYERS': 'AngularAppSpring:Ogolnogeograficzna',
          'TILED': true,
          'VERSION': '1.1.1',
        },
        serverType: 'geoserver',
        transition: 300,
        crossOrigin: 'anonymous',
      }),
      visible: true,
    });
    this.budLayer = new TileLayer({
      source: new TileWMS({
        url: `${window.location.origin}/geoserver/AngularAppSpring/wms?`,
        params: {
          'LAYERS': 'AngularAppSpring:budynki', 
          'TILED': true,
          'VERSION': '1.1.1',
        },
        serverType: 'geoserver',
        transition: 300,
        crossOrigin: 'anonymous',
      }),
      visible: true,
    });


    this.map = new Map({
      target: 'map',
      layers: [
        this.osmLayer,
        this.ortoLayer,
        this.commonLayer,
        this.budLayer,
        this.boundsLayerPanstwo,
        this.boundsLayerWojewodz,
        this.boundsLayerPowiaty,
        this.boundsLayerGminy,
        this.boundsLayerCities,
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([19.3, 52.2]),
        zoom: 7,
      }),
    });

    this.map.on('singleclick', (event) => {
      if (this.infoToggleService.isInfoClicked()) {
        console.log('kliknięto', event.coordinate);
        const viewResolution = this.map.getView().getResolution();
        if (!viewResolution) return;

        let matchedAny = false;

        this.map.getLayers().forEach((layer) => {
          if (layer instanceof TileLayer && layer.getVisible()) {
            const source = layer.getSource();
            if (source instanceof TileWMS) {
              matchedAny = true;
              const url = source.getFeatureInfoUrl(
                event.coordinate,
                viewResolution,
                'EPSG:3857',
                { INFO_FORMAT: 'application/json' }
              );
              console.log('GetFeatureInfo URL:', url);
              if (url) {
                fetch(url)
                  .then((response) => response.json())
                  .then((data) => {
                    console.log('WMS Feature Info:', data);
                  })
                  .catch((error) => {
                    console.error('Error fetching WMS Feature Info:', error);
                  });
              }
            }
          }
        });

        console.log('Czy trafiono w jakąś warstwę WMS?', matchedAny);
      } else {
        console.log('Info toggle is not active. Click ignored.');
      }
    });
  }

  private tileLayer(visibleLayer: LayerKey, layerName: string): TileLayer {
    const visibility = this.mapLayersVisibility.layersVisibility();
    return new TileLayer({
      source: new TileWMS({
        url: `${window.location.origin}/geoserver/AngularAppSpring/wms?`,
        params: {
          'LAYERS': `AngularAppSpring:${layerName}`,
          'TILED': true,
          'VERSION': '1.1.1',
        },
        serverType: 'geoserver',
        transition: 300,
        crossOrigin: 'anonymous',
      }),
      visible: visibility[visibleLayer],
    });
  }

  private buildVectorLayer(): VectorLayer {
    const wfsUrl =
      `${window.location.origin}/geoserver/AngularAppSpring/ows?` +
      `service=WFS&version=1.0.0&request=GetFeature` +
      `&typeName=AngularAppSpring:sql_data` +
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
      style: (feature, resolution) => this.decimatedStyle(feature, resolution),
      updateWhileAnimating: false,
      updateWhileInteracting: false,
    });
  }

  private decimatedStyle(feature: FeatureLike, resolution: number): Style | undefined {
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
          text: feature.get('nazwa'),
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