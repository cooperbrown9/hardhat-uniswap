import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { abi, bytecode } from "@uniswap/v2-core/build/UniswapV2Factory.json";
import { ContractFactory } from "ethers";

async function deployFactory(
  signer: SignerWithAddress,
  feeToSetter: SignerWithAddress
) {
  const Factory = new ContractFactory(abi, bytecode, signer);
  const factory = await Factory.deploy(feeToSetter.address);
  await factory.deployed();
  return { factory, Factory };
}

export default deployFactory;
