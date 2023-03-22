import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import ERC20 from "@uniswap/v2-core/build/ERC20.json";
import IUniswapV2ERC20Build from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import IUniswapV2FactoryBuild from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2PairBuild from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IUniswapV2Router02Build from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";

import { BigNumber, constants, Contract, ContractFactory, Signer, utils } from "ethers";

import { UniswapV2Deployer } from "../src/v2/UniswapV2Deployer";

import { useEnvironment } from "./helpers";

import { SwapExactTokensForTokensOptions, DeployOptions, SwapTokensForExactTokensOptions, AddLiquidityOptions, RemoveLiquidityOptions, QuoteOptions, GetLiquidityValueInTermsOfTokenAOptions, AddLiquidityETHOptions } from "../types.d.ts";
//@ts-ignore
import { ethers } from "hardhat";

function eth(n: number): BigNumber {
  return utils.parseEther(n.toString());
}

describe("Integration Tests", function () {

  // describe("Hardhat Runtime Environment extension", function () {
  //   useEnvironment("hardhat-project");
  //   it("Should add extension UniswapV2Deployer", function () {
  //     assert.instanceOf(this.hre.UniswapV2Deployer, UniswapV2Deployer);
  //   });
  // });

  //   describe("Swap", function () {
  //     let token: Contract;
  //     let weth9: Contract;
  //     let signer: SignerWithAddress;
  //     let factory: Contract;
  //     let router: Contract;
  //     let AMOUNT_TOKEN: BigNumber;
  //     let AMOUNT_WETH9: BigNumber;
  //     let IUniswapV2Pair: { abi: any };

  //     beforeEach(async function () {
  //       AMOUNT_WETH9 = eth(1000);
  //       AMOUNT_TOKEN = eth(1000);

  //       [signer] = await this.hre.ethers.getSigners();
  //       const deployer = new UniswapV2Deployer();
  //       const result = await deployer.deploy(signer);

  //       IUniswapV2Pair = deployer.Interface.IUniswapV2Pair;
  //       factory = result.factory;
  //       router = result.router;
  //       weth9 = result.weth9;

  //       const Token = new ContractFactory(ERC20.abi, ERC20.bytecode, signer);
  //       token = await Token.deploy(AMOUNT_TOKEN);
  //       await token.deployed();

  //       await weth9.approve(router.address, AMOUNT_WETH9);
  //       await token.approve(router.address, AMOUNT_TOKEN);
  //     });

  //     it("Should add liquidity", async function () {
  //       await router.addLiquidityETH(
  //         token.address,
  //         AMOUNT_TOKEN,
  //         AMOUNT_TOKEN,
  //         AMOUNT_WETH9,
  //         signer.address,
  //         constants.MaxInt256,
  //         { value: AMOUNT_WETH9 }
  //       );

  //       const pairAddr = factory.getPair(token.address, weth9.address);
  //       const pair = await this.hre.ethers.getContractAt(
  //         IUniswapV2Pair.abi,
  //         pairAddr,
  //         signer
  //       );
  //       const { reserve0, reserve1 } = await pair.getReserves();
  //       assert.isTrue(AMOUNT_TOKEN.eq(reserve0));
  //       assert.isTrue(AMOUNT_WETH9.eq(reserve1));
  //     });

  //     it("Should swap", async function () {
  //       await router.addLiquidityETH(
  //         token.address,
  //         AMOUNT_TOKEN,
  //         AMOUNT_TOKEN,
  //         AMOUNT_WETH9,
  //         signer.address,
  //         constants.MaxInt256,
  //         { value: AMOUNT_WETH9 }
  //       );

  //       const beforeETH = await signer.getBalance();
  //       const beforeERC = await token.balanceOf(signer.address);
  //       const amount = eth(1);
  //       await router.swapExactETHForTokens(
  //         0,
  //         [weth9.address, token.address],
  //         signer.address,
  //         constants.MaxInt256,
  //         { value: amount }
  //       );
  //       const afterETH = await signer.getBalance();
  //       const afterERC = await token.balanceOf(signer.address);

  //       assert.isTrue(afterETH.lt(beforeETH.sub(amount)));
  //       assert.isTrue(afterERC.gt(beforeERC));
  //     });
  //   });
});
//@ts-ignore
describe("Unit Tests", function () {
  let AMOUNT_TOKEN: number;
  let AMOUNT_WETH9: number;
  describe("UniswapV2Deployer", function () {
    beforeEach(async function () {
      AMOUNT_WETH9 = 1000;
      AMOUNT_TOKEN = 1000;
    });
    useEnvironment("hardhat-project");
    
    
    describe("Deployment", function () {
      it("Should deploy WETH9", async function () {
        const [signer] = await ethers.getSigners();
        const deployer = new UniswapV2Deployer(this.hre);
        const { weth9 } = await deployer.deploy(signer);
        assert.equal(await weth9.name(), "Wrapped Ether");
        const provider = await ethers.getDefaultProvider();

        const balance = await weth9.balanceOf(await signer.getAddress());
      });

      it("Should deploy Factory", async function () {
        const [signer] = await ethers.getSigners();
        const deployer = new UniswapV2Deployer(this.hre);
        const { factory } = await deployer.deploy(signer);
        assert.equal(await factory.feeToSetter(), signer.address);
      });

      it("Should deploy Router", async function () {
        const [signer] = await ethers.getSigners();
        const deployer = new UniswapV2Deployer(this.hre);
        const { router, factory, weth9 } = await deployer.deploy(signer);
        assert.equal(await router.factory(), factory.address);
        assert.equal(await router.WETH(), weth9.address);
      });

      it("Should have Interface", async function () {
        const deployer = new UniswapV2Deployer(this.hre);
        expect(deployer.Interface.IUniswapV2Pair.abi).to.eql(
          IUniswapV2PairBuild.abi
        );
        expect(deployer.Interface.IUniswapV2ERC20.abi).to.eql(
          IUniswapV2ERC20Build.abi
        );
        expect(deployer.Interface.IUniswapV2Factory.abi).to.eql(
          IUniswapV2FactoryBuild.abi
        );
        expect(deployer.Interface.IUniswapV2Router02.abi).to.eql(
          IUniswapV2Router02Build.abi
        );
      });
    });
    describe("Helper Functions", function () {
      it("should create an ERC20", async function () {
        const [signer] = await ethers.getSigners();

        const v2Deployer = new UniswapV2Deployer(this.hre);
        await v2Deployer.deploy(signer);
        const test1 = await v2Deployer.createERC20(signer, "Test1", "TEST1")
        expect(await test1.name()).to.eq("Test1")
      });

      it("should get pair", async function () {
        const { v2Deployer, test1, test2, pair } = await addLiquidity(this.hre);
        if (await pair.token0() == test1.address) {
          expect(await pair.token0()).to.eq(test1.address)
          expect(await pair.token1()).to.eq(test2.address)
        } else if (await pair.token0() == test2.address) {
          expect(await pair.token0()).to.eq(test2.address)
          expect(await pair.token1()).to.eq(test1.address)
        } else {
          // pair is not made up of either token and will throw error
          expect(await pair.token0()).to.eq(test2.address)
        }
      })

      it("should quote", async function () {
        const [signer] = await ethers.getSigners();
        const { v2Deployer, test1, test2, pair } = await addLiquidity(this.hre);
        const quoteOptions: QuoteOptions = {
          signer: signer,
          tokenA: test1.address,
          tokenB: test2.address,
          amountA: 20
        }
        expect(ethers.utils.formatEther(await v2Deployer.quote(quoteOptions))).to.eq("20.0");
      })

      it("should get value of LP in terms of token A", async function () {
        const [signer] = await ethers.getSigners();
        const { v2Deployer, test1, test2, pair } = await addLiquidity(this.hre);
        const getLiquidityValueInTermsOfTokenAOptions: GetLiquidityValueInTermsOfTokenAOptions = {
          signer: signer,
          tokenA: test1.address,
          tokenB: test2.address,
          amountLiquidity: 5
        }
        expect(ethers.utils.formatEther((await v2Deployer.getLiquidityValueInTermsOfTokenA(getLiquidityValueInTermsOfTokenAOptions)).toString())).to.eq("10.0")
      })
    })

    describe("Router functionality", function () {
      it("Should add liquidity", async function () {
        const [signer] = await ethers.getSigners();
        const { v2Deployer, test1, test2, pair } = await addLiquidity(this.hre);
        expect(Number(ethers.utils.formatEther(await pair.balanceOf(await signer.getAddress())))).to.be.greaterThan(0)
      })

      it("should swapExactTokensForTokens", async function () {
        const { v2Deployer, test1, test2, pair } = await addLiquidity(this.hre);
        const [signer] = await ethers.getSigners();
        const test1BalanceBeforeSwap = await test1.balanceOf(await signer.getAddress())
        const swapOptions: SwapExactTokensForTokensOptions = {
          signer: signer,
          inputToken: test1.address,
          outputToken: test2.address,
          amountIn: 10
        }
        const quoteOptions: QuoteOptions = {
          signer: signer,
          tokenA: test1.address,
          tokenB: test2.address,
          amountA: 10
        }
        const quote = await v2Deployer.quote(quoteOptions);
        await v2Deployer.swapExactTokensForTokens(swapOptions);
        const test1BalanceAfterSwap = await test1.balanceOf(await signer.getAddress())
        expect(Number(ethers.utils.formatEther(test1BalanceBeforeSwap)) - Number(ethers.utils.formatEther(test1BalanceAfterSwap))).to.eq(Number(ethers.utils.formatEther(quote)))

      })

      it("should swapTokensForExactTokens", async function () {
        const { v2Deployer, test1, test2, pair } = await addLiquidity(this.hre);
        const [signer] = await ethers.getSigners();
        const test2BalanceBeforeSwap = await test2.balanceOf(await signer.getAddress())
        const swapOptions: SwapTokensForExactTokensOptions = {
          signer: signer,
          amountOut: 10,
          inputToken: test1.address,
          outputToken: test2.address,
        }
        await v2Deployer.swapTokensForExactTokens(swapOptions);
        const test2BalanceAfterSwap = await test2.balanceOf(await signer.getAddress())
        expect(Number(ethers.utils.formatEther(test2BalanceBeforeSwap))).to.eq(Number(ethers.utils.formatEther(test2BalanceAfterSwap)) - 10)
      })

      it("should remove liquidity", async function () {
        const [signer] = await ethers.getSigners();
        const { v2Deployer, test1, test2, pair } = await addLiquidity(this.hre);
        const pairBalance = await pair.balanceOf(await signer.getAddress())
        await pair.connect(signer).approve((await v2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
        const removeLiquidityOptions: RemoveLiquidityOptions = {
          signer: signer,
          tokenA: test1.address,
          tokenB: test2.address,
          amountLiquidity: pairBalance
        }
        await v2Deployer.removeLiquidity(removeLiquidityOptions)
        expect((await pair.balanceOf(await signer.getAddress())).toString()).to.eq('0')
      })

      it("should add liquidity ETH", async function () {
        const signers = await ethers.getSigners();
        const signer = signers[0]
        const v2Deployer = new UniswapV2Deployer(this.hre);
        const balance = await ethers.provider.getBalance(await signer.getAddress());
        const test1 = await v2Deployer.createERC20(signer, "Test1", "TEST1")
        await test1.connect(signer).approve((await v2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
        const addLiquidityETHOptions: AddLiquidityETHOptions = {
          signer: signer,
          token: test1.address,
          amountToken: 1000,
          amountETH: 5
        }
        await v2Deployer.addLiquidityETH(addLiquidityETHOptions)
        const balanceAfterAddEth = await ethers.provider.getBalance(await signer.getAddress());
        // account for some ETH burned as gas.
        expect(Number(ethers.utils.formatEther(balanceAfterAddEth.toString()))).to.be.lessThanOrEqual(Number(ethers.utils.formatEther(balance.toString())) - 5)
        expect(Number(ethers.utils.formatEther(balanceAfterAddEth.toString()))).to.be.greaterThan(Number(ethers.utils.formatEther(balance.toString())) - 5.05)
      })
    })
  })
});

async function addLiquidity(hre) {
  const [signer] = await ethers.getSigners();

  const v2Deployer = new UniswapV2Deployer(hre);
  await v2Deployer.deploy(signer);

  const test1 = await v2Deployer.createERC20(signer, "Test1", "TEST1")
  const test2 = await v2Deployer.createERC20(signer, "Test2", "TEST2")

  await test1.connect(signer).approve((await v2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
  await test2.connect(signer).approve((await v2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)

  const addLiquidityOptions: AddLiquidityOptions = {
    signer: signer,
    tokenA: test1.address,
    tokenB: test2.address,
    amountTokenA: 1000,
    amountTokenB: ethers.utils.parseEther("1000"),
  }

  await v2Deployer.addLiquidity(addLiquidityOptions)

  const pair = await v2Deployer.getPair(signer, test1.address, test2.address);


  return { v2Deployer, test1, test2, pair }
}
