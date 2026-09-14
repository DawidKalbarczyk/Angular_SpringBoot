import { Component, computed, inject, signal } from '@angular/core';
import { AuthorBar } from '../global-components/author-bar/author-bar';
import { LoginCorner } from '../global-components/login-corner/login-corner';
import { ReturnCorner } from '../global-components/return-corner/return-corner';
import { Router } from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { DarkMode } from '../services/dark-mode/dark-mode';
import { LoginService } from '../services/login-service/login-service';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../pipes/translate.pipe';
import { GetUser } from '../services/get-user/get-user';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AuthorBar, LoginCorner, ReturnCorner, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {
  private loginService = inject(LoginService);
  private getUser = inject(GetUser);
  public isLoggedIn = this.loginService.isLoggedIn;
  public getUserData = this.getUser;
  public userData = this.getUser.userData;
  private router: Router = inject(Router);
  public url: string = this.router.url;
  public redirectUrl: boolean = false;
  public darkMode = inject(DarkMode).isDarkMode;
  public hasPhoto = computed(() => !!this.userData()?.photoURL);
  constructor() {
    if (this.isLoggedIn() === true && this.router.url === '/user') {
      this.getUser.getUserData();
      return;
    } else if (this.isLoggedIn() === false && this.router.url === '/user') {
      this.redirectUrl = true;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000); //3s
    }
  }

}
