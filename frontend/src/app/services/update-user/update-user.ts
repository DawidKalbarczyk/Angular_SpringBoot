import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { getAuth, EmailAuthProvider, PasswordValidationStatus, reauthenticateWithCredential } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { GetUser } from '../get-user/get-user';

@Service()
export class UpdateUser {
    private http = inject(HttpClient);
    private getUser = inject(GetUser);
    private async reauthenticate(currentPassword: string): Promise<void> {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error('No authenticated user found.');
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        
        try {
            await reauthenticateWithCredential(user, credential);
            console.log('Reauthentication successful.');
        } catch (error) {
            console.error('Reauthentication failed:', error);
            throw new Error ('Reauthentication failed. Please check your current password and try again.');
        }
    }  
    
    public async changeUserName(currentPassword: string, newUserName: string, confirmUserName: string): Promise<void> {
        if (newUserName !== confirmUserName) {
            throw new Error('The new username and the confirmation do not match.');
        }
        await this.reauthenticate(currentPassword);
        await firstValueFrom(this.http.patch('/pass/update-user-name', { userName: newUserName }, {responseType: 'text'})); 
        await this.getUser.getUserData(); // Refresh user data after updating the username

        //Debug do wywalenia potem
        /// Auth po to aby odświeżyć token i mieć aktualne dane lokalnie z Firebase
        const auth = getAuth();
        if (auth.currentUser) {
            await auth.currentUser.getIdToken(true); 
        }
        await this.getUser.getUserDataFirebase(); // Refresh user data from Firebase after updating the username
        console.log('Username updated successfully to:', newUserName);
        console.log('User data in Firebase:', this.getUser.userDataFirebase());
    }

    public async changeEmail(currentPassword: string, currentEmail: string, newEmail: string): Promise<void> {
        await this.reauthenticate(currentPassword);
        await firstValueFrom(this.http.patch('/pass/update-user-email', { userEmail: newEmail }, {responseType: 'text'})); 
    }
    
    public async changePassword(currentPassword: string, currentEmail: string, newPassword: string): Promise<void> {
        await this.reauthenticate(currentPassword);
        await firstValueFrom(this.http.patch('/pass/update-user-password', { userPassword: newPassword }, {responseType: 'text'})); 

    }
    
}
