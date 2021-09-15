import { TestBed } from '@angular/core/testing';

import { CryptocurrencyPriceService } from './cryptocurrency-price.service';

describe('CryptocurrencyPriceService', () => {
  let service: CryptocurrencyPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptocurrencyPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
