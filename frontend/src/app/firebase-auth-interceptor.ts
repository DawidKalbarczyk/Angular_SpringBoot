import { HttpInterceptorFn } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebase.config';

export const firebaseAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const user = getAuth(firebaseApp).currentUser;

  console.log('[Firebase] Request:', request.method, request.url,
    'UID:', user?.uid ?? 'brak zalogowanego użytkownika');

  if (!user) {
    console.log('[Firebase] Brak tokenu - żądanie wysłane bez Authorization');
    return next(request);
  }

  return from(user.getIdToken()).pipe(
    switchMap((token) => {
      console.log('[Firebase] Token pobrany, długość:', token.length);
      const authorizedRequest = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      console.log('[Firebase] Authorization dołączony do requestu');
      return next(authorizedRequest);
    })
  );
};