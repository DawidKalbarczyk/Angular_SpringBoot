import { inject, Service, signal } from '@angular/core';
import { AMService } from '../a-m-service/a-m-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { fromLonLat, transformExtent } from 'ol/proj';
import Style from 'ol/style/Style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import TileLayer from 'ol/layer/Tile';
import VectorImageLayer from 'ol/layer/VectorImage';
import Map from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';

type Thumbnail = [HTMLImageElement, string, string, string, string, string];
interface LayerRow {
  ogc_fid: number;
  wkb_geometry: {
    type: string;
    coordinates: any;
  } | null;
  [key: string]: unknown;
}

@Service()
export class HistoryService {
    public thumbnailArray = signal<Thumbnail[]>([]);
    public isLoading = signal<boolean>(true);
    public AMService = inject(AMService);
    public layerNames = signal<string[]>([]);

    public pointLayerPopulationQuantity = signal<number>(0);
    public pointObjectPopulationQuantity = signal<number>(0);
    public pointObjectPopulationClicked = signal<boolean>(false);
    public pointObjectPopulationName = signal<string>('');

    private oldUserId = signal<string>('');
    private oldTime = signal<string>('');


    public async setThumbnails(): Promise<void> {
    const bboxArray = await this.AMService.getLayerBBox();
    console.log('bboxArray:', bboxArray);
    const thumbnailArrayTemp: Thumbnail[] = [];
    
    bboxArray.forEach((item) => {
      const [minX3857, minY3857] = fromLonLat([item.bbox.minx, item.bbox.miny]);
      const [maxX3857, maxY3857] = fromLonLat([item.bbox.maxx, item.bbox.maxy]);

      const midX = (minX3857 + maxX3857) / 2;
      const midY = (minY3857 + maxY3857) / 2;

      const spanX = Math.max(maxX3857 - minX3857, 1000);
      const spanY = Math.max(maxY3857 - minY3857, 1000);
      let maxSpan: number;
      if (item.layer === 'vectorLayer') {
        maxSpan = Math.max(spanX, spanY) * 1.65;
      } else { 
        maxSpan = Math.max(spanX, spanY) * 1.3; //padding bboxa
      }
      const halfSpan = maxSpan / 2;

      const minX = Math.round(midX - halfSpan);
      const maxX = Math.round(midX + halfSpan);
      const minY = Math.round(midY - halfSpan);
      const maxY = Math.round(midY + halfSpan);

      const layers = `AngularLocal:OSM-WMS,user_${item.userId}:user_${item.userId}_perm_table_${item.time}`;
      const WMSurl = `/geoserver/wms?service=WMS&version=1.1.0`
        + `&request=GetMap&layers=${layers}`
        + `&bbox=${minX},${minY},${maxX},${maxY}`
        + `&width=500&height=500&srs=EPSG:3857&format=image/png`;

      const title = item.title;
      const type = item.type; 

      const Img = new Image();
      Img.src = WMSurl;
      Img.onload = () => {
        console.log('Image loaded successfully');
      };
      Img.onerror = () => {
        console.error('Error loading image');
      };
      thumbnailArrayTemp.push([Img, title, type, item.userId, item.time, item.layer]);
    });

    thumbnailArrayTemp.sort((a, b) => Number(b[4]) - Number(a[4]))
    this.thumbnailArray.set(thumbnailArrayTemp);
    this.isLoading.set(false);
  }


  public transformThumbnailType(type: string): string {
    switch (type) {
      case 'selectedObjByHand':
          return 'HISTORY.INNER.LEFT-SECTION.LAYER-TITLE.SELECTED-OBJ-BY-HAND';
        case 'selectedObjByAttributeAnalysis':
          return 'HISTORY.INNER.LEFT-SECTION.LAYER-TITLE.SELECTED-OBJ-BY-ATTRIBUTE-ANALYSIS';
        case 'selectedObjBySpatialAnalysis':
          return 'HISTORY.INNER.LEFT-SECTION.LAYER-TITLE.SELECTED-OBJ-BY-SPATIAL-ANALYSIS';
        default:
          return 'HISTORY.INNER.LEFT-SECTION.ERROR';
    }
  }

  private http = inject(HttpClient);
  public async getLayerSQLData(tableName: string): Promise<LayerRow[]> {
    try {
      const responseData = await firstValueFrom(this.http.get<{ data: LayerRow[] }>((`/history-service/get-history?tableName=${tableName}`)));
      return responseData.data;
        
    } catch (error) {
      console.error('Error fetching layer SQL data:', error);
      throw error;
    }
  }

  public selectedThumbnail = signal<any | null>(null);

  public selectThumbnail(thumbnailSrc: any): void {
    this.selectedThumbnail.set(thumbnailSrc);
  }








  private map: Map | null = null;
  public async startZoom(
    map: Map,
    geometry: LayerRow['wkb_geometry'],
    objectName: string,
    layer: VectorImageLayer | TileLayer,
    bboxItem: any
  ): Promise<void> {
    this.map = map;
    await this.highlightSelectedObject(geometry, objectName, layer, bboxItem);
  }

  private highlightSource = new VectorSource();
  private hasZoomedAlready = signal<boolean>(false);





  


  public unhighlightSelectedObject(geomType: string): void {
    if (!this.map) {
      console.error('Map instance is not yet set');
      return;
    }
    this.highlightSource.clear();
    this.hasZoomedAlready.set(false);
    this.pointObjectPopulationName.set('');
    this.removeHighlightLayers();
  }

