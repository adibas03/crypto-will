var Deployer = artifacts.require("./Deployer.sol");

module.exports = function(deployer, network) {
  if (network === 'test') {
    return;
  }
  deployer.deploy(Deployer);
};
