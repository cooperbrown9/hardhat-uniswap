// @no-check
// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import { useEnvironment } from "./helpers";
import { UniswapV3Deployer } from "../src/v3/UniswapV3Deployer";
//@ts-ignore
import { ethers } from "hardhat";
import { CollectOptions, DecreaseLiquidityOptions, ExactInputOptions, ExactInputSingleOptions, ExactOutputOptions, ExactOutputSingleOptions, IncreaseLiquidityOptions, MintOptions } from "../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

describe("Unit Tests V3", function () {
    let AMOUNT_TOKEN: number;
    let AMOUNT_WETH9: number;
    describe("UniswapV3Deployer", function () {
        beforeEach(async function () {
            AMOUNT_WETH9 = 1000;
            AMOUNT_TOKEN = 1000;
        });
        useEnvironment("hardhat-project");

        describe("Deployment", function () {
            it("should load UniswapV3Deployer on HRE", function () {
                expect(true).to.eq(true);
            })
            it("Should deploy WETH9", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                // const deployer = new UniswapV3Deployer(this.hre);
                const { weth9 } = await this.hre.UniswapV3Deployer.deploy(signer);
                assert.equal(await weth9.name(), "Wrapped Ether");
                const provider = await ethers.getDefaultProvider();

                const balance = await weth9.balanceOf(await signer.getAddress());
            });
            it("Should deploy Factory", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { factory } = await this.hre.UniswapV3Deployer.deploy(signer);
                assert.equal(await factory.owner(), signer.address);
            });

            it("Should deploy Router", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { router, factory, weth9 } = await this.hre.UniswapV3Deployer.deploy(signer);
                assert.equal(await router.factory(), factory.address);
                assert.equal(await router.WETH9(), weth9.address);
            });
            it("Should deploy NFT Position Manager", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { positionManager, factory, weth9 } = await this.hre.UniswapV3Deployer.deploy(signer);
                expect(await positionManager.WETH9()).to.eq(weth9.address)
            })
            it("Should deploy Nonfungible Token Position Descriptor", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { tokenDescriptor, factory, weth9 } = await this.hre.UniswapV3Deployer.deploy(signer);
                expect(await tokenDescriptor.WETH9()).to.eq(weth9.address)
            })
        })
        describe("Helper Functions", function () {
            it("should create an ERC20", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                await this.hre.UniswapV3Deployer.deploy(signer);
                const test1 = await this.hre.UniswapV3Deployer.createERC20(signer, "Test1", "TEST1")
                expect(await test1.name()).to.eq("Test1")
            });
        });

        describe("Position Manager", function () {
            it("Should mint new position", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                await this.hre.UniswapV3Deployer.deploy(signer);
                const test1 = await this.hre.UniswapV3Deployer.createERC20(signer, "Test1", "TEST1")
                const test2 = await this.hre.UniswapV3Deployer.createERC20(signer, "Test2", "TEST2")
                const mintOptions: MintOptions = {
                    signer: signer,
                    token0: test1.address,
                    token1: test2.address,
                    fee: 3000,
                    amount0Desired: ethers.utils.parseEther("1000"),
                    amount1Desired: 1000,
                    price: 1
                }
                await this.hre.UniswapV3Deployer.mintPosition(mintOptions)
                await this.hre.UniswapV3Deployer.mintPosition(mintOptions)

            })
            it("increases Liquidity", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { test1, test2, tokenId } = await mintPosition(this.hre);
                const increaseLiquidityOptions: IncreaseLiquidityOptions = {
                    signer: signer,
                    tokenId: tokenId,
                    amount0Desired: ethers.utils.parseEther("10"),
                    amount1Desired: 10,
                }
                const test1BalanceBeforeLp = await test1.balanceOf(await signer.getAddress());
                await this.hre.UniswapV3Deployer.increaseLiquidity(increaseLiquidityOptions);
                const test1BalanceAfterLp = await test1.balanceOf(await signer.getAddress());
                expect(Number(ethers.utils.formatEther(test1BalanceBeforeLp))).to.eq(Number(ethers.utils.formatEther(test1BalanceAfterLp)) + 10)
            })

            it("decreases Liquidity", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { test1, test2, tokenId } = await mintPosition(this.hre);
                const decreaseLiquidityOptions: DecreaseLiquidityOptions = {
                    signer: signer,
                    tokenId: tokenId,
                    amountLiquidity: ethers.utils.parseEther("100")
                }
                const test1BalanceBeforeLp = await test1.balanceOf(await signer.getAddress());
                let amount0, amount1;

                [amount0, amount1] = await this.hre.UniswapV3Deployer.decreaseLiquidity(decreaseLiquidityOptions)
                const test1BalanceAfterLp = await test1.balanceOf(await signer.getAddress());
                expect(Number(ethers.utils.formatEther(amount0))).to.be.greaterThan(0)
            })
        })
        describe("Router", function () {
            it("Should single swap using exactInputSingle()", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { test1, test2 } = await mintPosition(this.hre);
                const exactInputOptions: ExactInputSingleOptions = {
                    signer: signer,
                    tokenIn: test1.address,
                    tokenOut: test2.address,
                    fee: 3000,
                    amountIn: ethers.utils.parseEther("10")
                }
                //@ts-ignore
                await test1.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                //@ts-ignore
                await test2.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions)
            })
            it("Should single swap using exactOutputSingle()", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { test1, test2 } = await mintPosition(this.hre);
                const exactOutputOptions: ExactOutputSingleOptions = {
                    signer: signer,
                    tokenIn: test1.address,
                    tokenOut: test2.address,
                    fee: 3000,
                    amountOut: ethers.utils.parseEther("1")
                }
                //@ts-ignore
                await test1.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                await this.hre.UniswapV3Deployer.exactOutputSingle(exactOutputOptions)

            })

            it("should multihop swap using exactInput()", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { test1, test2, test3, test4 } = await mintMultiplePositions(this.hre)
                const test1BalanceBeforeSwap = await test1.balanceOf(await signer.getAddress());
                const exactInputOptions: ExactInputOptions = {
                    signer: signer,
                    path: [test1.address, 3000, test2.address, 3000, test3.address, 3000, test4.address],
                    amountIn: ethers.utils.parseEther("10")
                }
                //@ts-ignore
                await test1.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                //@ts-ignore
                // await test2.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                await this.hre.UniswapV3Deployer.exactInput(exactInputOptions)
                const test1BalanceAfterSwap = await test1.balanceOf(await signer.getAddress());
            })
            it("should multihop swap using exactOutput()", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { test1, test2, test3, test4 } = await mintMultiplePositions(this.hre)
                const test1BalanceBeforeSwap = await test1.balanceOf(await signer.getAddress());
                const exactOutputOptions: ExactOutputOptions = {
                    signer: signer,
                    path: [test4.address, 3000, test3.address, 3000, test2.address, 3000, test1.address],
                    amountOut: ethers.utils.parseEther("10")
                }
                //@ts-ignore
                await test1.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                //@ts-ignore
                // await test2.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                await this.hre.UniswapV3Deployer.exactOutput(exactOutputOptions)
                const test1BalanceAfterSwap = await test1.balanceOf(await signer.getAddress());
            })
            it("collects", async function () {
                const [signer] = await this.hre.ethers.getSigners();
                const { test1, test2, tokenId } = await mintPosition(this.hre);

                const collectOptions: CollectOptions = {
                    signer: signer,
                    tokenId: tokenId
                }
                const exactInputOptions1: ExactInputSingleOptions = {
                    signer: signer,
                    tokenIn: test1.address,
                    tokenOut: test2.address,
                    fee: 3000,
                    amountIn: 10
                }
                const exactInputOptions2: ExactInputSingleOptions = {
                    signer: signer,
                    tokenIn: test2.address,
                    tokenOut: test1.address,
                    fee: 3000,
                    amountIn: 10
                }
                //@ts-ignore
                await test1.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                //@ts-ignore
                await test2.connect(signer).approve((await this.hre.UniswapV3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                //@ts-ignore
                await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions1)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions2)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions1)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions2)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions1)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions2)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions1)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions2)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions1)
                // await this.hre.UniswapV3Deployer.exactInputSingle(exactInputOptions2)



                await this.hre.UniswapV3Deployer.collectFees(collectOptions);

            })

        })
    })

})

