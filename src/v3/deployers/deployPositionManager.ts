import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { abi, bytecode } from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { Contract, ContractFactory } from "ethers";

async function deployPositionManager(
  signer: SignerWithAddress,
  factory: Contract,
  weth9: Contract, 
  tokenDescriptor: Contract
) {
  const PositionManager = new ContractFactory(abi, bytecode, signer);
  const positionManager = await PositionManager.deploy(factory.address, weth9.address, tokenDescriptor.address);
  await positionManager.deployed();
  return { positionManager, PositionManager };
}

export default deployPositionManager;