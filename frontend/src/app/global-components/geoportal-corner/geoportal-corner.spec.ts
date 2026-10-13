import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoportalCorner } from './geoportal-corner';

describe('GeoportalCorner', () => {
  let component: GeoportalCorner;
  let fixture: ComponentFixture<GeoportalCorner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoportalCorner],
    }).compileComponents();

    fixture = TestBed.createComponent(GeoportalCorner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
