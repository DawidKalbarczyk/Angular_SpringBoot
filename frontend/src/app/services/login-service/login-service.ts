import { Service, signal, effect, OnDestroy, inject} from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, getAdditionalUserInfo } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '../../firebase.config';
import { GeoserverService } from '../GeoserverService/geoserver-service';
import { firstValueFrom } from 'rxjs';


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




    registerWithEmailCore(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password)
            .then((result) => {
                console.log('User registered successfully:', result.user);
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
                console.error('Error during registration:', error);
                throw error;
            });
    }

    public geoServerService = inject(GeoserverService);
    async registerWithEmail(email: string, name: string, password: string) {
        const userName = name;
        const userData = await this.registerWithEmailCore(email, password);
        this.setLoggedIn(true);
        console.log('UserName:', userName);
        console.log('UserId:', userData.uid);
        await firstValueFrom(this.geoServerService.createUserData(userData.uid));
        //kod do springboota wkładający do users
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
