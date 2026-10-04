import { inject, Service, signal } from '@angular/core';
import { AMService } from '../a-m-service/a-m-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { fromLonLat } from 'ol/proj';

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
      console.log('Response from getLayerSQLData:', responseData);
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
}
