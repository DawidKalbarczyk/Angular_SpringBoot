import { Component, inject } from '@angular/core';
import { DarkMode } from '../../services/dark-mode/dark-mode';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-author-bar',
  imports: [TranslatePipe],
  templateUrl: './author-bar.html',
  styleUrl: './author-bar.scss',
})
export class AuthorBar {
  public isDarkMode = inject(DarkMode).isDarkMode;
  private router = inject(Router);
  public url = this.router.url;
}
