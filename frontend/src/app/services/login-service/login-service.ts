import { Service, signal, effect, OnDestroy, inject} from '@angular/core';
// Importuje Firebase Authentication oraz obserwowanie stanu sesji.
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, getAdditionalUserInfo, deleteUser, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '../../firebase.config';
import { GeoserverService } from '../GeoserverService/geoserver-service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DarkMode } from '../dark-mode/dark-mode';


const SESSION_TIMEOUT = 900000;
const STORAGE_KEY = 'isLoggedIn';
const STORAGE_TIMESTAMP_KEY = 'loginTimestamp';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

@Service()
export class LoginService implements OnDestroy {
    // Stan zaczyna się jako false, bo localStorage nie jest dowodem zalogowania.
    public isLoggedIn = signal<boolean>(false);
    // Dane profilu są puste do czasu potwierdzenia sesji przez Firebase.
    public userData = signal<UserData | null>(null);
    private auth = getAuth(firebaseApp);
    private googleProvider = new GoogleAuthProvider();
    private router = inject(Router);
    private inactivityTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private activityListener = this.resetInactivityTimer.bind(this);
    // Przechowuje funkcję wyłączającą obserwatora Firebase.
    private unsubscribeAuthState: (() => void) | null = null;

    // Otwiera logowanie Google przez Firebase.
    loginWithGoogle() {
        return signInWithPopup(this.auth, this.googleProvider);
    }

    // Kończy logowanie Google i tworzy dane użytkownika po pierwszym logowaniu.
    async componentLoginGoogle() {
        try {
            const result = await this.loginWithGoogle();
            const additionalUserInfo = getAdditionalUserInfo(result);

            if (additionalUserInfo?.isNewUser) {
                await firstValueFrom(this.geoServerService.createUserData(result.user.uid));

                try {
                    // Wysyła do backendu tylko dane profilu, bez UID i e-maila jako dowodu tożsamości.
                    await firstValueFrom(this.http.post('/pass/create-user', {
                        userName: result.user.displayName,
                        photoURL: result.user.photoURL
                    }, {responseType: 'text'}));
                    console.log('User data sent to Spring Boot successfully');
                } catch (springError) {
                    console.error('Error sending user data to Spring Boot:', springError);
                    try {
                        await deleteUser(result.user);
                    } catch (deleteError) {
                        console.error('Could not roll back Firebase registration:', deleteError);
                    }
                    await signOut(this.auth).catch((signOutError) => {
                        console.error('Could not sign out after failed registration:', signOutError);
                    });
                    this.setLoggedIn(false);
                    this.userData.set(null);
                    localStorage.removeItem('userData');
                    localStorage.removeItem('userDataLocal');
                    throw springError;
                }
            }

            this.setLoggedIn(true);
            console.log('User logged in successfully:', result.user);
            await this.logFirebaseTokenStatus(result.user);
            this.setUserData(result.user);
            const userDataLocal = {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL
            };
            localStorage.setItem('userDataLocal', JSON.stringify(userDataLocal));
            this.router.navigate(['/']);
            return result.user;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }

    // Wylogowuje użytkownika z Firebase i czyści lokalny stan interfejsu.
    logoutWithGoogle() {
        return signOut(this.auth)
            .then(() => {
                this.setLoggedIn(false);
                this.userData.set(null);
                localStorage.removeItem('userData');
                localStorage.removeItem('userDataLocal');
                console.log('User logged out successfully');
            })
            .catch((error) => {
                console.error('Error during logout:', error);
                throw error;
            });
    }




    // Tworzy konto e-mail/hasło w Firebase bez wysyłania hasła do własnego backendu.
    async registerWithEmailCore(email: string, name: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password)
            .then((result) => {
                const appUserData: UserData = {
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: name,
                    photoURL: result.user.photoURL
                };
                console.log('User registered successfully:', result.user);
                this.setUserData(appUserData);
                return result.user;
            })
            .catch((error) => {
                console.error('Error during registration:', error);
                throw error;
            });
    }

    public geoServerService = inject(GeoserverService);
    private http = inject(HttpClient);
    // Rejestruje konto i tworzy powiązane zasoby użytkownika.
    async registerWithEmail(email: string, name: string, password: string) {
        const userData = await this.registerWithEmailCore(email, name, password);

        try {
            await firstValueFrom(this.geoServerService.createUserData(userData.uid));
            this.setLoggedIn(true);
            console.log('UserName:', name);
            console.log('UserId:', userData.uid);
            console.log('UserEmail:', userData.email);
            console.log('UserPhotoURL:', userData.photoURL);    
            // Interceptor dołączy token Firebase do tego żądania automatycznie.
            this.http.post('/pass/create-user', {
                userName: name,
                photoURL: userData.photoURL
            }, {responseType: 'text'}).subscribe({
                next: (response) => {
                    console.log('User data sent to Spring Boot successfully:', response);
                },
                error: (error) => {
                    console.error('Error sending user data to Spring Boot:', error);
                }
            });
        } catch (error) {
            try {
                await deleteUser(userData);
            } catch (deleteError) {
                console.error('Could not roll back Firebase registration:', deleteError);
            }
            await signOut(this.auth).catch((signOutError) => {
                console.error('Could not sign out after failed registration:', signOutError);
            });
            this.setLoggedIn(false);
            this.userData.set(null);
            localStorage.removeItem('userData');
            localStorage.removeItem('userDataLocal');
            throw error;
        }
    }

