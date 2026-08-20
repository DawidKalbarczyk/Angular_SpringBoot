import { Component, inject } from '@angular/core';
import { DarkMode } from '../../services/dark-mode/dark-mode';

@Component({
  selector: 'app-author-bar',
  imports: [],
  templateUrl: './author-bar.html',
  styleUrl: './author-bar.scss',
})
export class AuthorBar {
  public isDarkMode = inject(DarkMode).isDarkMode;
}
