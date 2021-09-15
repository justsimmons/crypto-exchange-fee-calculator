import { Injectable } from '@angular/core';
import { FeeType } from 'src/app/enums/fee-type.model';
import { CryptoAsset } from 'src/app/shared/crypto-asset.model';
import { Exchange } from 'src/app/shared/exchange.model';
import { Fee } from 'src/app/shared/fee.model';
import { WithdrawalFee } from 'src/app/shared/withdrawal-fee.model';
import { CryptocurrencyPriceService } from '../cryptocurrency-price/cryptocurrency-price.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoExchangeService {

  // Cache of all crypto exchanges the app supports
  private exchanges: Map<String, Exchange>;

  private supportedAssets: Array<CryptoAsset>;

  constructor(private priceService: CryptocurrencyPriceService) { 
    // Initialize variables
    this.exchanges = new Map<String, Exchange>();

    this.supportedAssets = [];

    // Subscribe to updates to supported assets for the app
    this.priceService.supportedCryptoCoinsAndTokens.subscribe(
      (updatedSupportedAssets) => {
        this.supportedAssets = updatedSupportedAssets;
      }
    );

    // Populate data
    this.exchanges.set('Coinbase Pro', this.getCoinbaseProData());
    this.exchanges.set('Kraken Pro', this.getKrakenProData());
    this.exchanges.set('Binance.US', this.getBinanceUsData());
    this.exchanges.set('Crypto.com', this.getCryptoDotComData());
    this.exchanges.set('Gemini Active Trader', this.getGeminiActiveTraderData());
    this.exchanges.set('FTX US', this.getFtxData());
    this.exchanges.set('Kucoin', this.getKucoinData());
  }

  public getCryptoExchanges(): Map<String, Exchange> {
    return this.exchanges; // TODO: Deep Copy so callee cannot modify 
  }
    

  /**
   * Wrapper method to generate an Exchange object, method does all the required input validation.
   * 
   * @param name Name of the exchage to create
   * @param tradingFees trading fees 
   * @param url URL of the exchange 
   */
  private generateExchange(
    name: string, 
    tradingFees: Map<FeeType, Array<Fee>>,
    withdrawalFees?: Array<WithdrawalFee>,
    url?: string, 
    isMobileOnly: boolean = false): Exchange {

    if (!name) {
      throw new Error(`Could not initlialize Exchange object.`);
    }

    if (!url) {
      // No URL is provided, not necessary for core logic, used for display purposes
      console.warn(`${name} exchange object was not initialized with a URL.`);
      url = "";
    }

    // Check to make sure there is at least one fee listed on the exchange
    if (!tradingFees || tradingFees.size < 1) {
      throw new Error(`Could not initlialize ${name} exchange object, no trading fee information provided.`);
    }

    // Some exchanges dont have withdrawal fees, if not explicitly set assume the exchange doesnt have any
    if (!withdrawalFees || withdrawalFees.length < 1) {
      console.log(`Withdrawal fees not specified on ${name} exchange, assumed none.`);
      withdrawalFees = new Array();
    }

    return {
      name: name,
      url: url,
      tradingFees: tradingFees,
      withdrawalFees: withdrawalFees,
      isMobileOnly: isMobileOnly
    };
  }

  /**
   * Get data and fee structure for the Coinbase Pro exchange. This will eventually become a DB call.
   */
   private getCoinbaseProData(): Exchange {
    let tradingFees = new Map<FeeType, Array<Fee>>();

    let fees = new Array<Fee>();
    // Add Taker Fees
    // fees.push({lowerBound: 0, upperBound: 1, fee: 0.04}); // Is part of their fee schedule but not possible in app to buy <$10
    fees.push({lowerBound: 1.01, upperBound: 10000, fee: 0.50});
    fees.push({lowerBound: 10000.01, upperBound: 50000, fee: 0.35});
    fees.push({lowerBound: 50000.01, upperBound: 100000, fee: 0.25});
    fees.push({lowerBound: 100000.01, upperBound: 1000000, fee: 0.20});
    fees.push({lowerBound: 10000000.01, upperBound: 20000000, fee: 0.18});
    fees.push({lowerBound: 20000000.01, upperBound: 100000000, fee: 0.15});
    fees.push({lowerBound: 100000000.01, upperBound: 500000000, fee: 0.10});
    fees.push({lowerBound: 500000000.01, upperBound: 1000000000, fee: 0.06});
    fees.push({lowerBound: 1000000000.01, upperBound: 2000000000, fee: 0.05});
    fees.push({lowerBound: 2000000000.01, upperBound: Number.POSITIVE_INFINITY, fee: 0.04});

    tradingFees.set(FeeType.TAKER, fees);

    fees = new Array<Fee>(); // Clear taker fees

    // Add Maker Fees
    // fees.push({lowerBound: 0, upperBound: 1, fee: 0}); // Is part of their fee schedule but not possible in app to buy <$10
    fees.push({lowerBound: 1.01, upperBound: 10000, fee: 0.50});
    fees.push({lowerBound: 10000.01, upperBound: 50000, fee: 0.35});
    fees.push({lowerBound: 50000.01, upperBound: 100000, fee: 0.15});
    fees.push({lowerBound: 100000.01, upperBound: 1000000, fee: 0.10});
    fees.push({lowerBound: 10000000.01, upperBound: 20000000, fee: 0.08});
    fees.push({lowerBound: 20000000.01, upperBound: 100000000, fee: 0.05});
    fees.push({lowerBound: 100000000.01, upperBound: 500000000, fee: 0.02});
    fees.push({lowerBound: 500000000.01, upperBound: 1000000000, fee: 0});
    fees.push({lowerBound: 1000000000.01, upperBound: 2000000000, fee: 0});
    fees.push({lowerBound: 2000000000.01, upperBound: Number.POSITIVE_INFINITY, fee: 0});

    tradingFees.set(FeeType.MAKER, fees);

    return this.generateExchange('Coinbase Pro', tradingFees, [], 'https://pro.coinbase.com/');
  }

  /**
   * Get data and fee structure for the Kraken Pro exchange.
   */
   private getKrakenProData(): Exchange {
    let tradingFees = new Map<FeeType, Array<Fee>>();

    let fees = new Array<Fee>();
    // Add Taker Fees
    fees.push({lowerBound: 0, upperBound: 50000.99, fee: 0.26});
    fees.push({lowerBound: 50001, upperBound: 100000.99, fee: 0.24});
    fees.push({lowerBound: 100001, upperBound: 250000.99, fee: 0.22});
    fees.push({lowerBound: 250001, upperBound: 500000.99, fee: 0.20});
    fees.push({lowerBound: 500001, upperBound: 1000000.99, fee: 0.18});
    fees.push({lowerBound: 1000001, upperBound: 2500000.99, fee: 0.16});
    fees.push({lowerBound: 2500001, upperBound: 5000000.99, fee: 0.14});
    fees.push({lowerBound: 5000001, upperBound: 10000000, fee: 0.12});
    fees.push({lowerBound: 10000000.01, upperBound: Number.POSITIVE_INFINITY, fee: 0.10});

    tradingFees.set(FeeType.TAKER, fees);

    fees = new Array<Fee>(); // Clear taker fees

    // Add Maker Fees
    fees.push({lowerBound: 0, upperBound: 50000.99, fee: 0.16});
    fees.push({lowerBound: 50001, upperBound: 100000.99, fee: 0.14});
    fees.push({lowerBound: 100001, upperBound: 250000.99, fee: 0.12});
    fees.push({lowerBound: 250001, upperBound: 500000.99, fee: 0.10});
    fees.push({lowerBound: 500001, upperBound: 1000000.99, fee: 0.08});
    fees.push({lowerBound: 1000001, upperBound: 2500000.99, fee: 0.06});
    fees.push({lowerBound: 2500001, upperBound: 5000000.99, fee: 0.04});
    fees.push({lowerBound: 5000001, upperBound: 10000000, fee: 0.02});
    fees.push({lowerBound: 10000000.01, upperBound: Number.POSITIVE_INFINITY, fee: 0});

    tradingFees.set(FeeType.MAKER, fees);

    const withdrawalFees: Array<WithdrawalFee> = [
      { asset: this.findAsset('BTC'), withdrawalFee: 0.00015, minimumWithdrawalAmount: 0.0005 },
      { asset: this.findAsset('ETH'), withdrawalFee: 0.0035, minimumWithdrawalAmount: 0.005 },
      { asset: this.findAsset('ADA'), withdrawalFee: 1, minimumWithdrawalAmount: 5 },
      { asset: this.findAsset('DOT'), withdrawalFee: 0.05, minimumWithdrawalAmount: 1.05 },
      { asset: this.findAsset('MATIC'), withdrawalFee: 15, minimumWithdrawalAmount: 30 },
      { asset: this.findAsset('SOL'), withdrawalFee: 0.01, minimumWithdrawalAmount: 0.02 },
      { asset: this.findAsset('XRP'), withdrawalFee: 0.02, minimumWithdrawalAmount: 25 },
      { asset: this.findAsset('XMR'), withdrawalFee: 0.0001, minimumWithdrawalAmount: 0.01 },
      { asset: this.findAsset('LTC'), withdrawalFee: 0.002, minimumWithdrawalAmount: 0.01 },
      { asset: this.findAsset('FIL'), withdrawalFee: 0.01, minimumWithdrawalAmount: 0.1 },
      { asset: this.findAsset('LINK'), withdrawalFee: 0.7, minimumWithdrawalAmount: 1.5 },
      { asset: this.findAsset('ALGO'), withdrawalFee: 0.01, minimumWithdrawalAmount: 1 },
    ];

    return this.generateExchange('Kraken Pro', tradingFees, withdrawalFees, 'https://www.kraken.com/');
  }

  /**
   * Get data and fee structure for the Binance.US exchange.
   */
   private getBinanceUsData(): Exchange {
    let tradingFees = new Map<FeeType, Array<Fee>>();

    let fees = new Array<Fee>();
    // Add Taker Fees
    fees.push({lowerBound: 0, upperBound: Number.POSITIVE_INFINITY, fee: 0.1});

    tradingFees.set(FeeType.TAKER, fees);
    tradingFees.set(FeeType.MAKER, fees);

    const withdrawalFees: Array<WithdrawalFee> = [
      { asset: this.findAsset('BTC'), withdrawalFee: 0.0005, minimumWithdrawalAmount: 0.001 },
      { asset: this.findAsset('ETH'), withdrawalFee: 0.007, minimumWithdrawalAmount: 0.003 },
      { asset: this.findAsset('ADA'), withdrawalFee: 1, minimumWithdrawalAmount: 8 }
    ];

    return this.generateExchange('Binance.US', tradingFees, withdrawalFees, 'https://www.binance.us/');
  }
  
    /**
     * Get data and fee structure for the Crypto.com exchange. 
     */
     private getCryptoDotComData(): Exchange {
      let tradingFees = new Map<FeeType, Array<Fee>>();
  
      let fees = new Array<Fee>();
      // Add Taker Fees
      fees.push({lowerBound: 0, upperBound: 25000.99, fee: 0.4});
      fees.push({lowerBound: 25001, upperBound: 50000.99, fee: 0.35});
      fees.push({lowerBound: 50001, upperBound: 100000.99, fee: 0.25});
      fees.push({lowerBound: 100001, upperBound: 250000.99, fee: 0.16});
      fees.push({lowerBound: 250001, upperBound: 1000000.99, fee: 0.15});
      fees.push({lowerBound: 1000001, upperBound: 20000000.99, fee: 0.14});
      fees.push({lowerBound: 20000001, upperBound: 100000000.99, fee: 0.13});
      fees.push({lowerBound: 100000001, upperBound: 200000000.99, fee: 0.12});
      fees.push({lowerBound: 200000001, upperBound: Number.POSITIVE_INFINITY, fee: 0.1});
  
      tradingFees.set(FeeType.TAKER, fees);
  
      fees = new Array<Fee>(); // Clear taker fees
  
      // Add Maker Fees
      fees.push({lowerBound: 0, upperBound: 25000.99, fee: 0.4});
      fees.push({lowerBound: 25001, upperBound: 50000.99, fee: 0.35});
      fees.push({lowerBound: 50001, upperBound: 100000.99, fee: 0.15});
      fees.push({lowerBound: 100001, upperBound: 250000.99, fee: 0.10});
      fees.push({lowerBound: 250001, upperBound: 1000000.99, fee: 0.09});
      fees.push({lowerBound: 1000001, upperBound: 20000000.99, fee: 0.08});
      fees.push({lowerBound: 20000001, upperBound: 100000000.99, fee: 0.07});
      fees.push({lowerBound: 100000001, upperBound: 200000000.99, fee: 0.06});
      fees.push({lowerBound: 200000001, upperBound: Number.POSITIVE_INFINITY, fee: 0.04});
  
      tradingFees.set(FeeType.MAKER, fees);

      const withdrawalFees: Array<WithdrawalFee> = [
        { asset: this.findAsset('BTC'), withdrawalFee: 0.0005, minimumWithdrawalAmount: 0.0004 },
        { asset: this.findAsset('ETH'), withdrawalFee: 0.016, minimumWithdrawalAmount: 0.008 },
        { asset: this.findAsset('ADA'), withdrawalFee: 2, minimumWithdrawalAmount: 100 }
      ];
  
      return this.generateExchange('Crypto.com', tradingFees, withdrawalFees, 'https://crypto.com/us/');
    }

    /**
     * Get data and fee structure for the Crypto.com exchange. This will eventually become a DB call.
     * 
     * Gemini does not charge withdrawal fees for <= 10 withdrawals per month. If you time it right you 
     * will not pay any fees so I have not included them in this calculator.
     */
     private getGeminiActiveTraderData(): Exchange {
      let tradingFees = new Map<FeeType, Array<Fee>>();
  
      let fees = new Array<Fee>();
      // Add Taker Fees
      fees.push({lowerBound: 0, upperBound: 499999.99, fee: 0.35});
      fees.push({lowerBound: 500000, upperBound: 2499999.99, fee: 0.25});
      fees.push({lowerBound: 2500000, upperBound: 4999999.99, fee: 0.25});
      fees.push({lowerBound: 5000000, upperBound: 9999999.99, fee: 0.15}); 
      fees.push({lowerBound: 10000000, upperBound: 14999999.99, fee: 0.15});
      fees.push({lowerBound: 15000000, upperBound: 49999999.99, fee: 0.1});
      fees.push({lowerBound: 50000000, upperBound: 99999999.99, fee: 0.075});
      fees.push({lowerBound: 100000000, upperBound: 249999999.99, fee: 0.05});
      fees.push({lowerBound: 250000000, upperBound: 499999999.99, fee: 0.04});
      fees.push({lowerBound: 500000000, upperBound: Number.POSITIVE_INFINITY, fee: 0.03});
  
      tradingFees.set(FeeType.TAKER, fees);
  
      fees = new Array<Fee>(); // Clear taker fees
  
      // Add Maker Fees
      fees.push({lowerBound: 0, upperBound: 499999.99, fee: 0.25});
      fees.push({lowerBound: 500000, upperBound: 2499999.99, fee: 0.15});
      fees.push({lowerBound: 2500000, upperBound: 4999999.99, fee: 0.15});
      fees.push({lowerBound: 5000000, upperBound: 9999999.99, fee: 0.1}); 
      fees.push({lowerBound: 10000000, upperBound: 14999999.99, fee: 0.1});
      fees.push({lowerBound: 15000000, upperBound: Number.POSITIVE_INFINITY, fee: 0});

      tradingFees.set(FeeType.MAKER, fees);
  
      return this.generateExchange('Gemini Active Trader', tradingFees, [], 'https://www.gemini.com/activetrader');
    }

    /**
     * Get data and fee structure for the FTX exchange.
     * 
     * TODO: Figure out a way to display this in the data
     * FTX.US pays the withdrawal blockchain fees for all tokens except for ERC20/ETH & OMNI token withdrawals. 
     * https://help.ftx.us/hc/en-us/articles/360043579273-Fees
     * 
     * ERC20 token withdraws covered if you stake native exchange token
     * https://help.ftx.com/hc/en-us/articles/360034865571-Blockchain-Deposits-and-Withdrawals
     */
     private getFtxData(): Exchange {
      let tradingFees = new Map<FeeType, Array<Fee>>();
      
      // Add Taker Fees
      tradingFees.set(
        FeeType.TAKER, 
        [
          { lowerBound: 0, upperBound: 100000, fee: 0.4 },
          { lowerBound: 100000.01, upperBound: 500000, fee: 0.3 },
          { lowerBound: 500000.01, upperBound: 1000000, fee: 0.2 },
          { lowerBound: 1000000.01, upperBound: 5000000, fee: 0.15 },
          { lowerBound: 5000000.01, upperBound: 10000000, fee: 0.1 },
          { lowerBound: 10000000.01, upperBound: 15000000, fee: 0.08 },
          { lowerBound: 15000000.01, upperBound: 30000000, fee: 0.07 },
          { lowerBound: 30000000.01, upperBound: 50000000, fee: 0.06 },
          { lowerBound: 50000000.01, upperBound: Number.POSITIVE_INFINITY, fee: 0.05 }
        ]
      );
  
      // Add Maker Fees
      tradingFees.set(
        FeeType.MAKER, 
        [
          { lowerBound: 0, upperBound: 100000, fee: 0.1 },
          { lowerBound: 100000.01, upperBound: 500000, fee: 0.08 },
          { lowerBound: 500000.01, upperBound: 1000000, fee: 0.06 },
          { lowerBound: 1000000.01, upperBound: 5000000, fee: 0.05 },
          { lowerBound: 5000000.01, upperBound: 10000000, fee: 0.04 },
          { lowerBound: 10000000.01, upperBound: 15000000, fee: 0.03 },
          { lowerBound: 15000000.01, upperBound: 30000000, fee: 0.02 },
          { lowerBound: 30000000.01, upperBound: 50000000, fee: 0.01 },
          { lowerBound: 50000000.01, upperBound: Number.POSITIVE_INFINITY, fee: 0 }
        ]
      );
  
      return this.generateExchange('FTX US', tradingFees, [], 'https://ftx.us/');
    }

    /**
     * Get data and fee structure for the kucoin exchange.
     * 
     * Kucoin fees are tricky as they are calculated using BTC and not USD. I have only included tier 1 for now.
     */
     private getKucoinData(): Exchange {
      let tradingFees = new Map<FeeType, Array<Fee>>();

      // Add Taker Fees
      tradingFees.set(
        FeeType.TAKER, 
        [{ lowerBound: 0, upperBound: Number.POSITIVE_INFINITY, fee: 0.1 }]
      );
  
      // Add Maker Fees
      tradingFees.set(
        FeeType.MAKER, 
        [{ lowerBound: 0, upperBound: Number.POSITIVE_INFINITY, fee: 0.1 }]
      );

      const withdrawalFees: Array<WithdrawalFee> = [
        { asset: this.findAsset('BTC'), withdrawalFee: 0.0006, minimumWithdrawalAmount: 0.001 },
        { asset: this.findAsset('ETH'), withdrawalFee: 0.004, minimumWithdrawalAmount: 0 },
        { asset: this.findAsset('ADA'), withdrawalFee: 1, minimumWithdrawalAmount: 2 },
        { asset: this.findAsset('DOT'), withdrawalFee: 0.01, minimumWithdrawalAmount: 2 },
        { asset: this.findAsset('SOL'), withdrawalFee: 0.01, minimumWithdrawalAmount: 0.2 },
        { asset: this.findAsset('XMR'), withdrawalFee: 0.001, minimumWithdrawalAmount: 0.02 },
        { asset: this.findAsset('LINK'), withdrawalFee: 1, minimumWithdrawalAmount: 2 },
        { asset: this.findAsset('MATIC'), withdrawalFee: 20, minimumWithdrawalAmount: 40 },
        { asset: this.findAsset('FIL'), withdrawalFee: 0.001, minimumWithdrawalAmount: 0.1 },
        { asset: this.findAsset('XRP'), withdrawalFee: 0.02, minimumWithdrawalAmount: 20.2 },
        { asset: this.findAsset('LTC'), withdrawalFee: 0.001, minimumWithdrawalAmount: 0.002 },
        { asset: this.findAsset('ALGO'), withdrawalFee: 0.1, minimumWithdrawalAmount: 0.2 },
      ];
  
      return this.generateExchange('Kucoin', tradingFees, withdrawalFees, 'https://www.kucoin.com/');
    }

    private findAsset(x: string): CryptoAsset | undefined {
      return this.supportedAssets.find(asset => asset.symbol === x);
    }
}
