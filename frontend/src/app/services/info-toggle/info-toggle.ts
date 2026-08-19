import { Service, signal } from '@angular/core';

@Service()
export class InfoToggle {
    isInfoClicked = signal<boolean>(false);

    infoClicked(): void {
        this.isInfoClicked.set(!this.isInfoClicked());
    }
}
