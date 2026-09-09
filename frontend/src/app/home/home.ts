import { Component, inject, signal } from '@angular/core';
import { AuthorBar } from '../global-components/author-bar/author-bar';
import {LoginCorner} from '../global-components/login-corner/login-corner';
import { ReturnCorner } from '../global-components/return-corner/return-corner';
import { RouterLink } from '@angular/router';
import { DarkMode } from '../services/dark-mode/dark-mode';
import { LoginService } from '../services/login-service/login-service';

@Component({
  selector: 'app-home',
  imports: [AuthorBar, LoginCorner, ReturnCorner, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  public isDarkMode = inject(DarkMode).isDarkMode;
  public isLoggedIn: boolean = inject(LoginService).isLoggedIn();

  public wasMiddleClicked = signal<boolean>(false);
  public wasPopUpCloseClicked = signal<boolean>(false);

  middleClickHandler() {
    this.wasMiddleClicked.set(!this.wasMiddleClicked());
  }

  wasPopUpBgClicked() {
    this.wasPopUpCloseClicked.set(true);
    setTimeout(() => {
      this.wasMiddleClicked.set(false);
      this.wasPopUpCloseClicked.set(false);
    }, 500);
    
  }
}
