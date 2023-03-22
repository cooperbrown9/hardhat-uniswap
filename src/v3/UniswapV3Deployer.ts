import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants, Contract, ContractFactory, Signer, utils } from "ethers";
import deployFactory from "./deployers/deployFactory";
import deployRouter from "./deployers/deployRouter";
import deployWETH9 from "./deployers/deployWETH9";
import Interface from "./Interface";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CommonDeployers } from "../common";
import { ExactInputOptions, ExactInputSingleOptions, ExactOutputSingleOptions, MintOptions, ExactOutputOptions, CollectOptions, IncreaseLiquidityOptions, DecreaseLiquidityOptions } from "../../types.d.ts";
import deployTokenDescriptor from "./deployers/deployTokenDescriptor";
import deployPositionManager from "./deployers/deployPositionManager";
import deployNFTDescriptorLibrary from "./deployers/deployNFTDescriptorLibrary";
import { AbiCoder, parseEther, UnicodeNormalizationForm } from "ethers/lib/utils";
import { abi, bytecode } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"
import { calculateSqrtPriceX96, getNearestUsableTick } from "../util/tokenUtil";




export class UniswapV3Deployer {
  MIN_TICK = 0
  MAX_TICK = 100000
  MAX_UINT128 = BigNumber.from("340282366920938463463374607431768211455")

  public Interface = Interface;
  public deployer?: SignerWithAddress;
  public hre?: HardhatRuntimeEnvironment;

  private _factory?: Contract;
  private _router?: Contract;
  private _weth?: Contract;
  private _poolInitializer?: Contract;
  private _positionManager?: Contract;
  private _tokenDescriptor?: Contract;
  private _nftDescriptorLibrary?: Contract;
  private _tokens: Map<string, Contract>;

  constructor(hre: HardhatRuntimeEnvironment, _deployer?: SignerWithAddress) {
    this.hre = hre;
    this.deployer = _deployer;
    this._tokens = new Map()
  }

  public async deploy(signer: SignerWithAddress) {
    const { factory, Factory } = await deployFactory(signer);
    const { weth9, WETH9 } = await deployWETH9(signer);
    const { router, Router } = await deployRouter(signer, factory, weth9);
    const { nftDescriptorLibrary, NFTDescriptorLibrary } = await deployNFTDescriptorLibrary(signer);
    const { tokenDescriptor, TokenDescriptor } = await deployTokenDescriptor(signer, nftDescriptorLibrary, weth9);
    const { positionManager, PositionManager } = await deployPositionManager(signer, factory, weth9, tokenDescriptor)
    this._factory = factory;
    this._router = router;
    this._weth = weth9;
    this._tokenDescriptor = tokenDescriptor;
    this._positionManager = positionManager;
    this._nftDescriptorLibrary = nftDescriptorLibrary;
    return {
      weth9,
      WETH9,
      factory,
      Factory,
      router,
      Router,
      tokenDescriptor,
      TokenDescriptor,
      nftDescriptorLibrary,
      NFTDescriptorLibrary,
      positionManager,
      PositionManager
    };

  }

  public async getWeth(signer: SignerWithAddress): Promise<Contract> {
    if (!this._weth) {
      const { weth9 } = await deployWETH9(signer)
      this._weth = weth9;
    }
    return this._weth;
  }

