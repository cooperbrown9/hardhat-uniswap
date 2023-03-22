// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import { useEnvironment } from "./helpers";
import { UniswapV3Deployer } from "../src/v3/UniswapV3Deployer";
//@ts-ignore
import { ethers } from "hardhat";
import { CollectOptions, DecreaseLiquidityOptions, ExactInputOptions, ExactInputSingleOptions, ExactOutputOptions, ExactOutputSingleOptions, IncreaseLiquidityOptions, MintOptions } from "../types.d.ts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signer } from "ethers";

describe("Unit Tests V3", function () {
    let AMOUNT_TOKEN: number;
    let AMOUNT_WETH9: number;
    describe("UniswapV3Deployer", function () {
        beforeEach(async function () {
            AMOUNT_WETH9 = 1000;
            AMOUNT_TOKEN = 1000;
        });
        useEnvironment("hardhat-project");

        // describe("Deployment", function () {
        //     it("Should deploy WETH9", async function () {
        //         const [signer] = await ethers.getSigners();
        //         const deployer = new UniswapV3Deployer(this.hre);
        //         const { weth9 } = await deployer.deploy(signer);
        //         assert.equal(await weth9.name(), "Wrapped Ether");
        //         const provider = await ethers.getDefaultProvider();

        //         const balance = await weth9.balanceOf(await signer.getAddress());
        //     });
        //     it("Should deploy Factory", async function () {
        //         const [signer] = await ethers.getSigners();
        //         const deployer = new UniswapV3Deployer(this.hre);
        //         const { factory } = await deployer.deploy(signer);
        //         assert.equal(await factory.owner(), signer.address);
        //     });

        //     it("Should deploy Router", async function () {
        //         const [signer] = await ethers.getSigners();
        //         const deployer = new UniswapV3Deployer(this.hre);
        //         const { router, factory, weth9 } = await deployer.deploy(signer);
        //         assert.equal(await router.factory(), factory.address);
        //         assert.equal(await router.WETH9(), weth9.address);
        //     });
        //     it("Should deploy NFT Position Manager", async function () {
        //         const [signer] = await ethers.getSigners();
        //         const deployer = new UniswapV3Deployer(this.hre);
        //         const { positionManager, factory, weth9 } = await deployer.deploy(signer);
        //         expect(await positionManager.WETH9()).to.eq(weth9.address)
        //     })
        //     it("Should deploy Nonfungible Token Position Descriptor", async function () {
        //         const [signer] = await ethers.getSigners();
        //         const deployer = new UniswapV3Deployer(this.hre);
        //         const { tokenDescriptor, factory, weth9 } = await deployer.deploy(signer);
        //         expect(await tokenDescriptor.WETH9()).to.eq(weth9.address)
        //     })
        // })
        // describe("Helper Functions", function () {
        //     it("should create an ERC20", async function () {
        //         const [signer] = await ethers.getSigners();
        //         const v3Deployer = new UniswapV3Deployer(this.hre);
        //         await v3Deployer.deploy(signer);
        //         const test1 = await v3Deployer.createERC20(signer, "Test1", "TEST1")
        //         expect(await test1.name()).to.eq("Test1")
        //     });
        // });

        // describe("Position Manager", function () {
        //     it("Should mint new position", async function () {
        //         const [signer] = await ethers.getSigners();
        //         const v3Deployer = new UniswapV3Deployer(this.hre);
        //         await v3Deployer.deploy(signer);
        //         const test1 = await v3Deployer.createERC20(signer, "Test1", "TEST1")
        //         const test2 = await v3Deployer.createERC20(signer, "Test2", "TEST2")
        //         const mintOptions: MintOptions = {
        //             signer: signer,
        //             token0: test1.address,
        //             token1: test2.address,
        //             fee: 3000,
        //             amount0Desired: 1000,
        //             amount1Desired: 1000,
        //             price: 1
        //         }
        //         await v3Deployer.mintPosition(mintOptions)
        //         await v3Deployer.mintPosition(mintOptions)

        //     })
        // })
        describe("Router", function () {
            // it("Should single swap using exactInputSingle()", async function () {
            //     const [signer] = await ethers.getSigners();
            //     const { test1, test2, v3Deployer } = await mintPosition(this.hre);
            //     const exactInputOptions: ExactInputSingleOptions = {
            //         signer: signer,
            //         tokenIn: test1.address,
            //         tokenOut: test2.address,
            //         fee: 3000,
            //         amountIn: 10
            //     }
            //     //@ts-ignore
            //     await test1.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
            //     //@ts-ignore
            //     await test2.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
            //     await v3Deployer.exactInputSingle(exactInputOptions)
            // })
            // it("Should single swap using exactOutputSingle()", async function () {
            //     const [signer] = await ethers.getSigners();
            //     const { test1, test2, v3Deployer } = await mintPosition(this.hre);
            //     const exactOutputOptions: ExactOutputSingleOptions = {
            //         signer: signer,
            //         tokenIn: test1.address,
            //         tokenOut: test2.address,
            //         fee: 3000,
            //         amountOut: 1
            //     }
            //     //@ts-ignore
            //     await test1.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
            //     await v3Deployer.exactOutputSingle(exactOutputOptions)

            // })

            // it("should multihop swap using exactInput()", async function () {
            //     const [signer] = await ethers.getSigners();
            //     const { test1, test2, test3, test4, v3Deployer } = await mintMultiplePositions(this.hre)
            //     const test1BalanceBeforeSwap = await test1.balanceOf(await signer.getAddress());
            //     const exactInputOptions: ExactInputOptions = {
            //         signer: signer,
            //         path: [test1.address, 3000, test2.address, 3000, test3.address, 3000, test4.address],
            //         amountIn: 10
            //     }
            //     //@ts-ignore
            //     await test1.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
            //     //@ts-ignore
            //     // await test2.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
            //     await v3Deployer.exactInput(exactInputOptions)
            //     const test1BalanceAfterSwap = await test1.balanceOf(await signer.getAddress());
            //     // @ts-ignore
            //     console.log("Balance before", this.hre.ethers.utils.formatEther(test1BalanceBeforeSwap.toString()))
            //     // @ts-ignore
            //     console.log("Balance after", this.hre.ethers.utils.formatEther(test1BalanceAfterSwap.toString()))
            // })
            // it("should multihop swap using exactOutput()", async function () {
            //     const [signer] = await ethers.getSigners();
            //     const { test1, test2, test3, test4, v3Deployer } = await mintMultiplePositions(this.hre)
            //     const test1BalanceBeforeSwap = await test1.balanceOf(await signer.getAddress());
            //     const exactOutputOptions: ExactOutputOptions = {
            //         signer: signer,
            //         path: [test4.address, 3000, test3.address, 3000, test2.address, 3000, test1.address],
            //         amountOut: 10
            //     }
            //     //@ts-ignore
            //     await test1.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
            //     //@ts-ignore
            //     // await test2.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
            //     await v3Deployer.exactOutput(exactOutputOptions)
            //     const test1BalanceAfterSwap = await test1.balanceOf(await signer.getAddress());
            //     // @ts-ignore
            //     console.log("Balance before", this.hre.ethers.utils.formatEther(test1BalanceBeforeSwap.toString()))
            //     // @ts-ignore
            //     console.log("Balance after", this.hre.ethers.utils.formatEther(test1BalanceAfterSwap.toString()))

            // })
            it("collects", async function () {
                const [signer] = await ethers.getSigners();
                const { test1, test2, v3Deployer, tokenId } = await mintPosition(this.hre);

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
                await test1.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                //@ts-ignore
                await test2.connect(signer).approve((await v3Deployer.getRouter(signer)).address, this.hre.ethers.constants.MaxInt256)
                //@ts-ignore
                await v3Deployer.exactInputSingle(exactInputOptions1)
                // await v3Deployer.exactInputSingle(exactInputOptions2)
                // await v3Deployer.exactInputSingle(exactInputOptions1)
                // await v3Deployer.exactInputSingle(exactInputOptions2)
                // await v3Deployer.exactInputSingle(exactInputOptions1)
                // await v3Deployer.exactInputSingle(exactInputOptions2)
                // await v3Deployer.exactInputSingle(exactInputOptions1)
                // await v3Deployer.exactInputSingle(exactInputOptions2)
                // await v3Deployer.exactInputSingle(exactInputOptions1)
                // await v3Deployer.exactInputSingle(exactInputOptions2)
  
                

                await v3Deployer.collectFees(collectOptions);
                
            })
            it("increases Liquidity", async function () {
                const [signer] = await ethers.getSigners();
                const { test1, test2, v3Deployer, tokenId } = await mintPosition(this.hre);
                const increaseLiquidityOptions: IncreaseLiquidityOptions = {
                    signer: signer,
                    tokenId: tokenId,
                    amount0Desired: 10,
                    amount1Desired: 10,
                }
                const test1BalanceBeforeLp = await test1.balanceOf(await signer.getAddress());
                await v3Deployer.increaseLiquidity(increaseLiquidityOptions);
                const test1BalanceAfterLp = await test1.balanceOf(await signer.getAddress());
                console.log("test1BalanceBeforelp", test1BalanceBeforeLp.toString())
                console.log("test1BalanceAfterlp", test1BalanceAfterLp.toString())
                expect(Number(ethers.utils.formatEther(test1BalanceBeforeLp))).to.eq(Number(ethers.utils.formatEther(test1BalanceAfterLp))+10)
            })

            it("decreases Liquidity", async function () {
                const [signer] = await ethers.getSigners();
                const { test1, test2, v3Deployer, tokenId } = await mintPosition(this.hre);
                const decreaseLiquidityOptions: DecreaseLiquidityOptions = {
                    signer: signer,
                    tokenId: tokenId,
                    liquidity: 100
                }
                const test1BalanceBeforeLp = await test1.balanceOf(await signer.getAddress());
                let amount0, amount1;

                [amount0, amount1] = await v3Deployer.decreaseLiquidity(decreaseLiquidityOptions)
                const test1BalanceAfterLp = await test1.balanceOf(await signer.getAddress());
                expect(Number(ethers.utils.formatEther(amount0))).to.be.greaterThan(0)
            })
        })
    })

})

