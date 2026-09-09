import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DarkMode } from '../../services/dark-mode/dark-mode';
import { LoginService } from '../../services/login-service/login-service';

@Component({
  selector: 'app-login-corner',
  imports: [RouterLink],
  templateUrl: './login-corner.html',
  styleUrl: './login-corner.scss',
})
export class LoginCorner {
  public isLoggedIn: boolean = inject(LoginService).isLoggedIn();
  public isDarkMode = inject(DarkMode).isDarkMode;
}
