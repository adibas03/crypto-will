const WillWallet = artifacts.require("./WillWallet");
const TutorialToken = artifacts.require("./TutorialToken");
const BigNumber = require("bignumber.js");

contract("WillWallet", function(accounts) {
  const ETHER = 10 ** 18;
  const waitTime = 86400;
  const owner = accounts[0];

  let willWallet;

  const getBalance = function(address) {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(new BigNumber(res));
      });
    });
  };

  before(async function() {
    willWallet = await WillWallet.new(waitTime);
    console.log(
      "WillWallet version:",
      (await willWallet.version.call()).toString()
    );
  });
  it("should successfully deploy WillWallet", () => {
    assert.exists(
      willWallet.address,
      " Failed to deploy WillWallet with address"
    );
  });
});
