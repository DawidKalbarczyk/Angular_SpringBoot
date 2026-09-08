import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysysComponent } from './analysys-component';

describe('AnalysysComponent', () => {
  let component: AnalysysComponent;
  let fixture: ComponentFixture<AnalysysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysysComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysysComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
