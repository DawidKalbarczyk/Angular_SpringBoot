import { inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { getAuth, EmailAuthProvider, PasswordValidationStatus, reauthenticateWithCredential } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
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
    
    public areVariablesMatching = signal<boolean>(true);
    public isSuccessful = signal<boolean>(false);
    public variablesErrorMessage = signal<string>('');
    public resetVariablesMatching() {
        this.areVariablesMatching.set(true);
        this.variablesErrorMessage.set('');
        this.isSuccessful.set(false);
    }
    public async changeUserName(currentPassword: string, newUserName: string, confirmUserName: string): Promise<void> {
        this.resetVariablesMatching(); // Reset the signals at the start of the method
        
        if (newUserName !== confirmUserName) {
            this.areVariablesMatching.set(false);
            this.variablesErrorMessage.set('USER-SETTINGS.OPTION1-DETAILS.ERROR');
            throw new Error('New username and confirmation do not match.');
        } 
        await this.reauthenticate(currentPassword);
        await firstValueFrom(this.http.patch('/pass/update-user-name', { userName: newUserName }, {responseType: 'text'})); 
        await this.getUser.getUserData(); // Refresh user data after updating the username

        if (this.getUser.userData()) {
            this.isSuccessful.set(true);
            this.variablesErrorMessage.set('USER-SETTINGS.OPTION1-DETAILS.SUCCESS');
            
        }

        //Debug do wywalenia potem
        /// Auth po to aby odświeżyć token i mieć aktualne dane lokalnie z Firebase
        const auth = getAuth();
        if (auth.currentUser) {
            await auth.currentUser.getIdToken(true); 
        }
        await this.getUser.getUserDataFirebase(); // Refresh user data from Firebase after updating the username
        console.log('Username updated successfully to:', newUserName);
        console.log('User data in Firebase:', this.getUser.userDataFirebase());
        /////////////
    }

    public async changeEmail(currentPassword: string, confirmEmail: string, newEmail: string): Promise<void> {
        
        this.resetVariablesMatching(); // Reset the signals at the start of the method
        if (newEmail !== confirmEmail) {
            this.areVariablesMatching.set(false);
            this.variablesErrorMessage.set('USER-SETTINGS.OPTION2-DETAILS.ERROR');
            throw new Error('New email and confirmation do not match.');
        }

        await this.reauthenticate(currentPassword);
        try {
            await firstValueFrom(this.http.patch('/pass/update-user-email', { userEmail: newEmail }, {responseType: 'text'}));
            await this.getUser.getUserData(); // Refresh user data after updating the email
        
            if (this.getUser.userData()) {
                this.isSuccessful.set(true);
                this.variablesErrorMessage.set('USER-SETTINGS.OPTION2-DETAILS.SUCCESS');
            }
        } catch (error) {
            this.handleErrorEmail(error);
        }
        
    }

    private handleErrorEmail(error: unknown): void {
        console.log('Error:', error);
        this.areVariablesMatching.set(false);

        if (error instanceof HttpErrorResponse && error.error) {
            switch (error.error) {
                case 'User email is already taken':
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION2-DETAILS.ERROR-TAKEN');
                    break;
                case 'Invalid user email':
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION2-DETAILS.ERROR-INV-EMAIL');
                    break;
                default:
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION2-DETAILS.ERROR');
            }
            return;
        }

    }
    
    public async changePassword(currentPassword: string, confirmPassword: string, newPassword: string): Promise<void> {
        this.resetVariablesMatching(); // Reset the signals at the start of the method

        if (newPassword !== confirmPassword) {
            this.areVariablesMatching.set(false);
            this.variablesErrorMessage.set('USER-SETTINGS.OPTION3-DETAILS.ERROR');
            throw new Error('New password and confirmation do not match.');
        }

        await this.reauthenticate(currentPassword);
        try {
            await firstValueFrom(this.http.patch('/pass/update-user-password', { userPassword: newPassword }, {responseType: 'text'})); 
            await this.getUser.getUserData(); // Refresh user data after updating the password just for checkout
        
            if (this.getUser.userData()) {
                this.isSuccessful.set(true);
                this.variablesErrorMessage.set('USER-SETTINGS.OPTION3-DETAILS.SUCCESS');
            }
        } catch (error) {
            this.handleErrorPassword(error);
        }

    }
    private handleErrorPassword(error: unknown): void {
        console.log('Error:', error);
        this.areVariablesMatching.set(false);

        if (error instanceof HttpErrorResponse && error.error) {
            switch (error.error) {
                case 'Weak password':
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION3-DETAILS.ERROR-WEAK-PASS');
                    break;
                case 'Invalid user password':
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION3-DETAILS.ERROR-INV-PASS');
                    break;
                default:
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION3-DETAILS.ERROR');
            }
            return;
        }

    }
    public async changeProfilePicture(newProfilePicture: File, currentPassword: string): Promise<void> {
        this.resetVariablesMatching(); // Reset the signals at the start of the method

        if (!newProfilePicture) {
            this.areVariablesMatching.set(false);
            this.variablesErrorMessage.set('USER-SETTINGS.OPTION4-DETAILS.ERROR');
            throw new Error('No profile picture selected.');
        }

        await this.reauthenticate(currentPassword);

        const formData = new FormData();
        formData.append('profilePicture', newProfilePicture, newProfilePicture.name);

        try {
            await firstValueFrom(
                this.http.patch('/pass/update-user-photo', formData, { responseType: 'text' }));
            await this.getUser.getUserData(); // Refresh user data after updating the profile picture

            if (this.getUser.userData()) {
                this.isSuccessful.set(true);
                this.variablesErrorMessage.set('USER-SETTINGS.OPTION4-DETAILS.SUCCESS');
            }
        } catch (error) {
            this.handleErrorProfilePicture(error);
        }
    
    }

    private handleErrorProfilePicture(error: unknown): void {
        console.log('Error:', error);
        this.areVariablesMatching.set(false);  
        
        if (error instanceof HttpErrorResponse && error.error) {
            switch (error.error) {
                case 'Invalid file type':
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION4-DETAILS.ERROR-INV-FILE');
                    break;
                case 'File size exceeds limit':
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION4-DETAILS.ERROR-FILE-SIZE');
                    break;
                default:
                    this.variablesErrorMessage.set('USER-SETTINGS.OPTION4-DETAILS.ERROR');
            }
        }
    } 
}
