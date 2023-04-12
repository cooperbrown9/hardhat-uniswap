import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants, Contract } from "ethers";

import deployFactory from "./deployers/deployFactory";
import deployRouter from "./deployers/deployRouter";
import deployWETH9 from "./deployers/deployWETH9";
import Interface from "./interfaces/Interface";
import { SwapExactTokensForTokensOptions, AddLiquidityOptions, RemoveLiquidityOptions, QuoteOptions, SwapTokensForExactTokensOptions, GetLiquidityValueInTermsOfTokenAOptions, RemoveLiquidityETHOptions, AddLiquidityETHOptions } from "../../types";

import { CommonDeployers } from "../common";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatEther, parseEther } from "ethers/lib/utils";

export class UniswapV2Deployer {
  public Interface = Interface;
  private _factory?: Contract;
  private _router?: Contract;
  private _weth?: Contract;
  private _tokens: Map<string, Contract>;

  private _signer: SignerWithAddress;

  public hre?: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment, _signer: SignerWithAddress) {
    this.hre = hre;
    this._signer = _signer;
    this._tokens = new Map()
  }

  public setSigner(_signer: SignerWithAddress) {
    this._signer = _signer;
  }

  public async deploy(signer: SignerWithAddress = this._signer) {
    const { factory, Factory } = await deployFactory(signer, signer);
    const { weth9, WETH9 } = await deployWETH9(signer);
    const { router, Router } = await deployRouter(signer, factory, weth9);

    this._factory = factory;
    this._router = router;
    this._weth = weth9;

    return {
      weth9,
      WETH9,
      factory,
      Factory,
      router,
      Router,
    };
  }


  /**
   * @param signer 
   * @returns the WETH contract
   */
  public async getWeth(signer: SignerWithAddress = this._signer): Promise<Contract> {
    if (!this._weth) {
      const { weth9 } = await deployWETH9(signer)
      this._weth = weth9;
    }
    return this._weth;
  }

  /**
   * @remarks if the UniswapV2Factory hasn't been created yet, it will create it and return it to you
   * @param signer 
   * @returns UniswapV2Factory 
   */
  public async getFactory(signer: SignerWithAddress = this._signer): Promise<Contract> {
    if (!this._factory) {
      const { factory } = await deployFactory(signer, signer)
      this._factory = factory;
    }
    return this._factory;
  }

  /**
   * @remarks if the UniswapV2Router02 hasn't been created yet, it will create it and return it to you
   * @param signer 
   * @returns UniswapV2Router02
   */
  public async getRouter(signer: SignerWithAddress = this._signer): Promise<Contract> {
    if (!this._router) {
      const { router } = await deployRouter(signer, await this.getFactory(signer), await this.getWeth(signer))
      this._router = router;
    }
    return this._router;
  }

  /**
   * @param signer 
   * @param tokenA address
   * @param tokenB address
   * @returns LP token for tokenA and tokenB
   */
  public async getPair(tokenA: string, tokenB: string, signer: SignerWithAddress = this._signer) {
    const factory = await this.getFactory(signer);
    const pairAddress = await factory.getPair(tokenA, tokenB);
    //@ts-ignore
    const pair = await this.hre.ethers.getContractAt(
      require("@uniswap/v2-core/build/UniswapV2Pair.json")
        .abi,
      pairAddress

    );
    return pair;
  }

  /** 
   * @remarks deploys and saves the token to UniswapV2Deployer._tokens
   * @param signer 
   * @param name 
   * @param symbol 
   * @returns deployed ERC20 contract
   */
  public async createERC20(name: string, symbol: string, signer: SignerWithAddress = this._signer): Promise<Contract> {
    const { erc20 } = await CommonDeployers.deployERC20(signer, name, symbol, await this.getRouter(signer));
    this._tokens.set(erc20.address, erc20);
    return erc20;
  }

  /**
   * @param address 
   * @returns ERC20 for a given address
   */
  public getERC20(address: string): Contract | undefined {
    return this._tokens.get(address);
  }

  /**
   * @remarks Use this function to add V2 liquidity for an ERC20 token pair
   * @param {AddLiquidityOptions} options
   * @member {SignerWithAddress} signer
   * @member {string} tokenA
   * @member {string} tokenB
   * @member {number | BigNumber} amountTokenA
   * @member {number | BigNumber} amountTokenB?
   */
  public async addLiquidity(options: AddLiquidityOptions) {
    options.signer ??= this._signer;

    const router = await this.getRouter(options.signer)
    this.addLiquidity
    let amountAEther = options.amountTokenA;
    let amountBEther = options.amountTokenB;
    if (typeof options.amountTokenA == "number") {
      amountAEther = parseEther(options.amountTokenA.toString())
    }
    if (typeof options.amountTokenB == "number") {
      amountBEther = parseEther(options.amountTokenB.toString())
    }
    await router.connect(options.signer).addLiquidity(options.tokenA, options.tokenB, amountAEther, amountBEther, 1, 1, (await options.signer.getAddress()), 9678825033);
  }

  /**
   * @remarks Use this function to add V2 liquidity for an ETH token pair
   * @param {AddLiquidityETHOptions} options
   * @member {SignerWithAddress} signer
   * @member {string} token
   * @member {number | BigNumber} amountToken
   * @member {number | BigNumber} amountETH
   */
  public async addLiquidityETH(options: AddLiquidityETHOptions) {
    options.signer ??= this._signer;

    const router = await this.getRouter(options.signer)
    let amountTokenEther = options.amountToken;
    let amountETHEther = options.amountETH;
    if (typeof options.amountToken == "number") {
      amountTokenEther = parseEther(options.amountToken.toString())
    }
    if (typeof options.amountETH == "number") {
      amountETHEther = parseEther(options.amountETH.toString())
    }
    await router.connect(options.signer).addLiquidityETH(options.token, amountTokenEther, 1, 1, (await options.signer.getAddress()), 9678825033, { value: amountETHEther });
  }

  /**
  * @param {RemoveLiquidityOptions} options
  * @member {SignerWithAddress} signer
  * @member {string} tokenA
  * @member {string} tokenB
  * @member {number | BigNumber} amountLiquidity
  */
  public async removeLiquidity(options: RemoveLiquidityOptions) {
    options.signer ??= this._signer;

    const router = await this.getRouter(options.signer)
    let liquidityEther = options.amountLiquidity;
    if (typeof options.amountLiquidity == "number") {
      liquidityEther = parseEther(options.amountLiquidity.toString())
    }
    await router.connect(options.signer).removeLiquidity(options.tokenA, options.tokenB, liquidityEther, 1, 1, (await options.signer.getAddress()), 9678825033)
  }
  /**
  * @param {RemoveLiquidityETHOptions} options
  * @member {SignerWithAddress} signer
  * @member {string} token
  * @member {number | BigNumber} amountLiquidity
  */
  public async removeLiquidityETH(options: RemoveLiquidityETHOptions) {
    options.signer ??= this._signer;

    const router = await this.getRouter(options.signer)
    let liquidityEther = options.amountLiquidity;
    if (typeof options.amountLiquidity == "number") {
      liquidityEther = parseEther(options.amountLiquidity.toString());
    }
    await router.removeLiquidityETH(options.token, liquidityEther, 1, 1, (await options.signer.getAddress()), 9678825033)
  }
  /**
   * @remarks This wraps `swapExactTokensForTokens` -- use this for a general swap
  * @param {SwapExactTokensForTokensOptions} options
  * @member {SignerWithAddress} signer
  * @member {number | BigNumber} amountIn
  * @member {string} inputToken
  * @member {string} outputToken
  */
  public async swap(options: SwapExactTokensForTokensOptions) {
    options.signer ??= this._signer;
    const router = await this.getRouter(options.signer)
    let amountInEther = options.amountIn;
    if (typeof options.amountIn == "number") {
      amountInEther = parseEther(options.amountIn.toString());
    }
    const path = [options.inputToken, options.outputToken]
    await router.swapExactTokensForTokens(amountInEther, 1, path, (await options.signer.getAddress()), 9678825033)
  }

  /**
   * @remarks Use this to swap if your priority is ensuring the amount of tokens you get out
  * @param {SwapTokensForExactTokensOptions} options
  * @member {SignerWithAddress} signer
  * @member {number | BigNumber} amountOut
  * @member {string} inputToken
  * @member {string} outputToken
  */
  public async swapTokensForExactTokens(options: SwapTokensForExactTokensOptions): Promise<void> {
    options.signer ??= this._signer;

    let amountOutEther = options.amountOut;
    if (typeof options.amountOut == "number") {
      amountOutEther = parseEther(options.amountOut.toString());
    }
    const router = await this.getRouter(options.signer)
    const path = [options.inputToken, options.outputToken]
    await router.swapTokensForExactTokens(amountOutEther, constants.MaxInt256, path, (await options.signer.getAddress()), 9678825033)
  }

  /**
    * @remarks Get the price of tokenA in terms of tokenB
    * @param {QuoteOptions} options
    * @member {SignerWithAddress} signer
    * @member {string} tokenA
    * @member {string} tokenB
    * @member {number | BigNumber} amountA
  */
  public async quote(options: QuoteOptions): Promise<BigNumber> {
    options.signer ??= this._signer;
    const router = await this.getRouter(options.signer)
    let amountAEther = options.amountA;
    if (typeof options.amountA == "number") {
      amountAEther = parseEther(options.amountA.toString());
    }
    const pair = await this.getPair(options.tokenA, options.tokenB, options.signer);
    let reserveA, reserveB, timestamp
    // Sort reserves with tokens
    if (options.tokenA == await pair.token0()) {
      [reserveA, reserveB, timestamp] = await pair.getReserves()
    } else {
      [reserveB, reserveA, timestamp] = await pair.getReserves()

    }
    const quoteAmount = await router.quote(amountAEther, reserveA, reserveB)
    return quoteAmount
  }
  /**
   * @remarks Get the value of liquidity in terms of token A. 
   * @param {GetLiquidityValueInTermsOfTokenAOptions} options
   * @member {SignerWithAddress} signer
   * @member {string} tokenA
   * @member {string} tokenB
   * @member {number | BigNumber} amountLiquidity -- amount of LP tokens you want to know the value of
  */
  public async getLiquidityValueInTermsOfTokenA(options: GetLiquidityValueInTermsOfTokenAOptions): Promise<BigNumber> {
    options.signer ??= this._signer;
    const pair = await this.getPair(options.tokenA, options.tokenB, options.signer);

    let reserveA, reserveB, timestamp
    if (options.tokenA == await pair.token0()) {
      [reserveA, reserveB, timestamp] = await pair.getReserves()
    } else {
      [reserveB, reserveA, timestamp] = await pair.getReserves()
    }
    const tvl = reserveA * 2
    const singleLp = tvl * Number(parseEther("1")) / (await pair.totalSupply())
    if (typeof options.amountLiquidity == "number") {
      return BigNumber.from((singleLp * options.amountLiquidity).toString());
    } else {
      return BigNumber.from((singleLp * Number(formatEther(options.amountLiquidity))).toString())
    }
  }
}
