import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryMain } from './history-main';

describe('HistoryMain', () => {
  let component: HistoryMain;
  let fixture: ComponentFixture<HistoryMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryMain],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