    // Loguje użytkownika e-mailem przez Firebase.
    loginWithEmailCore(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password)
            .then((result) => {
                this.setLoggedIn(true);
                console.log('User logged in successfully:', result.user);
                this.setUserData(result.user);
                const userDataLocal = {
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL
                };
                localStorage.setItem('userDataLocal', JSON.stringify(userDataLocal));
                return result.user;
            })
            .catch((error) => {
                console.error('Error during login:', error);
                throw error;
            });
    }

    // Udostępnia wyższy poziom logowania e-mailowego dla komponentu logowania.
    async loginWithEmail(email: string, name: string, password: string) {
        const userData = await this.loginWithEmailCore(email, password);
        this.setLoggedIn(true);
        console.log('UserName:', name);
        console.log('UserId:', userData.uid);

        // Pobiera token po zwykłym logowaniu e-mailowym.
        await this.logFirebaseTokenStatus(userData);

        // Nie wywołuje create-user, ponieważ logowanie istniejącego konta nie jest rejestracją.
        console.log('[Firebase] Logowanie e-mail zakończone');
    }

    // Pobiera token tylko do potwierdzenia diagnostycznego; jego treść nie jest logowana.
    private async logFirebaseTokenStatus(user: UserData) {
        const token = await this.auth.currentUser?.getIdToken();

        console.log('[Firebase] Token po zalogowaniu:', {
            uid: user.uid,
            tokenReceived: !!token,
            tokenLength: token?.length ?? 0
        });
    }




    // Aktualizuje sygnał stanu sesji i lokalny timer bezczynności.
    private setLoggedIn(value: boolean) {
        this.isLoggedIn.set(value);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        if (value) {
            this.updateLastActivity();
        } else {
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        }
    }

    private updateLastActivity() {
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    }

    // Ustawia dane profilu otrzymane z Firebase.
    private setUserData(user: UserData) {
        this.userData.set(user);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private readStoredUserData(): UserData | null {
        const stored = localStorage.getItem('userData');
        if (!stored) return null;

        try {
            return JSON.parse(stored) as UserData;
        } catch {
            localStorage.removeItem('userData');
            return null;
        }
    }

    private readStorageLoginState(): boolean {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== 'true') return false;

        const lastActivity = Number(localStorage.getItem(STORAGE_TIMESTAMP_KEY) ?? 0);
        const elapsed = Date.now() - lastActivity;

        if (elapsed > SESSION_TIMEOUT) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
            return false;
        }

        return true;
    }

    // Odświeża licznik wylogowania po bezczynności użytkownika.
    private resetInactivityTimer() {
        if (!this.isLoggedIn()) return;
        this.updateLastActivity();
        if (this.inactivityTimeoutId !== null) {
            clearTimeout(this.inactivityTimeoutId);
        }
        const lastActivity = Number(localStorage.getItem(STORAGE_TIMESTAMP_KEY));
        const remaining = SESSION_TIMEOUT - (Date.now() - lastActivity);
        this.inactivityTimeoutId = setTimeout(() => {
            console.log('User session expired due to inactivity.');
            this.logoutWithGoogle();
        }, Math.max(remaining, 0));
    }

    // Rozpoczyna obserwowanie ruchu myszy.
    private startActivityTracking() {
        document.addEventListener('mousemove', this.activityListener, {passive: true});
    }

    // Usuwa obserwatora ruchu i zatrzymuje timer.
    private stopActivityTracking() {
        document.removeEventListener('mousemove', this.activityListener);
        if (this.inactivityTimeoutId !== null) {
            clearTimeout(this.inactivityTimeoutId);
            this.inactivityTimeoutId = null;
        }
    }

    // Konstruktor uruchamia obserwowanie prawdziwej sesji Firebase.
    constructor() {
        // Firebase jest jedynym źródłem informacji, czy sesja naprawdę istnieje.

        setPersistence(this.auth, browserSessionPersistence)
        .then(() => {
            console.log('[Firebase] Ustawiono przetrwanie sesji w przeglądarce (browserSessionPersistence)');
        })
        .catch((error) => {
            console.error('[Firebase] Błąd ustawiania przetrwania sesji:', error);
        });
        this.unsubscribeAuthState = onAuthStateChanged(this.auth, (user) => {
            // Ustawia stan zalogowania wyłącznie na podstawie wyniku Firebase.
            this.setLoggedIn(!!user);
            // Potwierdza w konsoli, czy Firebase ma aktywną sesję.
            console.log('[Firebase] Stan sesji:', user ? 'ZALOGOWANY' : 'WYLOGOWANY');
            // Pokazuje bezpieczne dane diagnostyczne zalogowanego użytkownika.
            if (user) {
                console.log('[Firebase] Zalogowany użytkownik:', {
                    uid: user.uid,
                    email: user.email,
                    provider: user.providerData.map((provider) => provider.providerId)
                });
            }
            // Przepisuje dane użytkownika z obiektu Firebase albo czyści je po wylogowaniu.
            this.userData.set(user ? {
                // UID pochodzi bezpośrednio z Firebase.
                uid: user.uid,
                // E-mail pochodzi bezpośrednio z Firebase.
                email: user.email,
                // Nazwa pochodzi bezpośrednio z Firebase.
                displayName: user.displayName,
                // Zdjęcie pochodzi bezpośrednio z Firebase.
                photoURL: user.photoURL
            } : null);
        });

        // Reaguje na zmianę sygnału isLoggedIn i uruchamia albo zatrzymuje licznik bezczynności.
        effect(() => {
            if (this.isLoggedIn()) {
                this.startActivityTracking();
                this.resetInactivityTimer();
            } else {
                this.stopActivityTracking();
            }
        })
    }

    // Sprząta obserwatora Firebase i eventy przy niszczeniu serwisu.
    ngOnDestroy() {
        this.unsubscribeAuthState?.();
        this.stopActivityTracking();
    }
}
