import { AfterViewInit, Component, inject,  OnInit,  signal } from '@angular/core';
import { Router } from '@angular/router';
import { AMService } from '../../../services/a-m-service/a-m-service';
import { HistoryService } from '../../../services/history-service/history-service';
import { RouterLink } from '@angular/router';
import { getAuth } from '@firebase/auth';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import VectorImageLayer from 'ol/layer/VectorImage';
import { ObjSelection } from '../../../services/obj-selection/obj-selection';
import { fromLonLat, transformExtent } from 'ol/proj';
import { ActivatedRoute } from '@angular/router';
import { Redirect } from '../../../global-components/redirect/redirect';
import { LoginService } from '../../../services/login-service/login-service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { DarkMode } from '../../../services/dark-mode/dark-mode';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import CircleStyle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';

@Component({
  selector: 'app-history-inner',
  imports: [RouterLink, MatProgressSpinnerModule, Redirect, TranslatePipe],
  templateUrl: './history-inner.html',
  styleUrl: './history-inner.scss',
})
export class HistoryInner implements OnInit, AfterViewInit {
  public historyService = inject(HistoryService);
  public objectSelection = inject(ObjSelection);
  public loginService = inject(LoginService);
  private route = inject(ActivatedRoute);
  public userId = '';
  public time = '';
  public isDarkMode = inject(DarkMode).isDarkMode;

  public responseDataPresent = signal<boolean>(true);
  public responseData = signal<any>(null);
  async ngOnInit(): Promise<void> {
    const auth = getAuth();
    await auth.authStateReady();
    const authUserId = auth.currentUser?.uid;
    if (authUserId) {
      this.route.paramMap.subscribe(async (params) => {
        this.responseDataPresent.set(false);
        this.userId = params.get('userId') || '';
        this.time = params.get('time') || '';
        const fetchData = await this.fetchLayerInfo();
        const tableName = fetchData.featureType.name;
        this.responseData.set(await this.historyService.getLayerSQLData(tableName));
        this.responseData() ? this.responseDataPresent.set(true) : this.responseDataPresent.set(false);
      
        await this.refreshMap(this.responseData()[0]?.wkb_geometry?.type);
        this.responseDataPresent.set(true);

      });
    }
    
  }

  public AMService = inject(AMService);

  public async fetchLayerInfo(): Promise<any> {
    const data = await this.AMService.getLayerData(this.userId, this.time);
    console.log('Layer info:', data);
    return data;
  }

