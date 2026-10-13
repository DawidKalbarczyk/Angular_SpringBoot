import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchClose } from './search-close';

describe('SearchClose', () => {
  let component: SearchClose;
  let fixture: ComponentFixture<SearchClose>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchClose],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchClose);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
