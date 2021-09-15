import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { monetaryValueValidator } from 'src/app/shared/monetary-value.directive';
import { ExchangeCalculatorFormData } from 'src/app/shared/exchange-calculator-form-data.model';
import { CryptocurrencyPriceService } from 'src/app/services/cryptocurrency-price/cryptocurrency-price.service';
import { CryptoAsset } from 'src/app/shared/crypto-asset.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss']
})
export class PurchaseFormComponent implements OnInit, OnDestroy {

  public form: FormGroup = this.formBuilder.group({
    purchaseAmount: ['', [Validators.required, monetaryValueValidator()]],
    orderType: ['market', Validators.required],
    withdrawFunds: [false],
    assetToWithdraw: ['']
  });

  @Output() userInput: EventEmitter<ExchangeCalculatorFormData>;

  public assets: Array<CryptoAsset>; 

  private subscriptions: Array<Subscription>;
  
  constructor(private formBuilder: FormBuilder,
              private cryptoPriceService: CryptocurrencyPriceService) { 

    this.userInput = new EventEmitter<ExchangeCalculatorFormData>();
    this.assets = [];
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.subscriptions.push(this.cryptoPriceService.supportedCryptoCoinsAndTokens.subscribe(
      (updatedAssets) => {
        this.assets = updatedAssets;
      }
    ));
  }

  public ngOnDestroy(): void {
    // Unsubscribe all outstanding subscriptions to conserve memory
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
  }

  /**
   * To be called when the user submits the form. Emits a ExchangeCalculatorFormData object with the form data to the calling function.
   */
  public onSubmit(): void {
    if (this.form.invalid) {
      // Required form fields are filled out incorrectly
      return;
    }

    // Optional depending on if the user specifies to withdraw
    const assetToWithdraw = this.form.get('assetToWithdraw')!.value;

    this.userInput.emit({
      purchaseAmount: this.form.get('purchaseAmount')!.value, 
      asset: assetToWithdraw ? assetToWithdraw : undefined,
      isMarketOrder: this.form.get('orderType')!.value === 'market' ? true : false,
      willWithdrawFunds: this.form.get('withdrawFunds')?.value
    });
  }
}
