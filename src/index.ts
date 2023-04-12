import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig } from "hardhat/types";
import path from "path";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./v2/type-extensions";
import "./v3/type-extensions"
import { UniswapV2Deployer } from "./v2/UniswapV2Deployer";
import { UniswapV3Deployer } from "./v3/UniswapV3Deployer";


extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extensions. For example, you may
    // need to apply a default value, like in this example.
    const userPath = userConfig.paths?.newPath;

    let newPath: string;
    if (userPath === undefined) {
      newPath = path.join(config.paths.root, "newPath");
    } else {
      if (path.isAbsolute(userPath)) {
        newPath = userPath;
      } else {
        // We resolve relative paths starting from the project's root.
        // Please keep this convention to avoid confusion.
        newPath = path.normalize(path.join(config.paths.root, userPath));
      }
    }

    config.paths.newPath = newPath;
  }
);

extendEnvironment(async (hre) => {
  //@ts-ignore
  const [defaultSigner] = await hre.ethers.getSigners()
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  hre.uniswapV2 = lazyObject(() => new UniswapV2Deployer(hre, defaultSigner));
  hre.uniswapV3 = lazyObject(() => new UniswapV3Deployer(hre, defaultSigner));
});
