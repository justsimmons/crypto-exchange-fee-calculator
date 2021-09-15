import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeFeesComparatorComponent } from './exchange-fees-comparator.component';

describe('ExchangeFeesComparatorComponent', () => {
  let component: ExchangeFeesComparatorComponent;
  let fixture: ComponentFixture<ExchangeFeesComparatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExchangeFeesComparatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeFeesComparatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
