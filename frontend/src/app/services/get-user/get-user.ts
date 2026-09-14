import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';

interface UserData {
    userId: string;
    userName: string;
    email: string;
    photoURL: string;
}

@Service()
export class GetUser {
    public userData = signal<UserData | null>(null);
    private http = inject(HttpClient);
    
    

    public getUserData() {
        this.http.get<UserData>('/pass/get-user-data').subscribe({
            next: (data) => {
                console.log('Dane użytkownika z backendu USERDATA2:', data);
                this.userData.set(data);
            },
            error: (error) => {
                console.error('Błąd podczas pobierania danych użytkownika:', error);
            }
        });
        
    }
    
}
