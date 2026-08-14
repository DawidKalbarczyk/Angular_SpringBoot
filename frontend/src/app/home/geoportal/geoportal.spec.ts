import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Geoportal } from './geoportal';

describe('Geoportal', () => {
  let component: Geoportal;
  let fixture: ComponentFixture<Geoportal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Geoportal],
    }).compileComponents();

    fixture = TestBed.createComponent(Geoportal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