async function mintPosition(hre) {
    const [signer] = await ethers.getSigners();
    const v3Deployer = new UniswapV3Deployer(hre);
    await v3Deployer.deploy(signer);
    const test1 = await v3Deployer.createERC20(signer, "Test1", "TEST1")
    const test2 = await v3Deployer.createERC20(signer, "Test2", "TEST2")
    const mintOptions: MintOptions = {
        signer: signer,
        token0: test1.address,
        token1: test2.address,
        fee: 3000,
        amount0Desired: 1000,
        amount1Desired: 1000,
        price: 2
    }
    const tokenId = await v3Deployer.mintPosition(mintOptions)

    return { test1, test2, v3Deployer, tokenId }
}

async function mintMultiplePositions(hre) {
    const [signer] = await ethers.getSigners();
    const v3Deployer = new UniswapV3Deployer(hre);
    await v3Deployer.deploy(signer);
    const test1 = await v3Deployer.createERC20(signer, "Test1", "TEST1")
    const test2 = await v3Deployer.createERC20(signer, "Test2", "TEST2")
    const test3 = await v3Deployer.createERC20(signer, "Test3", "TEST3")
    const test4 = await v3Deployer.createERC20(signer, "Test4", "TEST4")
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
    await v3Deployer.mintPosition(mintOptions1)
    await v3Deployer.mintPosition(mintOptions2)
    await v3Deployer.mintPosition(mintOptions3)

    return { test1, test2, test3, test4, v3Deployer }
}