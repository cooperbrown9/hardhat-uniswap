import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  abi,
  bytecode,
} from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import { Contract, ContractFactory } from "ethers";

async function deployRouter(
  signer: SignerWithAddress,
  factory: Contract,
  weth9: Contract
) {
  const Router = new ContractFactory(abi, bytecode, signer);
  const router = await Router.deploy(factory.address, weth9.address);
  await router.deployed();
  return { router, Router };
}

export default deployRouter;
