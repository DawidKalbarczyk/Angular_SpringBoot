import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureComponent } from './measure-component';

describe('MeasureComponent', () => {
  let component: MeasureComponent;
  let fixture: ComponentFixture<MeasureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeasureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
