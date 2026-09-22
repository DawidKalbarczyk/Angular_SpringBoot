import { Component, inject } from '@angular/core';
import { ZoomToObject } from '../../../../services/zoom-to-object/zoom-to-object';

@Component({
  selector: 'app-search-close',
  imports: [],
  templateUrl: './search-close.html',
  styleUrl: './search-close.scss',
})
export class SearchClose {
  public zoomService = inject(ZoomToObject);

}
