
// We load the plugin here.
import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/types";
import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  paths: {
    newPath: "asd",
  },
};

export default config;