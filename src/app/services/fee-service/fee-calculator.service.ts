import { Injectable, Output } from '@angular/core';
import { Exchange } from 'src/app/shared/exchange.model';
import { FeeType } from "src/app/enums/fee-type.model";
import { Fee } from 'src/app/shared/fee.model';
import { CryptoExchangeService } from '../crypto-exchange/crypto-exchange.service';
import { CryptocurrencyPriceService } from '../cryptocurrency-price/cryptocurrency-price.service';
import { CryptoAsset } from 'src/app/shared/crypto-asset.model';
import { ExchangeTransactionFees } from 'src/app/shared/exchange-transaction-fees.model';

@Injectable({
  providedIn: 'root'
})
export class FeeCalculatorService {

  private exchanges: Map<String, Exchange>;

  constructor(private cryptoExchangeService: CryptoExchangeService) { 

    // Initialize
    this.exchanges = this.cryptoExchangeService.getCryptoExchanges();
  }
  
  public calculateFeesOnOrder(
    amount: number, 
    asset: CryptoAsset, 
    isMarketOrder: boolean,
    withdrawAssets: boolean): Array<ExchangeTransactionFees> {
    
    // Calculate the fees for the transaction across all supported exchanges
    let feesPaidForAllExchanges = this.calculateTransactionFees(amount, isMarketOrder);
    
    if (withdrawAssets) {
      // Calculate the fees to witdraw the asset in its native currency, AKA fee in BTC to withdraw BTC
      feesPaidForAllExchanges.forEach(entry => {
        entry.withdrawalFeeInKind = this.getWithdrawalFeeInKind(entry.exchange, asset);
        entry.asset = asset;
      });
    }
    
    // Order the fees so the exchanges with the lowest fees appear first
    // Does not factor in the cost of withdraw fees as these are priced in the asset and prices can fluctuate widely
    // It is the responsibility of the caller to make that calclation and reorder in real time as the price changes
    feesPaidForAllExchanges.sort((exchange1, exchange2) => {
      const exchangeFees1 = exchange1.transactionFee;
      const exchangeFees2 = exchange2.transactionFee;

      if (exchangeFees1 < exchangeFees2) {
        return -1;
      }
      else if (exchangeFees1 > exchangeFees2) {
        return 1;
      }

      return 0; // The fees are equal
    });

    return feesPaidForAllExchanges;
  }

  /**
   * Calculates the fee a provided exchange charges to withdraw a specific crypto asset. Not all exchanges charge 
   * such a fee so it is possible it could be $0.00.
   */
  private getWithdrawalFeeInKind(exchange: Exchange, asset: CryptoAsset): number {
    if (!exchange || !asset || !asset.symbol) {
      throw new Error("Cannot determine withdrawal fees for the asset.");
    }

    if (!exchange.withdrawalFees) {
      return 0;
    }
    
    let withdrawFeeInKind: number = 0;

    exchange.withdrawalFees!.forEach((withdrawalFee) =>{
      // Symbols are more unique than names, similar to stock tickers. There will only ever be one BTC, ETH...
      if (withdrawalFee.asset
          && withdrawalFee.asset.symbol.toLowerCase() === asset.symbol.toLowerCase()
          && withdrawalFee.withdrawalFee) {

        withdrawFeeInKind = withdrawalFee.withdrawalFee;
      }
    });
    
    return withdrawFeeInKind;

  }

  /**
   * Finds the tier that a specific transaction falls into. Generally speaking there are two type of Fee Models cryptocurrency
   * exchanges currently use. A maker/taker model, or a flat fee model. 
   * 
   * A maker/taker fee model has a fee that is applied to the transaction but it is variable, based off of the amount transacted.
   * 
   * A flat fee model behaves one of two ways, it is a flat fee across any transaction amount. Or it is a flat fee that changes 
   * based off of the amount of the transaction. In either case it is more or less a tiered system. In the case of the flat fee 
   * across all amounts it is just a single tier.
   * 
   * Since in both models there is the possibility for a variable fee based off of transaction amount, this method exists to 
   * find the correct fee in all models based off of transaction amounts. 
   */
  private findFeeTierForPurchaseAmount(
    exchange: Exchange, 
    transactionAmount: number, 
    feeModel: FeeType,
    ThirtyDayTradingVolume: number | null): Fee | undefined {

    if (!exchange.tradingFees.has(feeModel)) {
      // Log error and keep calculating the values for the other exchanges
      console.warn(`This fee model does not exist on the ${exchange.name} exchange.`);
      return undefined;
    }

    let feeTier: Fee | undefined = undefined; 

    if (feeModel === FeeType.FLAT) {
      // For now I have not added any Exchanges that support this model as they are vastly more expensive fee wise than the maker/taker model
    }
    else {
      // Maker/Taker fees will be calculated with the same process, they just have different values for the fee tiers

      if (ThirtyDayTradingVolume) {
        feeTier = exchange.tradingFees.get(feeModel)!.find(feeTier =>  {
          return transactionAmount >= feeTier.lowerBound && transactionAmount <= feeTier.upperBound
        });
      } 
      else {
        // The simple calculator assumes user has no previous trades so they will always pay the first tier
        feeTier = exchange.tradingFees.get(feeModel)![0];
      }
    }
    
    return feeTier;
  }

  /**
   * Calculates the transaction fees for a buy/sell order on all supported exchanges.
   * @param amount Amount of the crypto asset you are buying in fiat currency.
   * @param isMarketOrder True if the user is making a market order, false indicates limit order.
   * @param asset Type of crypto asset the user is going to buy
   * @returns Object containing the name of the exchange and the fees to complete the transaction. DOES NOT INCLUDE WITHDRAWAL FEES.
   */
  private calculateTransactionFees(amount: number, isMarketOrder: boolean): Array<ExchangeTransactionFees> {
    let feesPaidForAllExchanges = new Array<ExchangeTransactionFees>();

    let feeModel: FeeType;

    this.exchanges.forEach(exchange => {
      
      if (!isMarketOrder) {
        // It is a limit order
        feeModel = FeeType.MAKER;
      }
      else {
        // It is a market order
        feeModel = FeeType.TAKER;
      }

      // Find the specific tier in a traunced fee system that the order applies to
      const feeTier = this.findFeeTierForPurchaseAmount(exchange, amount, feeModel, null);

      if (feeTier && feeTier.fee) { // Edge case: If the tier doesnt exist than undefined will be returned
        // Calculate fees charged by given exchange, fee percentage needs to be adjusted
        // EX: [$1000, 0.5%] ==> 1000 * 0.005 = $5
        const feesCharged = amount * (feeTier.fee / 100);

        if (feesCharged || feesCharged === 0) { // Falsy values include 0, which is acceptable in this case
          // Tally the fees changed by the exchange
          feesPaidForAllExchanges.push({
              exchange: exchange, 
              transactionFee: feesCharged, 
              asset: undefined,   // Default value
              withdrawalFeeInKind: 0,   // Default value
          });
        }
      }
    });

    return feesPaidForAllExchanges;
  }
}
