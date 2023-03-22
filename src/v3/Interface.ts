import IERC20Minimal from "@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json";
import IUniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json"
import IUniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import ISwapRouter from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";

export interface InterfaceType {
  [name: string]: { abi: any; bytecode: any };
}

const Interface: InterfaceType = {
  IUniswapV3Pool,
  IERC20Minimal,
  IUniswapV3Factory,
  ISwapRouter,
};

export default Interface;
