import { Component, inject } from '@angular/core';
import { AuthorBar } from '../global-components/author-bar/author-bar';
import { LoginCorner } from '../global-components/login-corner/login-corner';
import { ReturnCorner } from '../global-components/return-corner/return-corner';
import { Router } from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AuthorBar, LoginCorner, ReturnCorner, MatProgressSpinnerModule],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {
  public isLoggedIn: boolean = true;
  private router: Router = inject(Router);
  public url: string = this.router.url;
  public redirectUrl: boolean = false;
  constructor() {
    if (this.isLoggedIn === true && this.router.url === '/user') {
      return;
    } else if (this.isLoggedIn === false && this.router.url === '/user') {
      this.redirectUrl = true;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }
}
