import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryInner } from './history-inner';

describe('HistoryInner', () => {
  let component: HistoryInner;
  let fixture: ComponentFixture<HistoryInner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryInner],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryInner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
