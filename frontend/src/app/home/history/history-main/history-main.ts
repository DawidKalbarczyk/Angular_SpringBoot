import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AMService } from '../../../services/a-m-service/a-m-service';
import { ObjSelection } from '../../../services/obj-selection/obj-selection';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HistoryService } from '../../../services/history-service/history-service';

@Component({
  selector: 'app-history-main',
  imports: [RouterLink, MatProgressSpinnerModule],
  templateUrl: './history-main.html',
  styleUrl: './history-main.scss',
})
export class HistoryMain {
  public objectSelection = inject(ObjSelection);
  public AMService = inject(AMService);
  public historyService = inject(HistoryService);

  constructor() {
    this.historyService.setThumbnails();
    setInterval(() => {
      this.toggleArrows();
    }, 2500);
  }

  public jumpingArrows = signal<boolean>(false);

  private toggleArrows(): void {
    this.jumpingArrows.set(!this.jumpingArrows());
  }


}
