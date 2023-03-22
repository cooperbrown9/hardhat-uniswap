# hardhat-uniswap
## _The easiest way to develop smart contracts that interact with Uniswap based DEXs_

Are you tired of spending hours debugging Uniswap contracts whenever you need to use them in your tests? Frustrated with that annoying V3 addLiquidity bytecode issue? Wtf is `sqrtPriceX96` ? Yeah, we get it. 
That's why we created this package -- to enable the most efficient path to include the whole Uniswap suite in your project. 
## Features
- Complete V2 and V3 deployments
- Efficient JS Wrappers around the most used functionality
- Automatic conversions from `Number` -> `BigNumber`
- TypeScript
- Best of all, all the annoying deployment issues are already figured out


## Install & Setup
```sh 
$ npm install hardhat-uniswap
```
or of course
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
