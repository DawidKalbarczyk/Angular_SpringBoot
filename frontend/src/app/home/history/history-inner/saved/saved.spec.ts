import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Saved } from './saved';

describe('HistoryInner', () => {
  let component: Saved;
  let fixture: ComponentFixture<Saved>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Saved],
    }).compileComponents();

    fixture = TestBed.createComponent(Saved);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
