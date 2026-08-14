import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoportalHeadbar } from './geoportal-headbar';

describe('GeoportalHeadbar', () => {
  let component: GeoportalHeadbar;
  let fixture: ComponentFixture<GeoportalHeadbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoportalHeadbar],
    }).compileComponents();

    fixture = TestBed.createComponent(GeoportalHeadbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
