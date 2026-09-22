import { Component, inject, input, OnInit, signal } from '@angular/core';
import { PopUpService } from '../../../services/pop-up-service/pop-up-service';

@Component({
  selector: 'app-pop-up',
  imports: [],
  templateUrl: './pop-up.html',
  styleUrl: './pop-up.scss',
})
export class PopUp {
  private popUpService = inject(PopUpService);
  public resetPopUp = this.popUpService.resetPopUp;
}
