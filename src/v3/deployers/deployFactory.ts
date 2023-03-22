import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { abi, bytecode } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import { ContractFactory } from "ethers";

async function deployFactory(
  signer: SignerWithAddress,
) {
  const Factory = new ContractFactory(abi, bytecode, signer);
  const factory = await Factory.deploy();
  await factory.deployed();
  return { factory, Factory };
}

export default deployFactory;
