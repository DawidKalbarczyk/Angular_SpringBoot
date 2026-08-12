import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCorner } from './login-corner';

describe('LoginCorner', () => {
  let component: LoginCorner;
  let fixture: ComponentFixture<LoginCorner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCorner],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginCorner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
