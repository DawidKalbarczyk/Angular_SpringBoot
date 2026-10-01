import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Redirect } from './redirect';

describe('Redirect', () => {
  let component: Redirect;
  let fixture: ComponentFixture<Redirect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Redirect],
    }).compileComponents();

    fixture = TestBed.createComponent(Redirect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
