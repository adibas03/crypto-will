# Crypto-Will

Crypto-Will is a tool to deploy your personal will on the Ethereum blockchain.  
https://adibas03.github.io/crypto-will/

You can:

- add beneficiaries,
- delete beneficiaries,
- set their percentage,
- set the Waiting period before the wealth can be disposed
- also reset the Wait timer before allowing disbursement

## Contracts

#### Mainnet

#### Ropsten

```
  Deployer: 0x8c1bE0Ce03E6cd2Ab8DBAAADe93Ba0d3d57867f6
  DeployerLibrary: 0x67A8547AA408fECe8bD6507437A6Ff0aFEDB2e28
```

#### Rinkeby

```
  Deployer: 0xE64fA3879F97EB0D50BF4157300db0DDb5C27F30
  DeployerLibrary: 0xd3CB573e916aFC5435Ec0f9408f1aEFF6a7f990A
```

#### Kovan

```
  Deployer: 0x0F336C5c2b7EbfC22b47bD5211A43D70ee7A6ab5
  DeployerLibrary: 0x395938BB0033F43a99Fb0F61D3ddDfAcC243C78d
```

## Tests

To run test, you need to have [ganache-cli](https://github.com/trufflesuite/ganache-cli) or [ganache](https://github.com/trufflesuite/ganache) installed globally using

- start ganache `ganache-cli` in terminal
- run tests from the repo directory `npm run truffle:test`
