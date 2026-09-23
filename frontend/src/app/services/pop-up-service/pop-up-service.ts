import { inject, Service, signal } from '@angular/core';
import { ObjSelection } from '../obj-selection/obj-selection';

@Service()
export class PopUpService {
    public popUpOn = signal<boolean>(false);
    private objectSelection = inject(ObjSelection);

    public showPopUp = (): void  => {
        this.popUpOn.set(true);
    }

    public resetPopUp = (agree: boolean): void => {
        this.popUpOn.set(false);
        agree ? this.objectSelection.clearAllSelectedVariables() : null;
    }
}