  public getDate(date: string = this.time): Date | string {
    return new Date(parseInt(date)).toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  public translateLayerName(func: string, text: string): string {
    if (func === 'layerType') {
      switch (text) {
        case 'Polygon':
          return 'HISTORY.INNER.LEFT-SECTION.LAYER-TYPES.POLYGON';
        case 'Point':
          return 'HISTORY.INNER.LEFT-SECTION.LAYER-TYPES.POINT';
        default:
          return 'HISTORY.INNER.LEFT-SECTION.ERROR';
      }
    } else if (func === 'selectionType') {
      switch (text) {
        case 'selectedObjByHand':
          return 'HISTORY.INNER.LEFT-SECTION.SELECTION-TYPE.MANUAL-SELECTION';
        case 'selectedObjByAttributeAnalysis':
          return 'HISTORY.INNER.LEFT-SECTION.SELECTION-TYPE.ATTRIBUTE-ANALYSIS';
        case 'selectedObjBySpatialAnalysis':
          return 'HISTORY.INNER.LEFT-SECTION.SELECTION-TYPE.SPATIAL-ANALYSIS';
        default:
          return 'HISTORY.INNER.LEFT-SECTION.ERROR';
      }
    } else if (func === 'layerFrom') {
      switch (text) {
        case 'boundsLayerWojewodz': 
          return 'GEOPORTAL.INFO-CONTENT.LAY5';
        case 'boundsLayerPowiaty': 
          return 'GEOPORTAL.INFO-CONTENT.LAY4';
        case 'boundsLayerGminy': 
          return 'GEOPORTAL.INFO-CONTENT.LAY3';
        case 'boundsLayerPanstwo': 
          return 'GEOPORTAL.INFO-CONTENT.LAY6';
        case 'boundsLayerCities': 
          return 'GEOPORTAL.INFO-CONTENT.LAY2';
        case 'vectorLayer': 
          return 'GEOPORTAL.INFO-CONTENT.LAY1';
        default:
          return 'HISTORY.INNER.LEFT-SECTION.ERROR';
      }
    } 
    return 'HISTORY.INNER.LEFT-SECTION.ERROR';
  }












  // Map component
  private thumbnailMap!: Map;
  private osmLayer!: TileLayer
  private objectLayerPolygon!: TileLayer;
  private objectLayerPoint!: VectorImageLayer;

  public title = signal<string>('');
  public type = signal<string>('');

  public get currentThumbnail() {
    console.log('ThumbnailArray: ', this.historyService.thumbnailArray());
    return this.historyService.thumbnailArray().find(
      t => t[3] === this.userId && t[4] === this.time
    ) ?? null;
  }
  public async refreshMap(geometryType: string): Promise<void> {
    if (!this.thumbnailMap) return;

    const bboxArray = await this.AMService.getLayerBBox();
    const item = bboxArray.find(item => item.time === this.time && item.userId === this.userId);

    if (geometryType === 'Polygon') {
      (this.objectLayerPolygon.getSource() as TileWMS).updateParams({
        'LAYERS': `user_${this.userId}:user_${this.userId}_perm_table_${this.time}`,
      });
    } else if (geometryType === 'Point') {
      const newUrl = `${window.location.origin}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=user_${this.userId}:user_${this.userId}_perm_table_${this.time}&outputFormat=application/json`;
      const pointSource = this.objectLayerPoint.getSource() as VectorSource;
      pointSource.setUrl(newUrl);
      pointSource.refresh();
    }
    
    if (item) {
      this.title.set(item.title);
      this.type.set(item.type);
      const extent = transformExtent(
        [item.bbox.minx, item.bbox.miny, item.bbox.maxx, item.bbox.maxy], 
        'EPSG:4326', 'EPSG:3857');
      if (item.layer === 'vectorLayer') {
        this.thumbnailMap.getView().fit(extent, {
          padding: [150, 150, 150, 150],
          maxZoom: 15,
        })
      } else { 
        this.thumbnailMap.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 15,
        })
      }
    }
    this.checkLayerType(); 
    
  }
  private checkLayerType(): void {
    const isPoint = this.responseData()?.[0]?.wkb_geometry?.type === 'Point'
      || this.currentThumbnail?.[5] === 'vectorLayer';

    if (isPoint) {
      this.objectLayerPolygon.setVisible(false);
      this.objectLayerPoint.setVisible(true);
    } else {
      this.objectLayerPolygon.setVisible(true);
      this.objectLayerPoint.setVisible(false);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const bboxArray = await this.AMService.getLayerBBox();
    let viewCenter: number[] = [0, 0];
    bboxArray.forEach((item) => {
      if (item.time === this.time && item.userId === this.userId) {
        viewCenter = fromLonLat([(item.bbox.minx + item.bbox.maxx) / 2, (item.bbox.miny + item.bbox.maxy) / 2]);
      }
    });
    this.osmLayer = new TileLayer({
      source: new OSM({attributions: []})
    });
    
    this.objectLayerPolygon = new TileLayer({
      source: new TileWMS({
        url: `${window.location.origin}/geoserver/user_${this.userId}/wms?`,
        params: {
          'LAYERS': `user_${this.userId}:user_${this.userId}_perm_table_${this.time}`,
          'TILED': true,
          'STYLES': '',
          'VERSION': '1.1.0',
          'BUFFER': 100,
          // 'SLD_BODY': this.objectSelection.getSLD(this.userId, this.time, 'polygon')
        },
        serverType: 'geoserver',
        hidpi: false,
        transition: 300,
        crossOrigin: 'anonymous'
      }),
      visible: true
    });


    this.objectLayerPoint = new VectorImageLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: `${window.location.origin}/geoserver/wfs?` +
          `service=WFS&version=1.1.0&request=GetFeature` +
          `&typeName=user_${this.userId}:user_${this.userId}_perm_table_${this.time}` +
          `&outputFormat=application/json`
      }),
      style: (feature) => {
        return new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({
              color: 'rgba(230,57,70,0.6)'
            }),
            stroke: new Stroke({
              color: '#000000',
              width: 2
            })
          }),
          text: new Text({
            text: feature.get('nazwa') ?? '',
            font: 'bold 25px Arial',
            offsetY: -25,
            fill: new Fill({
              color: '#000000'
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2
            })
          })
        })
      },
      visible: true,
      declutter: false
    });
    
    this.checkLayerType();
    this.thumbnailMap = new Map({
      target: 'thumbnail-map',
      controls: [],
      layers: [
        this.osmLayer,
        this.objectLayerPolygon,
        this.objectLayerPoint
      ],
      view: new View({
        center: viewCenter
      })
    });

    // Handling auto zoom
    const item = bboxArray.find(item => item.time === this.time && item.userId === this.userId);
    if (item) {
      this.title.set(item.title);
      this.type.set(item.type);
      const extent = transformExtent(
        [item.bbox.minx, item.bbox.miny, item.bbox.maxx, item.bbox.maxy], 
        'EPSG:4326', 'EPSG:3857');
      if (item.layer === 'vectorLayer') {
        this.thumbnailMap.getView().fit(extent, {
          padding: [150, 150, 150, 150],
          maxZoom: 15,
        })
      } else { 
        this.thumbnailMap.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 15,
        })
      }
    }
  }

}
