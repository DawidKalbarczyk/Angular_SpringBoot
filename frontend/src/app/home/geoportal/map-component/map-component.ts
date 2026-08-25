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
import { InfoFeatures } from '../../../services/info-features/info-features';
import { ZoomToObject } from '../../../services/zoom-to-object/zoom-to-object';


@Component({
  selector: 'app-map-component',
  imports: [InfoComponent],
  templateUrl: './map-component.html',
  styleUrl: './map-component.scss',
})
export class MapComponent implements AfterViewInit {
  private mapLayersVisibility = inject(LayerVisibility);
  private infoToggleService = inject(InfoToggle);
  public infoProperties = inject(InfoFeatures);

  private osmLayer!: TileLayer;
  private ortoLayer!: TileLayer;
  private budLayer!: TileLayer;
  private boundsLayerCities!: TileLayer;
  private boundsLayerGminy!: TileLayer;
  private boundsLayerPowiaty!: TileLayer;
  private boundsLayerWojewodz!: TileLayer;
  private boundsLayerPanstwo!: TileLayer;
  public map!: Map;
  private vectorLayer!: VectorLayer;
  private vectorSource!: VectorSource;
  private zoomToObject = inject(ZoomToObject);

  constructor() {
    effect(() => {
      const visibility = this.mapLayersVisibility.layersVisibility();
      this.vectorLayer?.setVisible(visibility.vectorLayer);
      this.osmLayer?.setVisible(visibility.osmLayer);
      this.ortoLayer?.setVisible(visibility.ortoLayer);
      this.budLayer?.setVisible(visibility.budLayer);
      this.boundsLayerCities?.setVisible(visibility.boundsLayerCities);
      this.boundsLayerGminy?.setVisible(visibility.boundsLayerGminy);
      this.boundsLayerPowiaty?.setVisible(visibility.boundsLayerPowiaty);
      this.boundsLayerWojewodz?.setVisible(visibility.boundsLayerWojewodz);
      this.boundsLayerPanstwo?.setVisible(visibility.boundsLayerPanstwo);
    });
  }

