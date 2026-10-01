import { AfterViewInit, Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LoginService } from '../../services/login-service/login-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  imports: [MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './redirect.html',
  styleUrl: './redirect.scss',
})
export class Redirect implements AfterViewInit {
  public loginService = inject(LoginService);
  private router = inject(Router);

  ngAfterViewInit(): void {
    if (this.router.url.includes('/saved') || this.router.url.includes('/history') || this.router.url.includes('/user')) {
      if (this.loginService.isLoggedIn() === false) {
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }
    } 
  }
}
