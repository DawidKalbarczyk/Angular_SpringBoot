import { Component, signal, inject, HostListener } from '@angular/core';
import { InfoToggle } from '../../../../services/info-toggle/info-toggle';


@Component({
  selector: 'app-info-component',
  imports: [],
  templateUrl: './info-component.html',
  styleUrl: './info-component.scss',
})


export class InfoComponent {
  infoToggleService = inject(InfoToggle);
  showMarker = signal<boolean>(false);
  turnMarkerUpsideDown = signal<boolean>(false);
  turnMarkerHorizontal = signal<boolean>(false);
  turnMarkerHorVer = signal<boolean>(false);
  markerX = signal<number>(0);
  markerY = signal<number>(0);
  isClickInsideTarget = signal<boolean>(false);


  private mouseDownX = 0;
  private mouseDownY = 0;
  private dragThreshold = 50;
  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
  }

  @HostListener('document:click', ['$event'])
  setMarkerPosition(event: MouseEvent): void {
    const deltaX = Math.abs(event.clientX - this.mouseDownX);
    const deltaY = Math.abs(event.clientY - this.mouseDownY);

    if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
      this.showMarker.set(false);
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('.marker')) {
      return;
    }

    if (!this.infoToggleService.isInfoClicked()) {
      this.showMarker.set(false);
      return;
    }

    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    const rect = mapEl.getBoundingClientRect();

    const insideTarget =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    this.isClickInsideTarget.set(insideTarget);

    if (insideTarget) {
      this.markerX.set(event.clientX);
      this.markerY.set(event.clientY);
      this.showMarker.set(true);
    } else {
      this.showMarker.set(false);
    }

    const isRightHalf = event.clientX > window.innerWidth / 2;
    const isBottomHalf = event.clientY > window.innerHeight / 2;

    this.turnMarkerHorVer.set(isRightHalf && isBottomHalf);
    this.turnMarkerUpsideDown.set(!isRightHalf && isBottomHalf);
    this.turnMarkerHorizontal.set(isRightHalf && !isBottomHalf);
  }
}
