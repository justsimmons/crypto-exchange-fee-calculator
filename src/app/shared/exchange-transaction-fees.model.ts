import { CryptoAsset } from "./crypto-asset.model";
import { Exchange } from "./exchange.model";

export interface ExchangeTransactionFees {
    exchange: Exchange,
    transactionFee: number,
    asset: CryptoAsset | undefined,
    withdrawalFeeInKind: number,
  }