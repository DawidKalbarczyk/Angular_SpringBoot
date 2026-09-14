import { TestBed } from '@angular/core/testing';

import { UpdateUser } from './update-user';

describe('UpdateUser', () => {
  let service: UpdateUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
