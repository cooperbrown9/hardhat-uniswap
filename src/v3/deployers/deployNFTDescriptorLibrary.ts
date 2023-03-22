import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { abi, bytecode } from "@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json";
import { Contract, ContractFactory } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";


async function deployNFTDescriptorLibrary(
  signer: SignerWithAddress,
) {
  const NFTDescriptorLibrary = new ContractFactory(abi, bytecode, signer);
  const nftDescriptorLibrary = await NFTDescriptorLibrary.deploy();
  await nftDescriptorLibrary.deployed();
  return { nftDescriptorLibrary, NFTDescriptorLibrary };
}

export default deployNFTDescriptorLibrary;