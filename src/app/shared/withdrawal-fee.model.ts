import { CryptoAsset } from "./crypto-asset.model";

export interface WithdrawalFee {
    asset?: CryptoAsset,
    withdrawalFee?: number,
    minimumWithdrawalAmount?: number,
  }