async function mintPosition(hre: HardhatRuntimeEnvironment) {
    const [signer] = await hre.ethers.getSigners();
    await hre.UniswapV3Deployer.deploy(signer);
    const test1 = await hre.UniswapV3Deployer.createERC20(signer, "Test1", "TEST1")
    const test2 = await hre.UniswapV3Deployer.createERC20(signer, "Test2", "TEST2")
    const mintOptions: MintOptions = {
        signer: signer,
        token0: test1.address,
        token1: test2.address,
        fee: 3000,
        amount0Desired: 1000,
        amount1Desired: 1000,
        price: 1
    }
    const tokenId = await hre.UniswapV3Deployer.mintPosition(mintOptions)

    return { test1, test2, v3Deployer: hre.UniswapV3Deployer, tokenId }
}

async function mintMultiplePositions(hre: HardhatRuntimeEnvironment) {
    const [signer] = await hre.ethers.getSigners();
    await hre.UniswapV3Deployer.deploy(signer);
    const test1 = await hre.UniswapV3Deployer.createERC20(signer, "Test1", "TEST1")
    const test2 = await hre.UniswapV3Deployer.createERC20(signer, "Test2", "TEST2")
    const test3 = await hre.UniswapV3Deployer.createERC20(signer, "Test3", "TEST3")
    const test4 = await hre.UniswapV3Deployer.createERC20(signer, "Test4", "TEST4")
    const mintOptions1: MintOptions = {
        signer: signer,
        token0: test1.address,
        token1: test2.address,
        fee: 3000,
        amount0Desired: 1000,
        amount1Desired: 1000,
        price: 1
    }
    const mintOptions2: MintOptions = {
        signer: signer,
        token0: test2.address,
        token1: test3.address,
        fee: 3000,
        amount0Desired: 1000,
        amount1Desired: 1000,
        price: 1

    }
    const mintOptions3: MintOptions = {
        signer: signer,
        token0: test3.address,
        token1: test4.address,
        fee: 3000,
        amount0Desired: 1000,
        amount1Desired: 1000,
        price: 1

    }
    await hre.UniswapV3Deployer.mintPosition(mintOptions1)
    await hre.UniswapV3Deployer.mintPosition(mintOptions2)
    await hre.UniswapV3Deployer.mintPosition(mintOptions3)

    return { test1, test2, test3, test4, v3Deployer: hre.UniswapV3Deployer }
}