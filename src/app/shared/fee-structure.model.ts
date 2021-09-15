import { FeeType } from "../enums/fee-type.model";
import { Fee } from "./fee.model";

export interface FeeStructure {
    type: FeeType, // Dependent on the model used by the exchange. Generally Maker/Taker or flat fee structure
    tiers: Array<Fee> // Fee tiers if Maker/Taker
}