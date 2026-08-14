import { Component, inject} from '@angular/core';
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
  }

  goBack(): void {
    if (this.url === '/search' || this.url === '/history') {
      this.router.navigate(['/']);
    } else if (this.url === '/history-inner') {
      this.router.navigate(['/history']);
    }
  }
}
