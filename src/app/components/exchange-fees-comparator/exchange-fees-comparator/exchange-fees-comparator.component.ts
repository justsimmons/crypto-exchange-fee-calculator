import { Component, OnInit, ViewChild} from '@angular/core';
import { MatTable } from '@angular/material/table';
import { CryptocurrencyPriceService } from 'src/app/services/cryptocurrency-price/cryptocurrency-price.service';
import { FeeCalculatorService } from 'src/app/services/fee-service/fee-calculator.service';
import { CryptoAsset } from 'src/app/shared/crypto-asset.model';
import { ExchangeCalculatorFormData } from 'src/app/shared/exchange-calculator-form-data.model';
import { ExchangeTransactionFees } from 'src/app/shared/exchange-transaction-fees.model';

@Component({
  selector: 'app-exchange-fees-comparator',
  templateUrl: './exchange-fees-comparator.component.html',
  styleUrls: ['./exchange-fees-comparator.component.scss']
})
export class ExchangeFeesComparatorComponent implements OnInit {

  @ViewChild(MatTable) table!: MatTable<Array<any>>;

  public isSideNavExpanded: boolean; // Keeps state of the sidenav, used to toggle expanded/hidden

  public displayedColumns: String[] = ["rank", "exchange", "fees"]; // Column headers for results table

  public feesList: Array<ExchangeTransactionFees>;
  public assetPriceInFiat: number | undefined;

  constructor(private feeCalculatorService: FeeCalculatorService,
              private priceService: CryptocurrencyPriceService) {
                
    this.isSideNavExpanded = true;
    this.feesList = [];
    this.assetPriceInFiat = undefined;
  }

  ngOnInit(): void {
  }

  /**
   * Calculates the transaction fees based off of the input provided by the user.
   */
  public calculateFees(input: ExchangeCalculatorFormData): void {
    // Get the list of fees each order would have on each exchange
    this.feesList = this.feeCalculatorService.calculateFeesOnOrder(input.purchaseAmount, input.asset, input.isMarketOrder, input.willWithdrawFunds);
    
    // Determines which columns to show in the output table
    this.determineResultsToDisplay(input.willWithdrawFunds);

     // Reset asset's fiat value as it could change or not be included
     this.assetPriceInFiat = undefined;

    if (input.willWithdrawFunds) {
      this.getAssetPriceInFiat(input.asset);
    }
  }

  public toggleSideNav(): void {
    this.isSideNavExpanded = !this.isSideNavExpanded;
  }

  /**
   * Sets the column headers in the results table.
   * @param userWithdrawFunds true if the user wants to move the funds off the exchange.
   */
  private determineResultsToDisplay(userWithdrawFunds: boolean): void {
    // If the user wants to withdraw the funds they are purchasing include a column that displays the fees
    if (userWithdrawFunds) {
      this.displayedColumns = ["rank", "exchange", "fees", "withdrawalFees", "total"];
    }
    else {
      this.displayedColumns = ["rank", "exchange", "fees"];
    }
  }

  /**
   * Async call to ger the current price of the crypto asset in USD. Has a sideffect of re
   */
  private getAssetPriceInFiat(asset: CryptoAsset): void {
    this.priceService.getPrice(asset.name).subscribe(
      (result) => {
        const currentPrice: number = JSON.parse(JSON.stringify(result))[asset.name.toLowerCase()].usd;

        if (currentPrice) {
          // Set the current price to be displated to the user
          this.assetPriceInFiat = currentPrice;

          this.updateOrderingToIncludeWithdrawalFees();
        }
    });
  }

  /**
   * Sort the exchange transaction fees, from lowest fees to highest fess, but factoring in withdrawal fees and the 
   * current price of the asset.
   */
  private updateOrderingToIncludeWithdrawalFees(): void {
    this.feesList.sort((e1, e2) => {
      let exchangeFees1 = e1.transactionFee;
      let exchangeFees2 = e2.transactionFee;

      if (this.assetPriceInFiat) {
        exchangeFees1 += (e1.withdrawalFeeInKind * this.assetPriceInFiat);
        exchangeFees2 += (e2.withdrawalFeeInKind * this.assetPriceInFiat);
      }

      if (exchangeFees1 < exchangeFees2) {
        return -1;
      }
      else if (exchangeFees1 > exchangeFees2) {
        return 1;
      }
  
      return 0; // The fees are equal
    });

    // Re-render the table rows to reflect the new fee status
    this.table.renderRows();
  }
}
