import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DarkMode } from '../../services/dark-mode/dark-mode';

@Component({
  selector: 'app-login-corner',
  imports: [RouterLink],
  templateUrl: './login-corner.html',
  styleUrl: './login-corner.scss',
})
export class LoginCorner {
  public isLoggedIn: boolean = true;
  public isDarkMode = inject(DarkMode).isDarkMode;
}