  public async highlightSelectedObject(wkb_geometry: any, objectName: string, layer: VectorImageLayer | TileLayer, bboxItem: any): Promise<void> {
    this.oldTime.set(bboxItem.time);
    this.oldUserId.set(bboxItem.userId);
    switch (wkb_geometry?.type) {
      case 'Point':
        const activateHiglight = () => {
          this.matchVectorData(layer, objectName);
          this.map?.addLayer(this.returnHighlightedVectorLayer());
          this.zoomToObject(wkb_geometry, bboxItem);
          
        }
        
        if (this.hasZoomedAlready() === true ) {
          setTimeout(() => {
            activateHiglight();
          }, 1000);
          this.zoomOutObject(bboxItem);
        } else {
          this.hasZoomedAlready.set(true);
          activateHiglight();
        }
        
        break;
      case 'Polygon':
        // Zrobione 50/50 ja i AI. W przypadku ociążenia wyjebać to i przejść na SpringBoot.
        await this.matchTileLayerData(bboxItem, objectName);
        break;
      default:
        console.error('Unknown geometry type', wkb_geometry);
    }

  }

  private async matchTileLayerData(bboxItem: any, objectName: string): Promise<void> {
    const WFSurl = `/geoserver/wfs?service=`
    + `WFS&version=1.0.0&request=GetFeature&typeName=user_${bboxItem.userId}:user_${bboxItem.userId}_perm_table_${bboxItem.time}`
    + `&outputFormat=application/json&srsName=EPSG:4326`;

    const data: any = await firstValueFrom(this.http.get(WFSurl));
    const format = new GeoJSON();
    const features = format.readFeatures(data, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    const match = features.find((feature) =>
      (feature.get('jpt_nazwa_') || feature.get('nazwa')) === objectName
    );

    if (!match) {
      console.warn('No matching polygon found for objectName:', objectName);
      return;
    }

    this.pointObjectPopulationName.set(objectName);
    this.removeHighlightLayers();
    this.highlightSource.clear();
    match.set('highlighted', true);
    this.highlightSource.addFeature(match);
    this.map?.addLayer(this.returnHighlightedPolygonLayer());

    const geometry = match.getGeometry();
    if (geometry) {
      this.map?.getView().fit(geometry.getExtent(), {
        padding: [100, 100, 100, 100],
        maxZoom: 15,
        duration: 1000,
      });
    }
  }

  private removeHighlightLayers(): void {
    this.map?.getLayers().forEach((layer) => {
      if (layer.get('name') === 'highlightLayer') {
        this.map?.removeLayer(layer);
      }
    });
  }




  private matchVectorData(vectorPointLayer: VectorImageLayer | TileLayer, objectName: string): void {
    const source = vectorPointLayer instanceof VectorImageLayer ? vectorPointLayer.getSource() : undefined;

    if (!source) {
      console.error('Vector layer source is undefined');
      return;
    }

    this.highlightSource.clear();

    const features = source.getFeatures();

    const match = features.find((feature: any) => feature.get('nazwa') === objectName);

    if (match) {
      match.set('highlighted', true);
      const clone = match.clone();
      this.highlightSource.addFeature(clone);
    } else {
      console.warn('No matching feature found for objectName:', objectName);
    }
    
  }

  private returnHighlightedVectorLayer(): VectorLayer {
    return new VectorLayer({
      source: this.highlightSource,
      zIndex: 9999,
      properties: { name: 'highlightLayer' },
      style: (feature) => {
        return new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({ color: '#ffc333' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
          }),
          text: new Text({
            text: feature.get('nazwa'),
            offsetY: -25,
            font: 'bold 25px Roboto Flex',
            stroke: new Stroke ({ color: '#fff', width: 5 }),
          })
        })
      }
    })
  }

  private returnHighlightedPolygonLayer(): VectorLayer {
    return new VectorLayer({
      source: this.highlightSource,
      zIndex: 9999,
      properties: { name: 'highlightLayer' },
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 195, 51, 0.35)' }),
        stroke: new Stroke({ color: '#ffc333', width: 4 }),
      }),
    });
  }

  private coordinates = signal<[number, number]>([0, 0]);

  private fitToLayer(item: any): void {
    const extent = transformExtent(
      [item.bbox.minx, item.bbox.miny, item.bbox.maxx, item.bbox.maxy], 
      'EPSG:4326', 'EPSG:3857');
    if (item.layer === 'vectorLayer') {
      this.map?.getView().fit(extent, {
        padding: [100, 100, 100, 100],
        maxZoom: 15,
        duration: 1000
      })
    } else { 
      this.map?.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 15,
        duration: 1000
      })
    }
  }
  private zoomToObject(wkb_geometry: any, bboxItem: any): void {
    console.log("YEAEAWAEWAH"+ wkb_geometry.coordinates);
    if (!this.map) {
      console.error('Map instance is not yet set');
      return;
    }
    this.coordinates.set([wkb_geometry.coordinates[0], wkb_geometry.coordinates[1]]);
    this.map?.getView().animate({
      center: fromLonLat(this.coordinates()),
      zoom: 12,
      duration: 1000
    });
  }

  public zoomOutObject(bboxItem: any): void {
    if (!this.map) {
      console.error('Map instance is not yet set');
      return;
    }
    this.fitToLayer(bboxItem);
  }

  










  /// GEOPORTAL TEMP
  public layerToPass = signal<TileLayer | VectorImageLayer | null>(null);
  public setLayerToPass(layer: TileLayer | VectorImageLayer): void {
    this.layerToPass.set(layer);
  }

  public clearLayerToPass(): void {
    this.layerToPass.set(null);
  }
}
