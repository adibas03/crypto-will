/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
const MNEMONIC =
  "tragic lab sheriff bag clump cabin arena head trophy exit traffic thrive napkin hurdle green";

const PROJECT_ID = "";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      network_id: 1002,
      host: "127.0.0.1",
      port: 8545 // Different than the default below
    },
    kovan: {
      network_id: 42,
      provider: function() {
        const HDWalletProvider = require("truffle-hdwallet-provider");
        return new HDWalletProvider(
          MNEMONIC,
          `https://kovan.infura.io/v3/${PROJECT_ID}`
        );
      },
      gasPrice: 2000000000
    },
    rinkeby: {
      network_id: 4,
      provider: function() {
        const HDWalletProvider = require("truffle-hdwallet-provider");
        return new HDWalletProvider(
          MNEMONIC,
          `https://rinkeby.infura.io/v3/${PROJECT_ID}`
        );
      },
      gasPrice: 2000000000
    },
    ropsten: {
      network_id: 3,
      provider: function() {
        const HDWalletProvider = require("truffle-hdwallet-provider");
        return new HDWalletProvider(
          MNEMONIC,
          `https://ropsten.infura.io/v3/${PROJECT_ID}`
        );
      },
      gasPrice: 2000000000
    },
    test: {
      network_id: 1002,
      host: "127.0.0.1",
      port: 8545 // Different than the default below
    }
  },
  compilers: {
    solc: {
      version: "0.5.12" // Any published image name
    }
  },
  mocha: {
    reporter: "eth-gas-reporter"
    // reporterOptions : { ... } // See options below
  }
};
