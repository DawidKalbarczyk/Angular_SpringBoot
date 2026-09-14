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
    this.emailInput().trim().length > 0 &&
    this.passInput().trim().length > 0 &&
    (this.type() !== 'signin' || this.nameInput().trim().length > 0)
  );

  public LoginService = inject(LoginService);





  private loginService = inject(LoginService);
  private router = inject(Router);

  public errorMessage = signal<string>('');

  onSubmit(event: Event, email: string, password: string) {
    event.preventDefault();
    this.errorMessage.set(''); 

    if (this.type() === 'signin') {
      this.loginService.registerWithEmail(email, this.nameInput(), password)
        .then(() => this.router.navigate(['/']))
        .catch((error) => this.handleError(error.code));
    } else if (this.type() === 'login') {
      this.loginService.loginWithEmail(email, '', password)
        .then(() => this.router.navigate(['/']))
        .catch((error) => this.handleError(error.code));
    }
  }
  private handleError(code: string | undefined) {
    console.log('Error code:', code);

    switch (code) {
      case 'auth/invalid-email':
        this.errorMessage.set('LOGIN-PAGE.ERROR-INV-EMAIL');
        break;
      case 'auth/weak-password':
        this.errorMessage.set('LOGIN-PAGE.ERROR-WEAK-PASS');
        break;
      case 'auth/invalid-credential':
        this.errorMessage.set('LOGIN-PAGE.ERROR-INV-CRED');
        break;
      case 'auth/invalid-credentials':
        this.errorMessage.set('LOGIN-PAGE.ERROR-INV-CRED');
        break;
      case 'auth/email-already-in-use':
        this.errorMessage.set('LOGIN-PAGE.ERROR-EMAIL-TAKEN');
        break;
      case 'auth/user-not-found':
        this.errorMessage.set('LOGIN-PAGE.ERROR-USER-NOT-FOUND');
        break;
      case 'auth/wrong-password':
        this.errorMessage.set('LOGIN-PAGE.ERROR-WRONG-PASS');
        break;
      default:
        this.errorMessage.set(
          this.type() === 'signin'
            ? 'Wystąpił błąd podczas rejestracji.'
            : 'Wystąpił błąd podczas logowania.'
        );
    }
  }
}
