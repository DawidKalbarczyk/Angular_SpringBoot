import { Component, computed, input, OnInit, inject, signal} from '@angular/core';
import { AuthorBar } from '../global-components/author-bar/author-bar';
import { LoginCorner } from '../global-components/login-corner/login-corner';
import { ReturnCorner } from '../global-components/return-corner/return-corner';
import { LoginService } from '../services/login-service/login-service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [AuthorBar, LoginCorner, ReturnCorner, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  type = input<string>();
  ngOnInit() {
    console.log('Login component initialized with type:', this.type());
    console.log('Typeof type:', typeof this.type());
  }

  protected nameInput = signal<string>('');
  protected emailInput = signal<string>('');
  protected passInput = signal<string>('');

  public isFormFilled = computed(() =>
    this.nameInput().trim().length > 0 &&
    this.emailInput().trim().length > 0 &&
    this.passInput().trim().length > 0
  );





  private loginService = inject(LoginService);
  private router = inject(Router);

  public errorMessage = signal<string>('');

  onSubmit(event: Event, email: string, name: string, password: string) {
    event.preventDefault();
    this.errorMessage.set(''); 

    if (this.type() === 'signin') {
      this.loginService.registerWithEmail(email, name, password)
        .then(() => this.router.navigate(['/']))
        .catch((error) => this.handleError(error.code));
    } else if (this.type() === 'login') {
      this.loginService.loginWithEmail(email, name, password)
        .then(() => this.router.navigate(['/']))
        .catch((error) => this.handleError(error.code));
    }
  }
  private handleError(code: string) {
    switch (code) {
      case 'auth/email-already-in-use':
        this.errorMessage.set('Ten adres e-mail jest już zajęty.');
        break;
      case 'auth/invalid-email':
        this.errorMessage.set('Nieprawidłowy format adresu e-mail.');
        break;
      case 'auth/weak-password':
        this.errorMessage.set('Hasło musi mieć co najmniej 6 znaków.');
        break;
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        this.errorMessage.set('Nieprawidłowy e-mail lub hasło.');
        break;
      default:
        this.errorMessage.set('Wystąpił błąd podczas logowania.');
    }
  }
}
