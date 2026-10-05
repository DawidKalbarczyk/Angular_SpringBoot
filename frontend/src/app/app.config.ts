import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ngrokInterceptor } from './ngrok-interceptor';
import { firebaseAuthInterceptor } from './firebase-auth-interceptor';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebase.config';
import { LoginService } from './services/login-service/login-service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      inject(LoginService);
      return getAuth(firebaseApp).authStateReady();
    }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([ngrokInterceptor, firebaseAuthInterceptor]))
  ]
};
