import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { ReturnCorner } from '../../../../global-components/return-corner/return-corner';
import TileLayer from 'ol/layer/Tile';
import VectorImageLayer from 'ol/layer/VectorImage';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import { HistoryService } from '../../../../services/history-service/history-service';
import { AMService } from '../../../../services/a-m-service/a-m-service';
import { getAuth } from 'firebase/auth';
import { ActivatedRoute } from '@angular/router';
import { transformExtent } from 'ol/proj';

@Component({
  selector: 'app-geoportal-temp',
  imports: [ReturnCorner],
  templateUrl: './geoportal-temp.html',
  styleUrl: './geoportal-temp.scss',
})
export class GeoportalTemp implements OnInit, AfterViewInit {
  private historyService = inject(HistoryService);
  private AMService = inject(AMService);
  private route = inject(ActivatedRoute);
  public userId: string = '';
  public time: string = '';

  private geoportalTempMap!: Map;
  private osmLayer!: TileLayer;
  private objectLayerPolygon!: TileLayer;
  private objectLayerPoint!: VectorImageLayer;



  async ngOnInit(): Promise<void> {
    const auth = getAuth();
    await auth.authStateReady();
    const authUserId = auth.currentUser?.uid;
    if (authUserId) {
      this.route.paramMap.subscribe((params) => {
        this.userId = params.get('userId') || '';
        this.time = params.get('time') || '';
      });
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.osmLayer = new TileLayer({
      source: new OSM({ attributions: [] }),
    });

    const layer = this.historyService.layerToPass();
    if (layer instanceof TileLayer) {
      this.objectLayerPolygon = layer;
    } else if (layer instanceof VectorImageLayer) {
      this.objectLayerPoint = layer;
    }


    this.geoportalTempMap = new Map({
      target: 'geoportalTemp',
      controls: [],
      layers: [
        this.osmLayer, 
        this.objectLayerPolygon || this.objectLayerPoint]
    });


    if (!this.geoportalTempMap) return;

    const bboxArray = await this.AMService.getLayerBBox();
    const item = bboxArray.find((item) => item.time === this.time && item.userId === this.userId);

    if (item) {
      const extent = transformExtent(
        [item.bbox.minx, item.bbox.miny, item.bbox.maxx, item.bbox.maxy],
        'EPSG:4326', 'EPSG:3857');
      if (layer === this.objectLayerPolygon) {
        this.geoportalTempMap.getView().fit(
          extent, 
          { 
            padding: [200, 200, 200, 200],
            maxZoom: 13 
          });
      } else if (layer === this.objectLayerPoint) {
        this.geoportalTempMap.getView().fit(
          extent, 
          { 
            padding: [150*2, 150*2, 150*2, 150*2],
            maxZoom: 15
          });
      }
    }
    
  }
}
