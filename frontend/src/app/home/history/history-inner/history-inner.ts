import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AMService } from '../../../services/a-m-service/a-m-service';
import { HistoryService } from '../../../services/history-service/history-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history-inner',
  imports: [RouterLink],
  templateUrl: './history-inner.html',
  styleUrl: './history-inner.scss',
})
export class HistoryInner implements OnInit {
  public time: string = '';
  public userid: string = '';
  public historyService = inject(HistoryService);

  constructor(private route: ActivatedRoute) {
    this.userid = this.route.snapshot.paramMap.get('userId') || '';
    this.time = this.route.snapshot.paramMap.get('time') || '';
  }

  async ngOnInit(): Promise<void> {
    await this.fetchLayerInfo();
  }

  public AMService = inject(AMService);

  public async fetchLayerInfo(): Promise<void> {
    const data = await this.AMService.getLayerData(this.userid, this.time);
    console.log('Layer info:', data);
  }
}
