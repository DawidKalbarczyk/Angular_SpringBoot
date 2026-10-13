import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoportalTemp } from './geoportal-temp';

describe('GeoportalTemp', () => {
  let component: GeoportalTemp;
  let fixture: ComponentFixture<GeoportalTemp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoportalTemp],
    }).compileComponents();

    fixture = TestBed.createComponent(GeoportalTemp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
