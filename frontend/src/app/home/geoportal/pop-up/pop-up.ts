import { Component, inject, input, OnInit, signal } from '@angular/core';
import { PopUpService } from '../../../services/pop-up-service/pop-up-service';
import { ObjSelection } from '../../../services/obj-selection/obj-selection';
import { FormsModule } from '@angular/forms';
import { AMService } from '../../../services/a-m-service/a-m-service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-pop-up',
  imports: [FormsModule, RouterLink],
  templateUrl: './pop-up.html',
  styleUrl: './pop-up.scss',
})
export class PopUp {
  private popUpService = inject(PopUpService);
  public objectSelection = inject(ObjSelection);
  userLayerName = '';
  public resetPopUp = (val: boolean) => this.popUpService.resetPopUp(val);

  public typeOfPopUp = this.popUpService.typeOfPopUp();

  public AMService = inject(AMService);
}
