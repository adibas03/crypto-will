var Deployer = artifacts.require("./Deployer.sol");
var DeployerLibrary = artifacts.require("./DeployerLibrary.sol");

module.exports = function(deployer, network) {
  deployer.deploy(DeployerLibrary);
  deployer.link(DeployerLibrary, Deployer);
  deployer.deploy(Deployer);
};