  ngAfterViewInit(): void {
    this.osmLayer = new TileLayer({
      source: new OSM({attributions:[]}),
    });

    this.ortoLayer = this.tileLayer('ortoLayer', 'ORTOFOTOMAPA');
    this.budLayer = this.tileLayer('budLayer', 'budynki');
    this.boundsLayerPanstwo = this.tileLayer('boundsLayerPanstwo', 'boundspanstwo');
    this.boundsLayerWojewodz = this.tileLayer('boundsLayerWojewodz', 'boundswojewodz');
    this.boundsLayerPowiaty = this.tileLayer('boundsLayerPowiaty', 'boundspowiaty');
    this.boundsLayerGminy = this.tileLayer('boundsLayerGminy', 'boundsgminy');
    this.boundsLayerCities = this.tileLayer('boundsLayerCities', 'boundscities');
    this.vectorLayer = this.buildVectorLayer();

    this.zoomToObject.vectorLayer(this.vectorLayer);

    this.map = new Map({
      target: 'map',
      controls: [],
      layers: [
        this.osmLayer,
        this.ortoLayer,
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
    this.zoomToObject.setMap(this.map);
    
    this.map.on('singleclick', (event) => {
      if (this.infoToggleService.isInfoClicked()) {
        this.infoProperties.clear(); // Reset properties before fetching new data
        this.infoProperties.isInfoReady.set(false); // Reset info ready state before fetching new data

        const viewResolution = this.map.getView().getResolution();
        if (!viewResolution) {
          this.infoProperties.isInfoReady.set(true); // Set info ready state to true if resolution is not available
          return;
        }

        let matchedAny = false;

        const requests: Promise<void>[] = [];

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

              if (url) {
                const request = fetch(url)
                  .then((response) => response.json())
                  .then((data) => {
                    console.log('WMS Dane DATA dla debugu:', data);
                    if (data.features && data.features.length > 0 && data.features[0].id) {
                      this.infoProperties.updateLayerWithId(data.features[0].id);
                      console.log('Zebrane ID warstwy:', this.infoProperties.layerWithId());
                    } else {
                      console.log('Layer doesnt have an ID or features are missing:', data);
                    }
                    if (data.features && data.features.length > 0) {
                      data.features.forEach((feature: any) => {
                        this.infoProperties.updateProperties([feature.properties]);
                      });
                      console.log('Zebrane właściwości:', this.infoProperties.properties());
                    } else {
                      console.log('No features found at this location.');
                    }
                    console.log('WMS Feature Info NO IF:', data);
                  })
                  .catch((error) => {
                    console.error('Error fetching WMS Feature Info:', error);
                  });
                requests.push(request);
              }
            }
          }
        });
        Promise.all(requests).then(() => {
          this.infoProperties.isInfoReady.set(true); // Set the info ready state after fetching data
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
        // url: `${window.location.origin}/geoserver/AngularLocal/wms?`,
        params: {
          //'LAYERS': `AngularAppSpring:${layerName}`,
          'LAYERS': `AngularLocal:${layerName}`,
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

    // const wfsUrl = `${window.location.origin}/geoserver/AngularLocal/ows?` +
    //   `service=WFS&version=1.0.0&request=GetFeature` +
    //   `&typeName=AngularLocal:sql_data` +
    //   `&outputFormat=application/json&srsname=EPSG:3857`;

    this.vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: wfsUrl,
    });

    // Po załadowaniu danych nadaj każdemu obiektowi stabilny indeks
    this.vectorSource.once('featuresloadend', () => {
      const features = this.vectorSource.getFeatures();

      features.sort((a, b) => {
        const popA = Number(a.get('liczbamies')) || 0;
        const popB = Number(b.get('liczbamies')) || 0;
        return popB - popA; 
      });

      features.forEach((f, i) => f.set('__idx', i));
    });

    return new VectorLayer({
      source: this.vectorSource,
      visible: this.mapLayersVisibility.isVisible('vectorLayer'),
      style: (feature, resolution) => this.decimatedStyle(feature, resolution),
      updateWhileAnimating: false,
      updateWhileInteracting: false,
      declutter: true,
    });
  }

  private isHighlightedService = this.zoomToObject.isHighlightedService;
  private readonly ALWAYS_SHOW_TOP_N = 60;
  private decimatedStyle(feature: FeatureLike, resolution: number): Style | undefined {
    const idx = feature.get('__idx') ?? 0;
    const isHighlighted = feature.get('highlighted') === true;

    if (isHighlighted && this.isHighlightedService()) {
      return new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
        }),
        text: new Text({
          text: feature.get('nazwa'),
          offsetY: -35,
          font: 'bold 35px Roboto Flex',
        }),
        zIndex: 9999
      })
    }

    const skip = this.getSkipFactor(resolution);
    const isGuaranteed = idx < this.ALWAYS_SHOW_TOP_N;
    if (!isGuaranteed && (idx % skip !== 0)) {
      return undefined; 
    }

    const showLabel = resolution < 350; 
    const population = Number(feature.get('liczbamies')) || 0;
    const {radius, fontSize} = this.getSizeByPopulatiuon(population);

    return new Style({
      image: new CircleStyle({
        radius,
        fill: new Fill({ color: '#3399CC' }),
        stroke: new Stroke({ color: '#fff', width: 1.5 }),
      }),
      text: showLabel
        ? new Text({
          text: feature.get('nazwa'),
          offsetY: -(radius + 10),
          font: `${fontSize}px Roboto Flex`,
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
        })
        : undefined,
      zIndex: population,
    });
  }

  private getSizeByPopulatiuon(population: number): { radius: number; fontSize: number } {
    const minPop = 0;
    const maxPop = 1_000_000;
    const minRadius = 3;
    const maxRadius = 10;
    const minFont = 13;
    const maxFont = 25;

    const t = Math.min(1, Math.max(minPop, population / maxPop));

    const radius = minRadius + t * (maxRadius - minRadius);
    const fontSize = minFont + t * (maxFont - minFont);

    return { radius, fontSize: Math.round(fontSize) };
  }

  private getSkipFactor(resolution: number): number {
    if (resolution > 3000) return 100;  
    if (resolution > 1500) return 50;
    if (resolution > 750) return 25;
    if (resolution > 350) return 10;
    if (resolution > 200) return 5;
    if (resolution > 100) return 2;
    return 1;
  }


}