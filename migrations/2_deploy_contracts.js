var TutorialToken = artifacts.require("./TutorialToken.sol");
var WillWallet = artifacts.require("./WillWallet.sol");
var Deployer = artifacts.require("./Deployer.sol");
const TIME = 2592000;

module.exports = function(deployer) {
  deployer.deploy(Deployer);
  deployer.deploy(TutorialToken);
  // deployer.deploy(WillWallet, TIME);
};
