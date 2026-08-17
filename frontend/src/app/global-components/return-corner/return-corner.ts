import { Component, inject, signal} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-return-corner',
  imports: [],
  templateUrl: './return-corner.html',
  styleUrl: './return-corner.scss',
})
export class ReturnCorner {
  private router: Router = inject(Router);
  public url: string = this.router.url;

  constructor() {
    console.log('Current URL:', this.url);
    if (this.url != '/user') {
      localStorage.setItem('lastUrl', this.url);
    }
  }

  

  goBack(): void {
    const lastUrl = localStorage.getItem('lastUrl') || this.router.url;
    localStorage.setItem('lastUrl', lastUrl);
    if (this.url === '/search' || this.url === '/history' || this.url === '/geoportal') {
      this.router.navigate(['/']);
    } else if (this.url === '/history-inner') {
      this.router.navigate(['/history']);
    } else if (this.url === '/user' && lastUrl === '/') {
      this.router.navigate(['/']);
    }
    
  }
}
