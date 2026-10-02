import { Component, inject} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DarkMode } from '../../services/dark-mode/dark-mode';
import { GeoserverService } from '../../services/GeoserverService/geoserver-service';
import { LanguageService } from '../../services/language/language-service';
import { AMService } from '../../services/a-m-service/a-m-service';
import { filter } from 'rxjs/operators';

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
  public languageService = inject(LanguageService);
  public userData = JSON.parse(localStorage.getItem('userData') || '{}');
  public amService = inject(AMService);


  constructor() {
    // Aktualizuj url przy każdej zmianie trasy
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.url = (event as NavigationEnd).urlAfterRedirects;
      console.log('Current URL:', this.url);
      if (this.url !== '/user' && this.url !== '/login?type=signin' && this.url !== '/login?type=login') {
        localStorage.setItem('lastUrl', this.url);
      }
    });

    // Inicjalizacja dla pierwszego załadowania
    if (this.url !== '/user' && this.url !== '/login?type=signin' && this.url !== '/login?type=login') {
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
    this.amService.resetAMServiceVariables();
    if (this.url === '/geoportal' && lastUrl === '/') {
      this.router.navigate(['/']);
      this.GeoserverService.deleteTemps(userId).subscribe({
        next: (response) => {
          console.log('Temporary workspaces and datastores deleted successfully:', response);
        },
        error: (error) => {
          console.error('Error deleting temporary workspaces and datastores:', error);
        }
      });
    } else if (this.url === '/history' && lastUrl === '/geoportal'){  SPRAWDZ z chat
      this.router.navigate(['/geoportal']);
    } else if ((this.url === '/login?type=signin' || this.url === '/login?type=login') && lastUrl === '/') {
      this.router.navigate([lastUrl]);
    } else if ((this.url === '/login?type=signin' || this.url === '/login?type=login') && lastUrl === '/search') {
      this.router.navigate([lastUrl]);
    } else if (this.url === '/search' || this.url === '/history') {
      this.router.navigate(['/']);
    } else if (this.url.includes('/saved')) {
      // Zawsze wróć do /history z poziomu zapisanego obiektu
      this.router.navigate(['/history']);
    } else if (this.url === '/user') {
      this.router.navigate([lastUrl || '/']);
    }
    
  }
}
