import { Component, inject, input, OnInit, signal } from '@angular/core';
import { PopUpService } from '../../../services/pop-up-service/pop-up-service';
import { ObjSelection } from '../../../services/obj-selection/obj-selection';
import { FormsModule } from '@angular/forms';
import { AMService } from '../../../services/a-m-service/a-m-service';
import { RouterLink } from '@angular/router';
import { KeyValuePipe } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';


@Component({
  selector: 'app-pop-up',
  imports: [FormsModule, RouterLink, KeyValuePipe, TranslatePipe],
  templateUrl: './pop-up.html',
  styleUrl: './pop-up.scss',
})
export class PopUp {
  public popUpService = inject(PopUpService);
  public objectSelection = inject(ObjSelection);
  userLayerName = '';
  public resetPopUp = (val: boolean) => this.popUpService.resetPopUp(val);
  public attributeSelectionHandler = (val: true | false | null) => this.popUpService.attributeSelectionDeleteHandler.set(val);

  public typeOfPopUp = this.popUpService.typeOfPopUp;  // signal, nie wywołanie

  public AMService = inject(AMService);
}
