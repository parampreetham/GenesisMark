import { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";

// 1. Import the plugin we installed
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

const ALCHEMY_AMOY_URL = process.env.ALCHEMY_AMOY_URL || "";
const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC || "";

if (!ALCHEMY_AMOY_URL) {
  console.warn("ALCHEMY_AMOY_URL is not set. Deployment to Amoy will fail.");
}
if (!WALLET_MNEMONIC) {
  console.warn("WALLET_MNEMONIC is not set. Deployment will fail.");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    amoy: {
      type: "http",
      url: ALCHEMY_AMOY_URL,
      accounts: {
        mnemonic: WALLET_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 1,
      },
    },
  },
  // 2. Add the imported plugin to the plugins array.
  // This is the step that was missing.
  plugins: [hardhatToolboxMochaEthers],
};

export default config;