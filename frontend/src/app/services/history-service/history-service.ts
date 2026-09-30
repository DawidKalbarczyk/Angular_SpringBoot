import { inject, Service, signal } from '@angular/core';
import { AMService } from '../a-m-service/a-m-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type Thumbnail = [HTMLImageElement, string, string, string, string];
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


    public async setThumbnails(): Promise<void> {
    const bboxArray = await this.AMService.getLayerBBox();
    console.log('bboxArray:', bboxArray);
    const thumbnailArrayTemp: Thumbnail[] = [];
    
    bboxArray.forEach((item) => {
      const WMSurl = `/geoserver/wms?service=WMS&version=1.1.0
      &request=GetMap&layers=AngularLocal:OSM-WMS,user_${item.userId}:user_${item.userId}_perm_table_${item.time}
      &bbox=${item.bbox.minx - 0.5},${item.bbox.miny - 0.5},${item.bbox.maxx + 0.5},${item.bbox.maxy + 0.5}&width=500
      &height=500&srs=EPSG:4326&format=image/png`

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
      thumbnailArrayTemp.push([Img, title, type, item.userId, item.time]);
    });

    thumbnailArrayTemp.sort((a, b) => Number(b[4]) - Number(a[4]))
    this.thumbnailArray.set(thumbnailArrayTemp);
    this.isLoading.set(false);
  }


  public transformThumbnailType(type: string): string {
    switch (type) {
      case 'selectedObjByHand':
        return 'Ręcznie wybrane';
      default:
        return 'Nieznany typ';
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
