const Wallet = artifacts.require("./Wallet");
const TutorialToken = artifacts.require("./TutorialToken");
const BigNumber = require("bignumber.js");

contract("Wallet", function(accounts) {
  const ETHER = 10 ** 18;
  const owner = accounts[0];

  let wallet;

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
    wallet = await Wallet.new();
    console.log("Wallet version:", (await wallet.version.call()).toString());
    assert.exists(wallet.address, " Failed to deploy Wallet with address");
  });

  describe("transferEth()", function() {
    const transferValue = 1.25 * ETHER;

    before(async function() {
      const balance = await getBalance(wallet.address);
      await wallet.sendTransaction({
        from: accounts[5],
        value: transferValue
      });
      const newBalance = await getBalance(wallet.address);
      assert.deepEqual(
        newBalance,
        balance.plus(transferValue),
        "Wrong value transferred to contract"
      );
    });

    it("should fail to transferEth from non-priviledged address", async function() {
      try {
        await wallet.transferEth(accounts[1], String(transferValue), {
          from: accounts[3]
        });
        assert.fail(true, "Expected funtion to fail");
      } catch (e) {
        assert.exists(e, "Expected transaction to fail with error");
        assert.isFalse(
          (e.message || e) === "assert.fail()",
          "Expected non-assert failure"
        );
      }
    });

    it("should fail to transferEth negative value", async function() {
      try {
        await wallet.transferEth(accounts[1], "-1", {
          from: owner
        });
        assert.fail(true, "Expected funtion to fail");
      } catch (e) {
        assert.exists(e, "Expected transaction to fail with error");
        assert.isFalse(
          (e.message || e) === "assert.fail()",
          "Expected non-assert failure"
        );
      }
    });

    it("should successfully transferEth funds", async function() {
      const acctBalance = await getBalance(accounts[1]);

      await wallet.transferEth(accounts[1], String(transferValue), {
        from: owner
      });

      const newAcctBalance = await getBalance(accounts[1]);
      assert.deepEqual(
        newAcctBalance,
        acctBalance.plus(transferValue),
        "Incorrect value transferred"
      );
    });
  });

  describe("callFunction()", function() {
    let tutorialToken;
    const tokenAmount = 15 * 10 ** 8;
    let calldata;

    before(async function() {
      tutorialToken = await TutorialToken.new({
        from: owner
      });
      await tutorialToken.mint(wallet.address, tokenAmount, {
        from: owner
      });
      const balance = await tutorialToken.balanceOf.call(wallet.address);
      assert.equal(
        balance.toNumber(),
        tokenAmount,
        "Incorrect quantity of tokens minted"
      );
      calldata = tutorialToken.contract.methods
        .transfer(accounts[3], String(tokenAmount))
        .encodeABI();
    });

    it("should fail to callFunction from non-priviledged account", async function() {
      try {
        await wallet.callFunction(tutorialToken.address, 0, calldata, {
          from: accounts[5]
        });
        assert.fail(true, "Expected funtion to fail");
      } catch (e) {
        assert.exists(e, "Expected transaction to fail with error");
        assert.isFalse(
          (e.message || e) === "assert.fail()",
          "Expected non-assert failure"
        );
      }
    });

    it("should successfully callFunction from priviledged account", async function() {
      const balance = new BigNumber(
        (await tutorialToken.balanceOf.call(accounts[3])).toString()
      );
      await wallet.callFunction(tutorialToken.address, 0, calldata, {
        from: owner
      });

      const newBalance = new BigNumber(
        (await tutorialToken.balanceOf.call(accounts[3])).toString()
      );
      assert.deepEqual(
        newBalance,
        balance.plus(tokenAmount),
        "Incorect amount of tokens transferred"
      );
    });
  });
});
