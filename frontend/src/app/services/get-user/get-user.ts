import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

interface UserData {
    userId: string;
    userName: string;
    email: string;
    photoURL: string;
}

@Service()
export class GetUser {
    public userData = signal<UserData | null>(JSON.parse(localStorage.getItem('userData-userPage')!) || null);
    public userDataFirebase = signal<any | null>(null);
    private http = inject(HttpClient);
    
    

    public getUserData() {
        this.http.get<UserData>('/pass/get-user-data').subscribe({
            next: (data) => {
                this.userData.set(data);
                localStorage.setItem('userData-userPage', JSON.stringify(data));
            },
            error: (error) => {
                console.error('Błąd podczas pobierania danych użytkownika:', error);
            }
        });
        
    }

    /// Do wyjebania potem - teraz tylko do debugu potrzebne
    ///////////////////////////
    public async getUserDataFirebase(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get('/pass/get-user-data-firebase'));
            this.userDataFirebase.set(data);
        } catch (error) {
            console.error('Błąd podczas pobierania danych użytkownika z Firebase:', error);
        } 
    }
    ///////////////////////////////////////
    ///////////////////////////
}
