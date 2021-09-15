import { CryptoAsset } from "./crypto-asset.model";

export interface ExchangeCalculatorFormData {
    purchaseAmount: number,
    asset: CryptoAsset,
    isMarketOrder: boolean,
    willWithdrawFunds: boolean
  }