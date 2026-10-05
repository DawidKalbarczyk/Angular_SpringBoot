import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LoginService } from '../../services/login-service/login-service';
import { Router } from '@angular/router';
import { ReturnService } from '../../services/return-service/return-service';

@Component({
  selector: 'app-redirect',
  imports: [MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './redirect.html',
  styleUrl: './redirect.scss',
})
export class Redirect implements AfterViewInit {
  public loginService = inject(LoginService);
  private router = inject(Router);
  private returnService = inject(ReturnService);

 

  ngAfterViewInit(): void {
    if (this.router.url.includes('/saved') || this.router.url.includes('/history') || this.router.url.includes('/user')) {
      if (this.loginService.isLoggedIn() === false) {
        this.returnService.loginTimeout.set(setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000));
      }
    } 
  }
}
