import { Service, signal, effect, OnDestroy, inject} from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, getAdditionalUserInfo, deleteUser } from 'firebase/auth';
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
    public isLoggedIn = signal<boolean>(this.readStorageLoginState() || false);
    public userData = signal<UserData | null>(this.readStoredUserData());
    private auth = getAuth(firebaseApp);
    private googleProvider = new GoogleAuthProvider();
    private router = inject(Router);
    private inactivityTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private activityListener = this.resetInactivityTimer.bind(this);

    loginWithGoogle() {
        return signInWithPopup(this.auth, this.googleProvider);
    }

    async componentLoginGoogle() {
        try {
            const result = await this.loginWithGoogle();
            const additionalUserInfo = getAdditionalUserInfo(result);

            if (additionalUserInfo?.isNewUser) {
                await firstValueFrom(this.geoServerService.createUserData(result.user.uid));

                try {
                    await firstValueFrom(this.http.post('/pass/create-user', {
                        userId: result.user.uid,
                        userEmail: result.user.email,
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
    async registerWithEmail(email: string, name: string, password: string) {
        const userData = await this.registerWithEmailCore(email, name, password);

        try {
            await firstValueFrom(this.geoServerService.createUserData(userData.uid));
            this.setLoggedIn(true);
            console.log('UserName:', name);
            console.log('UserId:', userData.uid);
            console.log('UserEmail:', userData.email);
            console.log('UserPhotoURL:', userData.photoURL);    
            this.http.post('/pass/create-user', {
                userId: userData.uid,
                userEmail: userData.email,
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

    async loginWithEmail(email: string, name: string, password: string) {
        const userData = await this.loginWithEmailCore(email, password);
        this.setLoggedIn(true);
        console.log('UserName:', name);
        console.log('UserId:', userData.uid);

        //kod przechodzący do springboota
    }




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

    private startActivityTracking() {
        document.addEventListener('mousemove', this.activityListener, {passive: true});
    }

    private stopActivityTracking() {
        document.removeEventListener('mousemove', this.activityListener);
        if (this.inactivityTimeoutId !== null) {
            clearTimeout(this.inactivityTimeoutId);
            this.inactivityTimeoutId = null;
        }
    }

    constructor() {
        effect(() => {
            if (this.isLoggedIn()) {
                this.startActivityTracking();
                this.resetInactivityTimer();
            } else {
                this.stopActivityTracking();
            }
        })
    }

    ngOnDestroy() {
        this.stopActivityTracking();
    }
}
