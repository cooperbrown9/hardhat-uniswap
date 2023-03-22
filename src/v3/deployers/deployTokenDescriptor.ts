import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { abi, bytecode } from "@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json";
import { Contract, ContractFactory } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";
import { linkLibraries } from "../../util/linkLibraries";

async function deployTokenDescriptor(
  signer: SignerWithAddress,
  nftDescriptorLibrary: Contract,
  weth9: Contract, 
) {
  const linkedBytecode = linkLibraries(
    {
      bytecode: bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptorLibrary.address,
    }
  )
  const TokenDescriptor = new ContractFactory(abi, linkedBytecode, signer);
  const tokenDescriptor = await TokenDescriptor.deploy(weth9.address);
  await tokenDescriptor.deployed();
  return { tokenDescriptor, TokenDescriptor };
}

export default deployTokenDescriptor;