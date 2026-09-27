import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AMService } from '../../../services/a-m-service/a-m-service';

type Thumbnail = [string, string, string]; // Define a tuple type for thumbnail and title

@Component({
  selector: 'app-history-main',
  imports: [RouterLink],
  templateUrl: './history-main.html',
  styleUrl: './history-main.scss',
})
export class HistoryMain {
  private AMService = inject(AMService);
  public thumbnailArray = signal<Thumbnail[]>([]);

  constructor() {
    this.setThumbnails();
  }
  
  public transformThumbnailType(type: string): string {
    switch (type) {
      case 'selectedObjByHand':
        return 'Ręcznie wybrane';
      default:
        return 'Nieznany typ';
    }
  }

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

      thumbnailArrayTemp.push([WMSurl, title, type]);
    });

    this.thumbnailArray.set(thumbnailArrayTemp.reverse());
  }

}
