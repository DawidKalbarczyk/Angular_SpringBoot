import { Component, inject, signal} from '@angular/core';
import { Router } from '@angular/router';
import { DarkMode } from '../../services/dark-mode/dark-mode';
import { GeoserverService } from '../../services/GeoserverService/geoserver-service';

@Component({
  selector: 'app-return-corner',
  imports: [],
  templateUrl: './return-corner.html',
  styleUrl: './return-corner.scss',
})
export class ReturnCorner {
  private router: Router = inject(Router);
  public url: string = this.router.url;
  public isDarkMode = inject(DarkMode).isDarkMode;
  private GeoserverService = inject(GeoserverService);


  constructor() {
    console.log('Current URL:', this.url);
    if (this.url != '/user') {
      localStorage.setItem('lastUrl', this.url);
    }
  }

  switchColors(): void {
    this.isDarkMode.set(!this.isDarkMode());
    console.log('Dark mode is now:', this.isDarkMode());

    localStorage.setItem('darkMode', this.isDarkMode() ? 'true' : 'false');
  }
      

  goBack(): void {
    const lastUrl = localStorage.getItem('lastUrl') || this.router.url;
    localStorage.setItem('lastUrl', lastUrl);
    if (this.url === '/geoportal') {
      this.router.navigate(['/']);
      this.GeoserverService.deleteTemps(  "124" ).subscribe({
        next: (response) => {
          console.log('Temporary workspaces and datastores deleted successfully:', response);
        },
        error: (error) => {
          console.error('Error deleting temporary workspaces and datastores:', error);
        }
      });
    } else if (this.url === '/search' || this.url === '/history') {
      this.router.navigate(['/']);
    } else if (this.url === '/history-inner') {
      this.router.navigate(['/history']);
    } else if (this.url === '/user' && lastUrl === '/') {
      this.router.navigate(['/']);
    }
    
  }
}
