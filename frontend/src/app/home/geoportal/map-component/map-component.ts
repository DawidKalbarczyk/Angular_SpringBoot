import { AfterViewInit, Component } from '@angular/core';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

@Component({
  selector: 'app-map-component',
  imports: [],
  templateUrl: './map-component.html',
  styleUrl: './map-component.scss',
})
export class MapComponent implements AfterViewInit {
  private osmLayer!: TileLayer;
  private map!: Map;
  private vectorLayer!: VectorLayer;
  private baseGeoserverUrl: string = `${window.location.origin}/geoserver/AngularAppSpring/wms?`;

  ngAfterViewInit(): void {
    this.osmLayer = new TileLayer({
      source: new OSM(),
    });

    this.vectorLayer = this.buildVectorLayer();

    this.map = new Map({
      target: 'map',
      layers: [
        this.osmLayer,
        this.vectorLayer,
      ],
      view: new View({
        center: fromLonLat([19.3, 52.2]),
        zoom: 7,
      }),
    });
  }

  private buildVectorLayer(): VectorLayer {
    const wfsUrl =
      `${window.location.origin}/geoserver/AngularAppSpring/ows?` +
      `service=WFS&version=1.0.0&request=GetFeature` +
      `&typeName=AngularAppSpring:sql_data` +
      `&outputFormat=application/json&srsname=EPSG:3857`;

    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: wfsUrl,
    });

    return new VectorLayer({
      source: vectorSource,
      style: (feature) =>
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: '#3399CC' }),
            stroke: new Stroke({ color: '#fff', width: 1.5 }),
          }),
          text: new Text({
            text: feature.get('nazwa'),
            offsetY: -12,
            font: '15px Arial',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
          }),
        }),
    });
  }
}