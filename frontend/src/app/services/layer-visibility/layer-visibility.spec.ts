import { TestBed } from '@angular/core/testing';
import { LayerVisibility } from './layer-visibility';

describe('LayerVisibility', () => {
  let service: LayerVisibility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayerVisibility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
