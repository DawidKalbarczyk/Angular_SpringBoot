import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-history-inner',
  imports: [],
  templateUrl: './history-inner.html',
  styleUrl: './history-inner.scss',
})
export class HistoryInner {
  public id: string = '';

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('innerId') || '';
  }

}
