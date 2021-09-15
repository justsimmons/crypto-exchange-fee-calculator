export interface Fee {
    lowerBound: number, // Lowest amount that the fee applies to 
    upperBound: number // Highest amount that the fee applies to
    fee: number // Percentage of the trade the exchange takes as a fee
}