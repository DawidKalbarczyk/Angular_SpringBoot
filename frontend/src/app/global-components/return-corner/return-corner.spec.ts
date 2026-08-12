import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnCorner } from './return-corner';

describe('ReturnCorner', () => {
  let component: ReturnCorner;
  let fixture: ComponentFixture<ReturnCorner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnCorner],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnCorner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
