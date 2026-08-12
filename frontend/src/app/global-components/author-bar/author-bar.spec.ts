import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorBar } from './author-bar';

describe('AuthorBar', () => {
  let component: AuthorBar;
  let fixture: ComponentFixture<AuthorBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorBar],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
