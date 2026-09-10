import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DarkMode } from '../../services/dark-mode/dark-mode';
import { LoginService } from '../../services/login-service/login-service';
import {Router} from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login-corner',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './login-corner.html',
  styleUrl: './login-corner.scss',
})
export class LoginCorner {
  private loginService = inject(LoginService);

  public isLoggedIn = this.loginService.isLoggedIn;
  public isDarkMode = inject(DarkMode).isDarkMode;
  public currentUserData: any;

  private router = inject(Router);
  public url: string = this.router.url;

  async loginWithGoogle() {
    try {
      this.currentUserData = await this.loginService.componentLoginGoogle()
      this.loginService.userData.set(this.currentUserData);
      console.log('Email: ', this.currentUserData.email);
      console.log('Display Name: ', this.currentUserData.displayName);
      console.log('Photo URL: ', this.currentUserData.photoURL);
    } catch (error) {
    console.error('Login failed:', error);
    window.alert('Logowanie przez Google nie powiodło się.');
    } 
  }

  logoutWithGoogle() {
    this.loginService.logoutWithGoogle();
  }
}
