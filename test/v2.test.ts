import IUniswapV2ERC20Build from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import IUniswapV2FactoryBuild from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2PairBuild from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IUniswapV2Router02Build from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import { assert, expect } from "chai";

import { BigNumber, utils } from "ethers";

import { useEnvironment } from "./helpers";

import { SwapExactTokensForTokensOptions, SwapTokensForExactTokensOptions, AddLiquidityOptions, RemoveLiquidityOptions, QuoteOptions, GetLiquidityValueInTermsOfTokenAOptions, AddLiquidityETHOptions } from "../types";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

function eth(n: number): BigNumber {
  return utils.parseEther(n.toString());
}

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
      it('should load UniswapV2Deployer on HRE', async function() {
        assert.equal(true, true)
      });

      it("Should deploy WETH9", async function () {
        const [signer] = await this.hre.ethers.getSigners();
        const { weth9 } = await this.hre.UniswapV2Deployer.deploy(signer);
        assert.equal(await weth9.name(), "Wrapped Ether");
      });

      it("Should deploy Factory", async function () {
        const [signer] = await this.hre.ethers.getSigners();
        const { factory } = await this.hre.UniswapV2Deployer.deploy(signer);
        assert.equal(await factory.feeToSetter(), signer.address);
      });

      it("Should deploy Router", async function () {
        const [signer] = await this.hre.ethers.getSigners();
        const { router, factory, weth9 } = await this.hre.UniswapV2Deployer.deploy(signer);
        assert.equal(await router.factory(), factory.address);
        assert.equal(await router.WETH(), weth9.address);
      });

      it("Should have Interface", async function () {
        expect(this.hre.UniswapV2Deployer.Interface.IUniswapV2Pair.abi).to.eql(
          IUniswapV2PairBuild.abi
        );
        expect(this.hre.UniswapV2Deployer.Interface.IUniswapV2ERC20.abi).to.eql(
          IUniswapV2ERC20Build.abi
        );
        expect(this.hre.UniswapV2Deployer.Interface.IUniswapV2Factory.abi).to.eql(
          IUniswapV2FactoryBuild.abi
        );
        expect(this.hre.UniswapV2Deployer.Interface.IUniswapV2Router02.abi).to.eql(
          IUniswapV2Router02Build.abi
        );
      });
    });
    describe("Helper Functions", function () {
      it("should create an ERC20", async function () {
        const [signer] = await this.hre.ethers.getSigners();

        await this.hre.UniswapV2Deployer.deploy(signer)
        const test1 = await this.hre.UniswapV2Deployer.createERC20(signer, "Test1", "TEST1")
        expect(await test1.name()).to.eq("Test1")
      });

      it("should get pair", async function () {

        const { test1, test2, pair } = await addLiquidity(this.hre);
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
        const [signer] = await this.hre.ethers.getSigners();
        const { test1, test2, pair } = await addLiquidity(this.hre);
        const quoteOptions: QuoteOptions = {
          signer: signer,
          tokenA: test1.address,
          tokenB: test2.address,
          amountA: 20
        }
        expect(ethers.utils.formatEther(await this.hre.UniswapV2Deployer.quote(quoteOptions))).to.eq("20.0");
      })

      it("should get value of LP in terms of token A", async function () {
        const [signer] = await this.hre.ethers.getSigners();
        const { test1, test2, pair } = await addLiquidity(this.hre);
        const getLiquidityValueInTermsOfTokenAOptions: GetLiquidityValueInTermsOfTokenAOptions = {
          signer: signer,
          tokenA: test1.address,
          tokenB: test2.address,
          amountLiquidity: 5
        }
        expect(ethers.utils.formatEther((await this.hre.UniswapV2Deployer.getLiquidityValueInTermsOfTokenA(getLiquidityValueInTermsOfTokenAOptions)).toString())).to.eq("10.0")
      })
    })

    describe("Router functionality", function () {
      it("Should add liquidity", async function () {
        const [signer] = await this.hre.ethers.getSigners();
        const { test1, test2, pair } = await addLiquidity(this.hre);
        expect(Number(ethers.utils.formatEther(await pair.balanceOf(await signer.getAddress())))).to.be.greaterThan(0)
      })

      it("should swapExactTokensForTokens", async function () {
        const { test1, test2, pair } = await addLiquidity(this.hre);
        const [signer] = await this.hre.ethers.getSigners();
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
        const quote = await this.hre.UniswapV2Deployer.quote(quoteOptions);
        await this.hre.UniswapV2Deployer.swapExactTokensForTokens(swapOptions);
        const test1BalanceAfterSwap = await test1.balanceOf(await signer.getAddress())
        expect(Number(ethers.utils.formatEther(test1BalanceBeforeSwap)) - Number(ethers.utils.formatEther(test1BalanceAfterSwap))).to.eq(Number(ethers.utils.formatEther(quote)))

      })

      it("should swapTokensForExactTokens", async function () {
        const { test1, test2, pair } = await addLiquidity(this.hre);
        const [signer] = await this.hre.ethers.getSigners();
        const test2BalanceBeforeSwap = await test2.balanceOf(await signer.getAddress())
        const swapOptions: SwapTokensForExactTokensOptions = {
          signer: signer,
          amountOut: 10,
          inputToken: test1.address,
          outputToken: test2.address,
        }
        await this.hre.UniswapV2Deployer.swapTokensForExactTokens(swapOptions);
        const test2BalanceAfterSwap = await test2.balanceOf(await signer.getAddress())
        expect(Number(ethers.utils.formatEther(test2BalanceBeforeSwap))).to.eq(Number(ethers.utils.formatEther(test2BalanceAfterSwap)) - 10)
      })

      it("should remove liquidity", async function () {
        const [signer] = await this.hre.ethers.getSigners();
        const { test1, test2, pair } = await addLiquidity(this.hre);
        const pairBalance = await pair.balanceOf(await signer.getAddress())
        await pair.connect(signer).approve((await this.hre.UniswapV2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
        const removeLiquidityOptions: RemoveLiquidityOptions = {
          signer: signer,
          tokenA: test1.address,
          tokenB: test2.address,
          amountLiquidity: pairBalance
        }
        await this.hre.UniswapV2Deployer.removeLiquidity(removeLiquidityOptions)
        expect((await pair.balanceOf(await signer.getAddress())).toString()).to.eq('0')
      })

      it("should add liquidity ETH", async function () {
        const signers = await this.hre.ethers.getSigners();
        const signer = signers[0]

        const balance = await this.hre.ethers.provider.getBalance(await signer.getAddress());
        const test1 = await this.hre.UniswapV2Deployer.createERC20(signer, "Test1", "TEST1")
        await test1.connect(signer).approve((await this.hre.UniswapV2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
        const addLiquidityETHOptions: AddLiquidityETHOptions = {
          signer: signer,
          token: test1.address,
          amountToken: 1000,
          amountETH: 5
        }
        await this.hre.UniswapV2Deployer.addLiquidityETH(addLiquidityETHOptions)
        const balanceAfterAddEth = await this.hre.ethers.provider.getBalance(await signer.getAddress());
        // account for some ETH burned as gas.
        expect(Number(ethers.utils.formatEther(balanceAfterAddEth.toString()))).to.be.lessThanOrEqual(Number(ethers.utils.formatEther(balance.toString())) - 5)
        expect(Number(ethers.utils.formatEther(balanceAfterAddEth.toString()))).to.be.greaterThan(Number(ethers.utils.formatEther(balance.toString())) - 5.05)
      })
    })
  })
});

async function addLiquidity(hre: HardhatRuntimeEnvironment) {
  const [signer] = await hre.ethers.getSigners();

  const test1 = await hre.UniswapV2Deployer.createERC20(signer, "Test1", "TEST1")
  const test2 = await hre.UniswapV2Deployer.createERC20(signer, "Test2", "TEST2")

  await test1.connect(signer).approve((await hre.UniswapV2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)
  await test2.connect(signer).approve((await hre.UniswapV2Deployer.getRouter(signer)).address, ethers.constants.MaxUint256)

  const addLiquidityOptions: AddLiquidityOptions = {
    signer: signer,
    tokenA: test1.address,
    tokenB: test2.address,
    amountTokenA: 1000,
    amountTokenB: hre.ethers.utils.parseEther("1000"),
  }

  await hre.UniswapV2Deployer.addLiquidity(addLiquidityOptions)

  const pair = await hre.UniswapV2Deployer.getPair(signer, test1.address, test2.address);


  return { test1, test2, pair }
}
