import { TestBed } from '@angular/core/testing';

import { FeeCalculatorService } from './fee-calculator.service';

describe('FeeCalculatorServiceService', () => {
  let service: FeeCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeeCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
