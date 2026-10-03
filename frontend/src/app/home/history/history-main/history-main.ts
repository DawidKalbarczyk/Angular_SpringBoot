import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AMService } from '../../../services/a-m-service/a-m-service';
import { ObjSelection } from '../../../services/obj-selection/obj-selection';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HistoryService } from '../../../services/history-service/history-service';
import { LoginService } from '../../../services/login-service/login-service';
import { Redirect } from '../../../global-components/redirect/redirect';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { DarkMode} from '../../../services/dark-mode/dark-mode';

@Component({
  selector: 'app-history-main',
  imports: [RouterLink, MatProgressSpinnerModule, Redirect, TranslatePipe],
  templateUrl: './history-main.html',
  styleUrl: './history-main.scss',
})
export class HistoryMain {
  public objectSelection = inject(ObjSelection);
  public AMService = inject(AMService);
  public historyService = inject(HistoryService);
  public loginService = inject(LoginService);
  public redirect = signal<boolean>(false);
  private router = inject(Router);
  private url = this.router.url;
  public isDarkMode = inject(DarkMode).isDarkMode;

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
