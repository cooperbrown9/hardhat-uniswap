# hardhat-uniswap
## _The easiest way to integrate Uniswap into your smart contracts_

Are you tired of spending hours debugging Uniswap contracts whenever you need to use them in your tests? Frustrated with that annoying V3 addLiquidity bytecode issue? Wtf is `sqrtPriceX96` ? Yeah, we get it. 
That's why we created this package -- to enable the most efficient way to integrate the whole Uniswap suite into your project. 

## Features
- Complete V2 and V3 deployments
- Efficient JS Wrappers around the most used functionality
- Automatic conversions from `Number` -> `BigNumber`
- TypeScript
- Best of all, all the annoying deployment issues are already figured out
- Default (but overridable) behind-the-scenes handling of difficult Uniswap concepts (ticks, LP fees, LP conversions, etc)


## Installation
```sh 
$ npm install hardhat-uniswap
```
or of course
```ssh 
$ yarn add hardhat-uniswap
```
then import it to your `hardhat.config.ts`

## Usage
`hardhat-uniswap` extends the HardhatRunTimeEnvironment. Therefore, you can access the package through `hre.UniswapV2Deployer` or `hre.UniswapV3Deployer`, whichever version of Uniswap you are using.
You can use it in your deploy scripts and in your tests. UniswapV2Deployer uses the `singleton` pattern to create many of its contracts, which allows the package to manage the Uniswap state for you.
You can do functions like 
```js
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-uniswap";
// ... other imports

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};
export default config;
```

# Examples
## deploy contract and attach Uniswap Router to it
```js
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();
    const [signer] = await ethers.getSigners()

    const { router } = await hre.UniswapV2Deployer.deploy(signer);
    
    const res: DeployResult = await deploy("MyContract", {
        from: deployer,
        log: true,
        args: [router.address]
    });

    const store = await ethers.getContractAt('MyContract', res.address);
};
export default func;
```

## create tokens and add liquidity
```js
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const [signer] = await ethers.getSigners()

    await hre.UniswapV2Deployer.deploy(signer);
    const tokenA = await hre.UniswapV2Deployer.createERC20(signer, "Token A", "TKA")
    const tokenB = await hre.UniswapV2Deployer.createERC20(signer, "Token B", "TKB")    

    await hre.UniswapV2Deployer.addLiquidity({
        signer,
        // UniswapV2Deployer maintains states and has access to the tokens you just created
        tokenA.address,
        tokenB.address,
        // automatically converts to BigNumber
        amountTokenA: 1000,
        amountTokenB: 1000
    });
};
```

