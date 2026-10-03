import { Component, inject, signal} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DarkMode } from '../../services/dark-mode/dark-mode';
import { GeoserverService } from '../../services/GeoserverService/geoserver-service';
import { LanguageService } from '../../services/language/language-service';
import { AMService } from '../../services/a-m-service/a-m-service';
import { filter } from 'rxjs/operators';
import { ReturnService } from '../../services/return-service/return-service';

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
  public languageService = inject(LanguageService);
  public userData = JSON.parse(localStorage.getItem('userData') || '{}');
  public amService = inject(AMService);
  private GeoserverService = inject(GeoserverService);
  
  

  switchColors(): void {
    this.isDarkMode.set(!this.isDarkMode());
    console.log('Dark mode is now:', this.isDarkMode());

    localStorage.setItem('darkMode', this.isDarkMode() ? 'true' : 'false');
  }
   
  private urlList = inject(ReturnService).urlList;
  constructor() {
    if (this.urlList().at(-1) !== this.router.url) {
      this.urlList.update((urls) => [...urls, this.router.url]);
      console.log(this.urlList())
    } else {
      console.log('URL already exists. UrlList: ', this.urlList());
    }
  }
  goBack(): void {
    const userDataLocal = JSON.parse(localStorage.getItem('userDataLocal') || '{}');
    const userId = userDataLocal.uid;
    this.urlList.update((urls) => urls.slice(0, -1));
    this.amService.resetAMServiceVariables();
    if (this.router.url === '/geoportal') {
      this.GeoserverService.deleteTemps(userId).subscribe({
        next: (response) => {
          console.log('Temporary workspaces and datastores deleted successfully:', response);
        },
        error: (error) => {
          console.error('Error deleting temporary workspaces and datastores:', error);
        }
      });
    }

    this.router.navigate([this.urlList().at(-1)]);
    
  }
}
