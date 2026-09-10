import { Component, inject, signal} from '@angular/core';
import { Router } from '@angular/router';
import { DarkMode } from '../../services/dark-mode/dark-mode';
import { GeoserverService } from '../../services/GeoserverService/geoserver-service';
import { LanguageService } from '../../services/language/language-service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-return-corner',
  imports: [TranslatePipe],
  templateUrl: './return-corner.html',
  styleUrl: './return-corner.scss',
})
export class ReturnCorner {
  private router: Router = inject(Router);
  public url: string = this.router.url;
  public isDarkMode = inject(DarkMode).isDarkMode;
  private GeoserverService = inject(GeoserverService);
  public languageService = inject(LanguageService);
  public userData = JSON.parse(localStorage.getItem('userData') || '{}');


  constructor() {
    console.log('Current URL:', this.url);
    if (this.url != '/user' && this.url != '/login?type=signin' && this.url != '/login?type=login') {
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
    const userDataLocal = JSON.parse(localStorage.getItem('userDataLocal') || '{}');
    const userId = userDataLocal.uid;
    localStorage.setItem('lastUrl', lastUrl);
    if (this.url === '/geoportal') {
      this.router.navigate(['/']);
      this.GeoserverService.deleteTemps(userId).subscribe({
        next: (response) => {
          console.log('Temporary workspaces and datastores deleted successfully:', response);
        },
        error: (error) => {
          console.error('Error deleting temporary workspaces and datastores:', error);
        }
      });
    } else if ((this.url === '/login?type=signin' || this.url === '/login?type=login') && lastUrl === '/') {
      this.router.navigate([lastUrl]);
    } else if ((this.url === '/login?type=signin' || this.url === '/login?type=login') && lastUrl === '/search') {
      this.router.navigate([lastUrl]);
    } else if (this.url === '/search' || this.url === '/history') {
      this.router.navigate(['/']);
    } else if (this.url === '/history-inner') {
      this.router.navigate(['/history']);
    } else if (this.url === '/user' && lastUrl === '/') {
      this.router.navigate([lastUrl]);
    }
    
  }
}
