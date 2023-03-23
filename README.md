# hardhat-uniswap
## _The easiest way to integrate Uniswap into your smart contracts_

Are you tired of spending hours debugging Uniswap contracts whenever you need to use them in your tests? Frustrated with that annoying V3 addLiquidity bytecode issue? What even is `sqrtPriceX96` ? Yeah, we get it. 
That's why we created this package -- to enable the most efficient way to integrate the whole Uniswap suite into your project. 

## Features
- Complete V2 and V3 deployments
- Efficient JS Wrappers around core functionality
- pass in either number or BigNumbers
- Automatic approvals - Test ERC20s created will approve all necessary contracts upon deployment
- Eliminate hours of setup for test environments, deploy all necessary contracts for either v2 or v3 with one function!
- TypeScript
- Default (but overridable) behind-the-scenes handling of difficult Uniswap concepts (ticks, LP fees, LP conversions, etc)


## Installation
npm
```sh 
$ npm install hardhat-uniswap
```
yarn
```ssh 
$ yarn add hardhat-uniswap
```
then import it to your `hardhat.config.ts`
```js
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-uniswap";
// ... other imports

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};
export default config;
```

## Usage
`hardhat-uniswap` extends the HardhatRunTimeEnvironment. Therefore, you can access the package through `hre.UniswapV2Deployer` or `hre.UniswapV3Deployer`, whichever version of Uniswap you are using.
You can use it in your deploy scripts and in your tests. UniswapV2Deployer uses the `singleton` pattern to create many of its contracts, which allows the package to manage the Uniswap state for you.


# Examples
## deploy Uniswap Contracts in main deploy script and attach router
```js
import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  // Deploy your contract
  const MyContract = await ethers.getContractFactory("MyContract");
  const myContract = await MyContract.deploy();
  await myContract.deployed();

  // Deploy uniswap contracts
  const {router} = await hre.UniswapV2Deployer.deploy(signer)
  
  // Set router on your contract!
  await myContract.receiveLiquidity(router)
}
```

## V2 create tokens and add liquidity in a test environment
```js
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from 'hardhat';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";


describe("Hardhat Uniswap Demo", function () {
    let testA: Contract;
    let testB: Contract;
    let signer: SignerWithAddress;
    let pair: Contract;

    beforeEach("Setup Liquidity Pool", async function () {
        [signer] = await ethers.getSigners();
        await hre.UniswapV2Deployer.deploy(signer);

        testA = await hre.UniswapV2Deployer.createERC20(signer, "TestA", "TESTA");
        testB = await hre.UniswapV2Deployer.createERC20(signer, "TestB", "TESTB");

        const addLiquidityOptions = {
            signer: signer,
            tokenA: testA.address,
            tokenB: testB.address,
            amountTokenA: 100,
            amountTokenB: 100
        }

        await hre.UniswapV2Deployer.addLiquidity(addLiquidityOptions)
    })

    it("should receive LP", async function () {
        const MyContract = await ethers.getContractFactory("MyContract");
        const myContract = await MyContract.deploy();
        await myContract.deployed();

        pair = await hre.UniswapV2Deployer.getPair(signer, testA.address, testB.address)
        await pair.connect(signer).approve(myContract.address, ethers.constants.MaxInt256);
        const pairBalanceBefore = await pair.balanceOf(signer.address);
        await myContract.receiveLiquidity(pair.address, ethers.utils.parseEther("1"));
        // confirm the lp was transferred
        expect(pairBalanceBefore).to.eq((await pair.balanceOf(signer.address)).add(ethers.utils.parseEther("1")))
        
    })
})
```
## V3 create tokens and add liquidity in a test environment
```ts
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from 'hardhat';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";


describe("Hardhat Uniswap Demo", function () {
    let testA: Contract;
    let testB: Contract;
    let signer: SignerWithAddress;
    let pair: Contract;

    beforeEach("Setup Liquidity Pool", async function () {
        [signer] = await ethers.getSigners();
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
        const tokenId = await hre.UniswapV3Deployer.mintPosition(mintOptionsaddLiquidityOptions)
    })
})
```

