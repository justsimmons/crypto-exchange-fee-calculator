import { FeeType } from "../enums/fee-type.model";
import { FeeStructure } from "./fee-structure.model";
import { Fee } from "./fee.model";
import { WithdrawalFee } from "./withdrawal-fee.model";

export interface Exchange {
    name: string,
    url: string,
    tradingFees: Map<FeeType, Array<Fee>>,
    withdrawalFees: Array<WithdrawalFee> // Optional fee to withdraw assets off of exchanges
    nativeToken?: string // Some exchanges have a native token that will give you a discount on fees EX. Binance :: BNB
    isMobileOnly?: boolean
}