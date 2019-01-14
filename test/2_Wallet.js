const Wallet = artifacts.require('./Wallet');
const TutorialToken = artifacts.require('./TutorialToken');

contract ('Wallet', function (accounts) {
  const ETHER = 10**18;
  const owner = accounts[0];

  let wallet;

  const getBalance = function (address) {
    return new Promise ((resolve,reject) => {
      web3.eth.getBalance(address, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  before(async function () {
    wallet = await Wallet.new();
    assert.exists(wallet.address, ' Failed to deploy Wallet with address');
  });

  describe('transfer()', function () {
    const transferValue = 1.25 * ETHER;

    before(async function () {
      const balance = await getBalance(wallet.address);
      await wallet.sendTransaction({
        from: accounts[5],
        value: transferValue
      })
      const newBalance = await getBalance(wallet.address);
      assert.deepEqual(newBalance, balance.plus(transferValue), 'Wrong value transferred to contract');
    });

    it('should fail to transfer from non-priviledged address', async function () {
        try {
          await wallet.transfer(accounts[1], String(transferValue), {
            from: accounts[3]
          });
          assert.fail(true, 'Expected funtion to fail');
        } catch (e) {
          assert.exists(e, 'Expected transaction to fail with error');
          assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
        }
    });

    it('should fail to transfer negative value', async function () {
        try {
          await wallet.transfer(accounts[1], -1, {
            from: owner
          });
          assert.fail(true, 'Expected funtion to fail');
        } catch (e) {
          assert.exists(e, 'Expected transaction to fail with error');
          assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
        }
    });

    it('should successfully transfer funds', async function () {
      const acctBalance = await getBalance(accounts[1]);

      await wallet.transfer(accounts[1], String(transferValue), {
        from: owner
      });

      const newAcctBalance = await getBalance(accounts[1]);
      assert.deepEqual(newAcctBalance, acctBalance.plus(transferValue), 'Incorrect value transferred');
    });
  });

  describe('callFunction()', function () {
    let tutorialToken;
    const tokenNumber = 15 * 10 ** 8;

    before(async function () {
      tutorialToken = await TutorialToken.new({
        from: owner
      });
      await tutorialToken.mint(wallet.address, tokenNumber, {
        from: owner
      });
      const balance = await tutorialToken.balanceOf.call(wallet.address);
      assert.equal(balance.toNumber(), tokenNumber, 'Incorrect quantity of tokens minted');
    });

    it('should fail to callFunction from non-priviledged account', function () {
    });

  });
});
