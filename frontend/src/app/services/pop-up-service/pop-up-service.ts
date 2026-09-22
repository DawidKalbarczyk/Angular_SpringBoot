import { Service, signal } from '@angular/core';

@Service()
export class PopUpService {
    public popUpOn = signal<boolean>(false);

    public didUserAgree = signal<boolean>(false);

    public resetPopUp(agree: boolean): void {
        agree ? this.didUserAgree.set(true) : this.didUserAgree.set(false);
        this.popUpOn.set(false);
    }
}
