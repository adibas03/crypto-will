// var TutorialToken = artifacts.require("./TutorialToken.sol");
var WillWallet = artifacts.require("./WillWallet.sol");


module.exports = function(deployer) {
  deployer.deploy(WillWallet);
};
