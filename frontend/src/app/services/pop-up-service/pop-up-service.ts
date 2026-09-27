import { inject, Service, signal } from '@angular/core';
import { ObjSelection } from '../obj-selection/obj-selection';

@Service()
export class PopUpService {
    private objectSelection = inject(ObjSelection);
    public typeOfPopUp = signal<'' | 'save' | 'delete' | 'info'>('');

    public showPopUpSave = (): void  => {
        this.typeOfPopUp.set('save');
    }

    public showPopUpDelete = (): void  => {
        this.typeOfPopUp.set('delete');
    }

    public showPopUpInfo = (): void  => {
        this.typeOfPopUp.set('info');
    }

    public resetPopUp = (agree: boolean): void => {
        this.typeOfPopUp.set('');
        agree ? this.objectSelection.clearAllSelectedVariables() : null;
    }

    
}