## V2 Functions
```ts
function async deploy(signer: SignerWithAddress): Promise<{
    weth9: Contract;
    WETH9: ContractFactory;
    factory: Contract;
    Factory: ContractFactory;
    router: Contract;
    Router: ContractFactory;
}>;

function async getWeth(signer: SignerWithAddress): Promise<Contract>;

function async getFactory(signer: SignerWithAddress): Promise<Contract>;

function async getFactory(signer: SignerWithAddress): Promise<Contract>;

function async getRouter(signer: SignerWithAddress): Promise<Contract>;

function async getPair(signer: SignerWithAddress, tokenA: string, tokenB: string);

function async createERC20(signer: SignerWithAddress, name: string, symbol: string): Promise<Contract>;

function getERC20(address: string): Contract | undefined;

function async addLiquidity(options: AddLiquidityOptions);

function async addLiquidityETH(options: AddLiquidityETHOptions);

function async removeLiquidity(options: RemoveLiquidityOptions); 

function async removeLiquidityETH(options: RemoveLiquidityETHOptions);

function async swapExactTokensForTokens(options: SwapExactTokensForTokensOptions);

function async swapTokensForExactTokens(options: SwapTokensForExactTokensOptions);

function async quote(options: QuoteOptions): Promise<BigNumber>;

function async getLiquidityValueInTermsOfTokenA(options: GetLiquidityValueInTermsOfTokenAOptions): Promise<BigNumber>;
```

## V2 Interfaces
```ts
interface AddLiquidityOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountTokenA: number | BigNumber;
    amountTokenB: number | BigNumber;
}

interface RemoveLiquidityOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountLiquidity: number | BigNumber;
}
interface RemoveLiquidityETHOptions {
    signer: SignerWithAddress;
    token: string;
    amountLiquidity: number | BigNumber;
}
interface SwapExactTokensForTokensOptions {
    signer: SignerWithAddress;
    amountIn: number | BigNumber;
    inputToken: string;
    outputToken: string;
}

interface SwapTokensForExactTokensOptions {
    signer: SignerWithAddress;
    amountOut: number | BigNumber;
    inputToken: string;
    outputToken: string;
}

interface QuoteOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountA: number | BigNumber;
}

interface GetLiquidityValueInTermsOfTokenAOptions {
    signer: SignerWithAddress;
    tokenA: string;
    tokenB: string;
    amountLiquidity: number | BigNumber;
}
interface AddLiquidityETHOptions {
    signer: SignerWithAddress;
    token: string;
    amountToken: number | BigNumber;
    amountETH: number | BigNumber;
}
```

## V3 Functions
```ts
function async deploy(signer: SignerWithAddress): Promise<{
    weth9: Contract;
    WETH9: ContractFactory;
    factory: Contract;
    Factory: ContractFactory;
    router: Contract;
    Router: ContractFactory;
    tokenDescriptor: Contract;
    TokenDescriptor: ContractFactory;
    nftDescriptorLibrary: Contract;
    NFTDescriptorLibrary: ContractFactory;
    positionManager: Contract;
    PositionManager: ContractFactory;
}>;

function async getWeth(signer: SignerWithAddress): Promise<Contract>;

function async getFactory(signer: SignerWithAddress): Promise<Contract>;

function async getFactory(signer: SignerWithAddress): Promise<Contract>;

function async getRouter(signer: SignerWithAddress): Promise<Contract>;

function async getPair(signer: SignerWithAddress, tokenA: string, tokenB: string);

function async createERC20(signer: SignerWithAddress, name: string, symbol: string): Promise<Contract>;

function getERC20(address: string): Contract | undefined;

function async exactInputSingle(options: ExactInputSingleOptions)

function async exactInput(options: ExactInputOptions);

function async exactOutputSingle(options: ExactOutputSingleOptions);

function async exactOutput(options: ExactOutputOptions);

function async mintPosition(options: MintOptions): Promise<Number>;

function async collectFees(options: CollectOptions): Promise<Number>;

function async increaseLiquidity(options: IncreaseLiquidityOptions);

function async decreaseLiquidity(options: DecreaseLiquidityOptions): Promise<Array<number>>;
```

## V3 Interfaces
```ts
interface ExactInputSingleOptions {
    signer: SignerWithAddress;
    tokenIn: string;
    tokenOut: string;
    fee: number;
    amountIn: number | BigNumber;
}

interface ExactInputOptions {
    signer: SignerWithAddress;
    path: Array<string | number>;
    amountIn: number | BigNumber;
}

interface ExactOutputSingleOptions {
    signer: SignerWithAddress,
    tokenIn: string;
    tokenOut: string;
    fee: number;
    amountOut: number | BigNumber;
}

interface ExactOutputOptions {
    signer: SignerWithAddress;
    path: Array<string | number>;
    amountOut: number | BigNumber;
}


interface MintOptions {
    signer: SignerWithAddress;
    token0: string;
    token1: string;
    fee: number;
    amount0Desired: number | BigNumber;
    amount1Desired: number | BigNumber;
    price: number;
}

interface CollectOptions {
    signer: SignerWithAddress;
    tokenId: number;
}

interface IncreaseLiquidityOptions {
    signer: SignerWithAddress;
    tokenId: number;
    amount0Desired: number | BigNumber;
    amount1Desired: number | BigNumber;
}

interface DecreaseLiquidityOptions {
    signer: SignerWithAddress;
    tokenId: number;
    amountLiquidity: number | BigNumber;
}
```