  public async getFactory(signer: SignerWithAddress): Promise<Contract> {
    if (!this._factory) {
      const { factory } = await deployFactory(signer)
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

  public async getTokenDescriptor(signer: SignerWithAddress): Promise<Contract> {
    if (!this._tokenDescriptor) {
      const { tokenDescriptor } = await deployTokenDescriptor(signer, await this.getNftDescriptorLibrary(signer), await this.getWeth(signer))
      this._tokenDescriptor = tokenDescriptor;
    }
    return this._tokenDescriptor;
  }
  public async getPositionManager(signer: SignerWithAddress): Promise<Contract> {
    if (!this._positionManager) {
      const { positionManager } = await deployPositionManager(signer, await this.getFactory(signer), await this.getWeth(signer), await this.getTokenDescriptor(signer))
      this._positionManager = positionManager;
    }
    return this._positionManager;
  }
  public async getNftDescriptorLibrary(signer: SignerWithAddress): Promise<Contract> {
    if (!this._nftDescriptorLibrary) {
      const { nftDescriptorLibrary } = await deployNFTDescriptorLibrary(signer)
      this._nftDescriptorLibrary = nftDescriptorLibrary;
    }
    return this._nftDescriptorLibrary;
  }

  public async createERC20(signer: SignerWithAddress, name: string, symbol: string): Promise<Contract> {
    const { erc20 } = await CommonDeployers.deployERC20(signer, name, symbol);
    this._tokens.set(erc20.address, erc20);
    return erc20;
  }

  public getERC20(address: string): Contract | undefined {
    return this._tokens.get(address);
  }

  public async exactInputSingle(options: ExactInputSingleOptions) {
    const router = await this.getRouter(options.signer)
    const amountInEther = parseEther(options.amountIn.toString());

    const exactInputSingleParams = {
      tokenIn: options.tokenIn,
      tokenOut: options.tokenOut,
      fee: options.fee,
      recipient: (await options.signer.getAddress()),
      deadline: Math.floor(Date.now() / 1000) + 1000,
      amountIn: amountInEther,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    }
    await router.connect(options.signer).exactInputSingle(exactInputSingleParams)
  }

  public async exactInput(options: ExactInputOptions) {
    const router = await this.getRouter(options.signer)
    const amountInEther = parseEther(options.amountIn.toString());
    let types = Array(options.path.length).fill("address")
    for (let i = 0; i < options.path.length; i++) {
      if (i % 2 != 0) {
        types[i] = "uint24"
      }
    }
    //@ts-ignore
    const path = this.hre.ethers.utils.solidityPack(types, options.path);

    const exactInputParams = {
      path: path,
      recipient: await options.signer.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 1000,
      amountIn: amountInEther,
      amountOutMinimum: 0
    }
    await router.connect(options.signer).exactInput(exactInputParams);
  }

  public async exactOutputSingle(options: ExactOutputSingleOptions) {
    const router = await this.getRouter(options.signer)
    const amountOutEther = parseEther(options.amountOut.toString());
    const exactOutputSingleParams = {
      tokenIn: options.tokenIn,
      tokenOut: options.tokenOut,
      fee: options.fee,
      recipient: (await options.signer.getAddress()),
      deadline: Math.floor(Date.now() / 1000) + 1000,
      amountOut: amountOutEther.toString(),
      //@ts-ignore
      amountInMaximum: parseEther("1000000000"),
      sqrtPriceLimitX96: 0
    }
    await router.connect(options.signer).exactOutputSingle(exactOutputSingleParams);

  }

  public async exactOutput(options: ExactOutputOptions) {
    const router = await this.getRouter(options.signer)
    const amountOutEther = parseEther(options.amountOut.toString());
    let types = Array(options.path.length).fill("address")
    for (let i = 0; i < options.path.length; i++) {
      if (i % 2 != 0) {
        types[i] = "uint24"
      }
    }
    //@ts-ignore
    const path = this.hre.ethers.utils.solidityPack(types, options.path);

    const exactOutputParams = {
      path: path,
      recipient: await options.signer.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 1000,
      amountOut: amountOutEther,
      //@ts-ignore
      amountInMaximum: this.hre.ethers.constants.MaxInt256
    }
    await router.connect(options.signer).exactOutput(exactOutputParams);
  }

  public async mintPosition(options: MintOptions): Promise<Number> {
    const positionManager = await this.getPositionManager(options.signer)
    const signerAddress = await options.signer.getAddress()

    //Parse amounts into ether
    const amount0DesiredInEther = parseEther(options.amount0Desired.toString());
    const amount1DesiredInEther = parseEther(options.amount1Desired.toString());

    // Approve Tokens
    //@ts-ignore
    await (this._tokens.get(options.token0)).connect(options.signer).approve(positionManager.address, this.hre.ethers.constants.MaxInt256);
    //@ts-ignore
    await (this._tokens.get(options.token1)).connect(options.signer).approve(positionManager.address, this.hre.ethers.constants.MaxInt256);

    let token0, token1;

    // Sort tokens to avoid revert() from createAndInitializePoolIfNecessary in PoolInitializer
    if (options.token0 < options.token1) {
      token0 = options.token0;
      token1 = options.token1;
    } else {
      token0 = options.token1;
      token1 = options.token0;
    }
    // calculate squareRootPrice for desired price
    const sqrtPrice = calculateSqrtPriceX96(options.price, 18, 18)

    // create and initialize pool if necessary
    await positionManager.connect(options.signer).createAndInitializePoolIfNecessary(token0, token1, 3000, sqrtPrice.toFixed(0))

    const poolAddress = await (await this.getFactory(options.signer)).getPool(token0, token1, 3000)
    const Pool = new ContractFactory(abi, bytecode);
    const pool = await Pool.attach(poolAddress);
    let slot0 = await pool.connect(options.signer).slot0();

    // get tick spacing info and nearest tick from Pool
    let tickSpacing = parseInt(await pool.connect(options.signer).tickSpacing())
    let nearestTick = getNearestUsableTick(parseInt(slot0.tick), tickSpacing)

    const mintParams = {
      token0: token0,
      token1: token1,
      fee: options.fee,
      tickLower: nearestTick - tickSpacing * 2,
      tickUpper: nearestTick + tickSpacing * 2,
      amount0Desired: amount0DesiredInEther,
      amount1Desired: amount1DesiredInEther,
      amount0Min: 0,
      amount1Min: 0,
      recipient: signerAddress,
      deadline: 9678825033
    }

    // Mint with desired amounts
    const res = await positionManager.connect(options.signer).mint(mintParams)
    const tx = await res.wait()
    return Number(tx.logs[tx.logs.length - 1].topics[1]);

  }

  public async collectFees(options: CollectOptions): Promise<Number> {
    const positionManager = await this.getPositionManager(options.signer)
    const collectParams = {
      tokenId: options.tokenId,
      recipient: await options.signer.getAddress(),
      amount0Max: this.MAX_UINT128,
      amount1Max: this.MAX_UINT128
    }
    const res = await positionManager.collect(collectParams)
    const tx = await res.wait()
    // console.log(tx.events)


    const args = tx.events[tx.events.length - 1].args;
    const amount0 = args[2]
    const amount1 = args[3]
    console.log("amount0", amount0.toString())
    console.log("amount1", amount1.toString())
    console.log("tokenid", args[0])
    return Number(tx.logs[tx.logs.length - 1].topics[1])
  }

  public async increaseLiquidity(options: IncreaseLiquidityOptions) {
    const positionManager = await this.getPositionManager(options.signer)
    const amount0DesiredEth = parseEther(options.amount0Desired.toString())
    const amount1DesiredEth = parseEther(options.amount1Desired.toString())
    const increaseLiquidityParams = {
      tokenId: options.tokenId,
      amount0Desired: amount0DesiredEth,
      amount1Desired: amount1DesiredEth,
      amount0Min: 0,
      amount1Min: 0,
      deadline: Math.floor(Date.now() / 1000) + 1000
    }

    await positionManager.connect(options.signer).increaseLiquidity(increaseLiquidityParams)

  }
  public async decreaseLiquidity(options: DecreaseLiquidityOptions): Promise<Array<number>> {
    const positionManager = await this.getPositionManager(options.signer)
    const liquidityEth = parseEther(options.liquidity.toString())
    const decreaseLiquidityParams = {
      tokenId: options.tokenId,
      liquidity: liquidityEth,
      amount0Min: 0,
      amount1Min: 0,
      deadline: Math.floor(Date.now() / 1000) + 1000
    }
    const res = await positionManager.connect(options.signer).decreaseLiquidity(decreaseLiquidityParams)
    const tx = await res.wait();
    const args = tx.events[tx.events.length - 1].args;
    const amount0 = args[2]
    const amount1 = args[3]
    console.log(args)
    console.log("amount0", amount0.toString())
    console.log("amount2", amount1.toString())
    return [amount0, amount1]

  }

}
