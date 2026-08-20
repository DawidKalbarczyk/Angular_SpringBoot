import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkMode } from './services/dark-mode/dark-mode';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('frontend');

  public isDarkMode = inject(DarkMode).isDarkMode;
}
