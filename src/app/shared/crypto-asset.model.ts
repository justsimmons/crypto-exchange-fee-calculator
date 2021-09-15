/*
 * I struggled with what to name this as there really isnt a concise name that encompases  the entire crypto space....
 * There are Tokens, Coins, Currencies, etc. So I have chosen to use the word Asset as a broad catch-all.
 * 
 * EXs: {Bitcoin, BTC}, {Ethereum, ETH}
 */
export interface CryptoAsset {
    name: string,
    symbol: string,
}