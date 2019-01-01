const Wallet = artifacts.require('./Wallet');

contract ('Wallet', function (accounts) {

  before(async function () {
    wallet = await Wallet.new(waitTime);
    assert.exists(wallet.address, ' Failed to deploy Wallet with address');
  });

});
