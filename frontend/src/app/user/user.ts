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
import { MatIconModule } from '@angular/material/icon';
import { UpdateUser } from '../services/update-user/update-user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AuthorBar, LoginCorner, ReturnCorner, MatProgressSpinnerModule, MatIconModule, TranslatePipe, FormsModule, CommonModule],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {
  private getUser = inject(GetUser);
  private loginService = inject(LoginService);
  public isLoggedIn = this.loginService.isLoggedIn //signal(true);;
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
  public wasSettingClicked = signal<number>(0);
  public wasMainSettingClicked = signal<number>(0);
  public optionsArray = [false, false, false, false, false, false, false];

  public clickSettings(pickedSetting: number) {
    this.wasSettingClicked.set(pickedSetting);
    this.checkWhichOption(pickedSetting);
    setTimeout(() => {
      this.wasMainSettingClicked.set(1);
    }, 700);
  }
  public closeCurrentSetting() {
    this.wasSettingClicked.set(0);
    this.wasMainSettingClicked.set(0);
    this.optionsArray = [false, false, false, false, false, false, false];
  }
  public checkWhichOption(option: number) {
    this.optionsArray.forEach((value, index) => {
      if (index !== option - 1) {
        this.optionsArray[index] = true;
      }
    });
  }





  //Handling buttons

  public updateUserService = inject(UpdateUser);
  newUserName = '';
  confirmUserName = '';
  newEmail = '';
  confirmEmail = '';
  newPassword = '';
  currentPassword = '';
  currentEmail = '';
  confirmPassword = '';
  public resetNgModelVariables() {
    this.newUserName = '';
    this.confirmUserName = '';
    this.newEmail = '';
    this.confirmEmail = '';
    this.newPassword = '';
    this.currentPassword = '';
    this.currentEmail = '';
    this.confirmPassword = '';
  }
  public resetNgModelVariablesTimeout() {
    setTimeout(() => {
      this.resetNgModelVariables();
    }, 1000);
  }

  public areVariablesMatching = this.updateUserService.areVariablesMatching;
  public variablesErrorMessage = this.updateUserService.variablesErrorMessage;
  public isSuccessful = this.updateUserService.isSuccessful;
  public resetVariablesMatching = this.updateUserService.resetVariablesMatching;
  
}
