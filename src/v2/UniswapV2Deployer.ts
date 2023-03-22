import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants, Contract } from "ethers";

import deployFactory from "./deployers/deployFactory";
import deployRouter from "./deployers/deployRouter";
import deployWETH9 from "./deployers/deployWETH9";
import Interface from "./interfaces/Interface";
import { SwapExactTokensForTokensOptions, AddLiquidityOptions, RemoveLiquidityOptions, QuoteOptions, SwapTokensForExactTokensOptions, GetLiquidityValueInTermsOfTokenAOptions, RemoveLiquidityETHOptions, AddLiquidityETHOptions } from "../../types";

import { CommonDeployers } from "../common";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { parseEther } from "ethers/lib/utils";

export class UniswapV2Deployer {
  public Interface = Interface;
  private _factory?: Contract;
  private _router?: Contract;
  private _weth?: Contract;
  private _tokens: Map<string, Contract>;

  public signer?: SignerWithAddress;

  public hre?: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment, _signer?: SignerWithAddress) {
    this.hre = hre;
    this.signer = _signer;
    this._tokens = new Map()
  }

  public setSigner(_signer: SignerWithAddress) {
    this.signer = _signer;
  }

  public async deploy(signer: SignerWithAddress) {
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
   * Returns the WETH contract
   * @param signer 
   * @returns 
   */
  public async getWeth(signer: SignerWithAddress): Promise<Contract> {
    if (!this._weth) {
      const { weth9 } = await deployWETH9(signer)
      this._weth = weth9;
    }
    return this._weth;
  }

  public async getFactory(signer: SignerWithAddress): Promise<Contract> {
    if (!this._factory) {
      const { factory } = await deployFactory(signer, signer)
      this._factory = factory;
    }
    return this._factory;
  }

  public async getRouter(signer: SignerWithAddress): Promise<Contract> {
    if (!this._router) {
      const { router } = await deployRouter(signer, await this.getFactory(signer), await this.getWeth(signer))
      this._router = router;
    }
    return this._router;
  }

  public async getPair(signer: SignerWithAddress, tokenA: String, tokenB: String) {
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
   * @param signer 
   * @param name 
   * @param symbol 
   */
  public async createERC20(signer: SignerWithAddress, name: string, symbol: string): Promise<Contract> {
    const { erc20 } = await CommonDeployers.deployERC20(signer, name, symbol);
    this._tokens.set(erc20.address, erc20);
    return erc20;
  }

  public getERC20(address: string): Contract | undefined {
    this.createERC20()
    return this._tokens.get(address);
  }

  /**
   * @param {AddLiquidityOptions} options
   */
  public async addLiquidity(options: AddLiquidityOptions) {
    const router = await this.getRouter(options.signer)
    let amountAEther = options.amountTokenA;
    let amountBEther = options.amountTokenB;
    if(typeof options.amountTokenA == "number") {
      amountAEther = await parseEther(options.amountTokenA.toString())
    }
    if(typeof options.amountTokenB == "number") {
      amountBEther = await parseEther(options.amountTokenB.toString())
    }
    await router.connect(options.signer).addLiquidity(options.tokenA, options.tokenB, amountAEther, amountBEther, 1, 1, (await options.signer.getAddress()), 9678825033);
  }

  public async addLiquidityETH(options: AddLiquidityETHOptions) {
    const router = await this.getRouter(options.signer)
    let amountTokenEther= await parseEther(options.amountToken.toString())
    let amountETHEther = await parseEther(options.amountETH.toString())
    await router.connect(options.signer).addLiquidityETH(options.token, amountTokenEther, 1, 1, (await options.signer.getAddress()), 9678825033, {value: amountETHEther});
  }

  public async removeLiquidity(options: RemoveLiquidityOptions) {
    const router = await this.getRouter(options.signer)
    let liquidityEther = options.amountLiquidity;
    if(typeof options.amountLiquidity == "number") {
      liquidityEther = parseEther(options.amountLiquidity.toString())
    } 
    await router.connect(options.signer).removeLiquidity(options.tokenA, options.tokenB, liquidityEther, 1, 1, (await options.signer.getAddress()), 9678825033)
  }

  public async removeLiquidityETH(options: RemoveLiquidityETHOptions) {
    const router = await this.getRouter(options.signer)
    const liquidityEther = parseEther(options.amountLiquidity.toString())
    await router.removeLiquidityETH(options.token, liquidityEther, 1, 1, (await options.signer.getAddress()), 9678825033)
  }

  public async swapExactTokensForTokens(options: SwapExactTokensForTokensOptions) {
    const router = await this.getRouter(options.signer)
    options.outputToken
    const path = [options.inputToken, options.outputToken]
    const amountInEther = parseEther(options.amountIn.toString());
    await router.swapExactTokensForTokens(amountInEther, 1, path, (await options.signer.getAddress()), 9678825033)
  }

  public async swapTokensForExactTokens(options: SwapTokensForExactTokensOptions) {
    const router = await this.getRouter(options.signer)
    const path = [options.inputToken, options.outputToken]
    const amountOutEther = parseEther(options.amountOut.toString());
    await router.swapTokensForExactTokens(amountOutEther, constants.MaxInt256, path, (await options.signer.getAddress()), 9678825033)
  }

  public async quote(options: QuoteOptions): Promise<BigNumber> {
    const router = await this.getRouter(options.signer)
    const amountAEther = parseEther(options.amountA.toString())
    const pair = await this.getPair(options.signer, options.tokenA, options.tokenB);
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

  public async getLiquidityValueInTermsOfTokenA(options: GetLiquidityValueInTermsOfTokenAOptions): Promise<BigNumber> {
    const router = await this.getRouter(options.signer)
    const pair = await this.getPair(options.signer, options.tokenA, options.tokenB);

    let reserveA, reserveB, timestamp
    // Sort reserves with tokens
    if (options.tokenA == await pair.token0()) {
      [reserveA, reserveB, timestamp] = await pair.getReserves()
    } else {
      [reserveB, reserveA, timestamp] = await pair.getReserves()
    }
    const tvl = reserveA * 2
    const singleLp = tvl * Number(parseEther("1")) / (await pair.totalSupply())
    
    return BigNumber.from((singleLp * options.amountLiquidity).toString());
  }
}
