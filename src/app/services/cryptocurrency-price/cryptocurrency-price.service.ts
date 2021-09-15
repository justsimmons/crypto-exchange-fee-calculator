import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FiatCurrency } from 'src/app/enums/fiat-currency';
import { CryptoAsset } from 'src/app/shared/crypto-asset.model';

@Injectable({
  providedIn: 'root'
})
export class CryptocurrencyPriceService {

  public supportedCryptoCoinsAndTokens: BehaviorSubject<Array<CryptoAsset>> = new BehaviorSubject<Array<CryptoAsset>>([]);

  // Coingecko API 
  private readonly COINGECKO_API_BASE: string = 'https://api.coingecko.com/api/v3/';
  private readonly COINGECKO_API_SIMPLE_PRICE: string = 'simple/price';

  constructor(private httpClient: HttpClient) {
    this.supportedCryptoCoinsAndTokens.next(this.getSupportedCryptoCoinsAndTokens());
  }

  /**
   * Retrieves the current price of a Crypto asset. 
   * @param asset Crypto coin or token name to retrieve current price of. This is the name not the symbol. EX: provide Bitcoin not BTC.
   */
  public getPrice(asset: string): Observable<any> {
    return this.coingeckoApiGetCurrentPriceSingleCoin(asset);
  }


  /**
   * CoinGecko api to get the spor price of a current asset vs 1 or more fiat currencies. Right now it is only the USD but can be 
   * expanded for any number of fiat currencies. 
   * 
   * The response is a bit lackluster. They do not use a consistant naming schema for the response objects..
   * EX: 
   *    Request: https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
   *    Response: { "bitcoin" : { "usd" : 50000 } }
   * 
   *    Request: https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd
   *    Response: { "ethereum" : { "usd" : 3900 } }
   * 
   * As you can see the names of the objects differ depending on the asset, which makes it challenging to build a consistant response
   * interface to type the Observable. So I was forced to use any, which causes headaches downstream for the subscibers. The best way 
   * that I have found to access the value from the response object is:
   * JSON.parse(JSON.stringify(result))['asset full name lowercase']['currency code lowercase']
   * 
   * @param coin Crypto coin or token name to retrieve current price of. This is the name not the symbol. EX: provide Bitcoin not BTC.
   * @returns 
   */
  private coingeckoApiGetCurrentPriceSingleCoin(coin: string): Observable<any> {
    if (!coin) {
      throw new Error(`Unable to fetch current price as no coin was provided.`);
    }

    // Set query parameters for the api call
    const params: HttpParams = new HttpParams()
      .set('ids', coin)
      .set('vs_currencies', FiatCurrency.USD);

    return this.httpClient.get(
      `${this.COINGECKO_API_BASE}${this.COINGECKO_API_SIMPLE_PRICE}`, 
      {params}
    );
  }

  /**
   * Returns an array of the currently supported assests the calculator can use.
   */
  private getSupportedCryptoCoinsAndTokens(): Array<CryptoAsset> {
    return [
      { name: 'Bitcoin', symbol: 'BTC' },
      { name: 'Ethereum', symbol: 'ETH' },
      { name: 'Cardano', symbol: 'ADA' },
      { name: 'Polkadot', symbol: 'DOT' },
      { name: 'Solana', symbol: 'SOL' },
      { name: 'Monero', symbol: 'XMR' },
      { name: 'Chainlink', symbol: 'LINK' },
      { name: 'Polygon', symbol: 'MATIC' },
      { name: 'Filecoin', symbol: 'FIL' },
      { name: 'Algorand', symbol: 'ALGO' },
      { name: 'Litecoin', symbol: 'LTC' },
      { name: 'Ripple', symbol: 'XRP' }
    ];
  }
}
