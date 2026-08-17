import { AfterViewInit, Component } from '@angular/core';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { TileWMS } from 'ol/source';



@Component({
  selector: 'app-map-component',
  imports: [],
  templateUrl: './map-component.html',
  styleUrl: './map-component.scss',
})
export class MapComponent implements AfterViewInit {
  private osmLayer!: TileLayer;
  private map!: Map;
  private GeoserverLayer!: TileLayer;
  private baseGeoserverUrl: string = `${window.location.origin}/geoserver/AngularAppSpring/wms?`;



  ngAfterViewInit(): void {

    this.osmLayer = new TileLayer({
      source: new OSM(),
    });


    this.GeoserverLayer = new TileLayer({
      source: new TileWMS({
        url: this.baseGeoserverUrl,
        params: {
          'LAYERS': 'AngularAppSpring:sql_data',
          'TILED': true,
          'VERSION': '1.1.0'
        },
        serverType: 'geoserver',
        transition: 300,
        crossOrigin: 'anonymous'
      }),
      visible: true
    })

    this.map = new Map({
      target: 'map',
      layers: [
        this.osmLayer,
        this.GeoserverLayer
      ],
      view: new View({
        center: fromLonLat([19.3, 52.2]),
        zoom: 7,
      }),
    });

    
  }
}
