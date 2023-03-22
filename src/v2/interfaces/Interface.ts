import IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";

export interface InterfaceType {
  [name: string]: { abi: any; bytecode: any };
}

const Interface: InterfaceType = {
  IUniswapV2Pair,
  IUniswapV2ERC20,
  IUniswapV2Factory,
  IUniswapV2Router02,
};

export default Interface;
