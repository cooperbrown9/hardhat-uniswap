import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { abi, bytecode } from '../../../deploy/contracts/TestToken.json';
//@ts-ignore

async function deployERC20(
  signer: SignerWithAddress,
  name: string,
  symbol: string
) {
  const ERC20 = new ContractFactory(abi, bytecode, signer);
  const erc20 = await ERC20.deploy(name, symbol);
  await erc20.deployed();

  await erc20.connect(signer).mint((await signer.getAddress()), parseEther("1000000"))
  return { erc20 };
}
export { deployERC20 }
