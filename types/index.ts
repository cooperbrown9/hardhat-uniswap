import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Bytes, Signer } from "ethers";

export interface AddLiquidityOptions {
    signer?: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountTokenA: number | BigNumber;
    amountTokenB: number | BigNumber;
}

export interface RemoveLiquidityOptions {
    signer?: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountLiquidity: number | BigNumber;
}
export interface RemoveLiquidityETHOptions {
    signer?: SignerWithAddress;
    token: string;
    amountLiquidity: number | BigNumber;
}
export interface SwapExactTokensForTokensOptions {
    signer?: SignerWithAddress;
    amountIn: number | BigNumber;
    inputToken: string;
    outputToken: string;
}

export interface SwapTokensForExactTokensOptions {
    signer?: SignerWithAddress;
    amountOut: number | BigNumber;
    inputToken: string;
    outputToken: string;
}

export interface QuoteOptions {
    signer?: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountA: number | BigNumber;
}

export interface GetLiquidityValueInTermsOfTokenAOptions {
    signer?: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountLiquidity: number | BigNumber;
}
export interface AddLiquidityETHOptions {
    signer?: SignerWithAddress;
    token: string;
    amountToken: number | BigNumber;
    amountETH: number | BigNumber;
}


//V3 Types
export interface ExactInputSingleOptions {
    signer?: SignerWithAddress;
    tokenIn: string;
    tokenOut: string;
    fee: number;
    amountIn: number | BigNumber;
}

export interface ExactInputOptions {
    signer?: SignerWithAddress;
    path: Array<string | number>;
    amountIn: number | BigNumber;
}

export interface ExactOutputSingleOptions {
    signer?: SignerWithAddress,
    tokenIn: string;
    tokenOut: string;
    fee: number;
    amountOut: number | BigNumber;
}

export interface ExactOutputOptions {
    signer?: SignerWithAddress;
    path: Array<string | number>;
    amountOut: number | BigNumber;
}


export interface MintOptions {
    signer?: SignerWithAddress;
    token0: string;
    token1: string;
    fee: number;
    amount0Desired: number | BigNumber;
    amount1Desired: number | BigNumber;
    price: number;
}

export interface CollectOptions {
    signer?: SignerWithAddress;
    tokenId: number;
}

export interface IncreaseLiquidityOptions {
    signer?: SignerWithAddress;
    tokenId: number;
    amount0Desired: number | BigNumber;
    amount1Desired: number | BigNumber;
}

export interface DecreaseLiquidityOptions {
    signer?: SignerWithAddress;
    tokenId: number;
    amountLiquidity: number | BigNumber;
}
