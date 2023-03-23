import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory, constants } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { abi, bytecode } from '../../util/TestToken.json';

async function deployERC20(
  signer: SignerWithAddress,
  name: string,
  symbol: string,
  router: Contract,
  positionManager?: Contract
) {
  const ERC20 = new ContractFactory(abi, bytecode, signer);
  const erc20 = await ERC20.deploy(name, symbol);
  await erc20.deployed();

  await erc20.connect(signer).mint((await signer.getAddress()), parseEther("1000000"))
  await erc20.connect(signer).approve(router.address, constants.MaxInt256)
  if(positionManager) {
    await erc20.connect(signer).approve(positionManager.address, constants.MaxInt256)
  }
  return { erc20 };
}
export { deployERC20 }
