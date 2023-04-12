import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "./src/index"

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

export default config;