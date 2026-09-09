import { Service, signal } from '@angular/core';

@Service()
export class LoginService {
    public isLoggedIn = signal<boolean>(false);

}
