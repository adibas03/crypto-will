const Will = artifacts.require('./Will');

contract ('Will', function (accounts) {
  const UNIT = 10**8;
  const ETHER = 10**18;
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

  const forceMine = async (value, isBlock) => {
  	//value: number of seconds or blocks to advance by
  	let count = 1;
  	if (!isBlock) {
  		 await new Promise((resolve, reject) => {
         web3.currentProvider.sendAsync({
    		   jsonrpc: "2.0",
    		   method: "evm_increaseTime",
    		   params: [value],
    		   id: new Date().getTime()
		     }, (err, res) => {
           if (err) {
             reject(err);
           }
           resolve(res.result);
         });
       });
  	 } else {
  		count = value;
  	}

    for( let i=0;i<count;i++) {
     await new Promise((resolve, reject) => {
       web3.currentProvider.sendAsync({
    	   jsonrpc: "2.0",
    	   method: "evm_mine",
    	   id: new Date().getTime()
    	 }, (err, res) => {
         if (err) {
           reject(err);
         }
         resolve(res.result);
       });
     });
    }
  }

  const owner = accounts[0];
  const waitTime = 86400;
  let will;

  const beneficiaries = [
    [ accounts[1], 150 * UNIT ],
    [ accounts[2], 100 * UNIT ],
    [ NULL_ADDRESS, 0 ],
    [ accounts[3], 50 * UNIT ],
    [ accounts[4], 70 * UNIT ],
    [ NULL_ADDRESS, 0 ],
    [ accounts[5], 150 * UNIT ],
    [ NULL_ADDRESS, 0 ],
    [ accounts[6], 30 * UNIT ],
  ];

  before(async function () {
    will = await Will.new(waitTime);
    assert.exists(will.address, ' Failed to deploy Will with address');
  });

  describe('updateBeneficiary', function () {
    const _beneficiary = beneficiaries[0][0];
    const _disposition = beneficiaries[0][1];

    it('should fail to access _addBeneficiary', async function () {
      try {
        await will._addBeneficiary(
          _beneficiary, _disposition, {
            from: owner
          }
        );
        assert.fail(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should fail to updateBeneficiary from non-priviledged address', async function () {
      try {
        await will.updateBeneficiary(
          _beneficiary, _disposition, {
            from: accounts[1]
          }
        );
        assert.fail(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should fail to updateBeneficiary to Zero', async function () {
      try {
        await will.updateBeneficiary(
          _beneficiary, 0, {
            from: owner
          }
        );
        assert.fail(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully updateBeneficiary', async function () {
      const beneficiaryExists = await will.beneficiaryExists.call(_beneficiary);
      assert.isFalse(beneficiaryExists, 'Address already set as beneficiary');

      await will.updateBeneficiary(
        _beneficiary, _disposition, {
          from: owner
        }
      );

      const newBeneficiaryExists = await will.beneficiaryExists.call(_beneficiary);
      assert.isTrue(newBeneficiaryExists, 'Address not successfully set as beneficiary');

      const setDisposition = (await will.disposition.call(_beneficiary)).toNumber();
      assert.strictEqual(setDisposition, _disposition, 'Incorrect disposition set for beneficiaries');
    });
  });

  describe('updateBeneficiaries', function () {
    const _remBeneficiaries = beneficiaries.slice(1).map(bnf => bnf[0]);
    const _remDisposition = beneficiaries.slice(1).map(bnf => bnf[1]);

    it('should fail to updateBeneficiaries from non-priviledged address', async function () {
      try {
        await will.updateBeneficiaries(
          _remBeneficiaries, _remDisposition, {
            from: accounts[1]
          }
        );
        assert.fail(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully updateBeneficiaries', async function () {
      const beneficiaryExists = await Promise.all(_remBeneficiaries.map( async (_bene) => {
        return await will.beneficiaryExists.call(_bene);
      }));
      const expectedExists = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ];
      assert.deepEqual(beneficiaryExists, expectedExists, 'Address already set as beneficiary');

      const fullBeneficiaries = new Array(10).fill(NULL_ADDRESS);
      const fullDisposition = new Array(10).fill(0);

      const fillBene = _remBeneficiaries.slice();
      const fillDisp = _remDisposition.slice();

      fillBene.unshift(0, _remBeneficiaries.length);
      fillDisp.unshift(0, _remDisposition.length);

      Array.prototype.splice.apply(fullBeneficiaries, fillBene);
      Array.prototype.splice.apply(fullDisposition, fillDisp);

      await will.updateBeneficiaries(fullBeneficiaries, fullDisposition, {
        from: owner
      });

      const newBeneficiaryExists = await Promise.all(_remBeneficiaries.map( async (_bene) => {
        return await will.beneficiaryExists.call(_bene);
      }));
      const expectedUpdatedExists = [
        true,
        false,
        true,
        true,
        false,
        true,
        false,
        true,
      ];
      assert.deepEqual(newBeneficiaryExists, expectedUpdatedExists, 'Address not successfully set as beneficiary');
    });
  });

  describe('removeBeneficiary()', function () {

    const _beneficiary = beneficiaries[beneficiaries.length-1][0];

    it('should fail to removeBeneficiary from non-priviledged address', async function () {
      try {
        await will.removeBeneficiary(
          _beneficiary, {
            from: accounts[1]
          }
        );
        assert.fail(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should fail to removeBeneficiary of Owner', async function () {
      try {
        await will.removeBeneficiary(
          owner, {
            from: owner
          }
        );
        assert.fail(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully removeBeneficiary', async function () {
      const beneficiaryExists = await will.beneficiaryExists.call(_beneficiary);
      assert.isTrue(beneficiaryExists, 'Address not yet set as beneficiary');

      await will.removeBeneficiary(
        _beneficiary, {
          from: owner
        }
      );

      const newBeneficiaryExists = await will.beneficiaryExists.call(_beneficiary);
      assert.isFalse(newBeneficiaryExists, 'Address not successfully removed from beneficiary');

      const setDisposition = (await will.disposition.call(_beneficiary)).toNumber();
      assert.strictEqual(setDisposition, 0, 'Beneficiaries disposition not successfully removed');
    });
  });

  describe('removeBeneficiaries', function () {
    const _toRemoveBeneficiaries = beneficiaries.slice(4, beneficiaries.length-1).map(bnf => bnf[0]);

    it('should fail to removeBeneficiaries from non-priviledged address', async function () {
      try {
        await will.removeBeneficiaries(
          _toRemoveBeneficiaries, {
            from: accounts[2]
          }
        );
        assert.fail(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    });

    it('should successfully removeBeneficiaries', async function () {
      const beneficiaryExists = await Promise.all(_toRemoveBeneficiaries.map( async (_bene) => {
        return await will.beneficiaryExists.call(_bene);
      }));
      const expectedExists = [
        true,
        false,
        true,
        false
      ];
      assert.deepEqual(beneficiaryExists, expectedExists, 'Address not yet set as beneficiary');

      const fullBeneficiaries = new Array(10).fill(NULL_ADDRESS);

      const fillBene = _toRemoveBeneficiaries.slice();
      fillBene.unshift(0, _toRemoveBeneficiaries.length);
      Array.prototype.splice.apply(fullBeneficiaries, fillBene);

      await will.removeBeneficiaries(fullBeneficiaries, {
        from: owner
      });

      const newBeneficiaryExists = await Promise.all(_toRemoveBeneficiaries.map( async (_bene) => {
        return await will.beneficiaryExists.call(_bene);
      }));
      const expectedUpdatedExists = [
        false,
        false,
        false,
        false,
      ];
      assert.deepEqual(newBeneficiaryExists, expectedUpdatedExists, 'Address not successfully removed from beneficiary');
    });
  });

  describe('postpone', function () {
    const valueToSend = 1 * ETHER;
    it('should fail to postpone from non-priviledged address', async function () {
      try {
        await will.postpone({
          from: accounts[2]
        });
        assert.fail(true, 'function should fail');
      } catch (e) {
        assert.exists(e.message || e, 'Expected error to exist from failed transaction');
        assert.isFalse((e.message || e) === 'assert.fail()', 'Expected non-assert failure');
      }
    })

    it ('should successfully trigger postpone from owner address', async function () {
      const timeNow = Math.floor(new Date().getTime()/1000);
      const isDisbursed = await will.disbursed.call();
      assert.isFalse(isDisbursed, 'Contract already disposed at least once');

      const postponeReceipt = await will.postpone({
        from: owner
      });

      const txBlock = await new Promise( (resolve, reject) => {
        web3.eth.getBlock(postponeReceipt.receipt.blockHash, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });

      const lastInteraction = await will.lastInteraction.call();
      assert.strictEqual(lastInteraction.toNumber(), txBlock.timestamp, 'Invalid lastInteraction time set in contract from block');
      assert.isAtLeast(lastInteraction.toNumber(), timeNow, 'Invalid lastInteraction time set in contract from miner time');
    });

    it ('should successfully trigger postpone with value from owner address', async function () {
      const timeNow = Math.floor(new Date().getTime()/1000);

      const isDisbursed = await will.disbursed.call();
      assert.isFalse(isDisbursed, 'Contract already disposed at least once');

      const ethBalance = await new Promise( (resolve, reject) => {
        web3.eth.getBalance(will.address, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });

      const postponeReceipt = await will.postpone({
        from: owner,
        value: valueToSend
      });

      const txBlock = await new Promise( (resolve, reject) => {
        web3.eth.getBlock(postponeReceipt.receipt.blockHash, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });

      const lastInteraction = await will.lastInteraction.call();
      assert.strictEqual(lastInteraction.toNumber(), txBlock.timestamp, 'Invalid lastInteraction time set in contract from block');
      assert.isAtLeast(lastInteraction.toNumber(), timeNow, 'Invalid lastInteraction time set in contract from miner time');

      const newEthBalance = await new Promise( (resolve, reject) => {
        web3.eth.getBalance(will.address, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });
      assert.strictEqual(newEthBalance.minus(ethBalance).toNumber(), valueToSend, 'Wrong amount of Ether sent to the contract');
    });
  });

  describe('fallback()', function () {
    const valueToSend = 0.5 * ETHER;
    const _remBeneficiaries = beneficiaries.slice(0, 4).map(bene => bene[0]);
    const _remDisposition = beneficiaries.slice(0, 4).map(bene => bene[1]);

    it ('should successfully trigger postpone from owner address', async function () {
      const timeNow = Math.floor(new Date().getTime()/1000);

      const isDisbursed = await will.disbursed.call();
      assert.isFalse(isDisbursed, 'Contract already disposed at least once');

      const postponeReceipt = await will.sendTransaction({
        from: owner,
        value: 0
      });

      const txBlock = await new Promise( (resolve, reject) => {
        web3.eth.getBlock(postponeReceipt.receipt.blockHash, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });

      const lastInteraction = await will.lastInteraction.call();
      assert.strictEqual(lastInteraction.toNumber(), txBlock.timestamp, 'Invalid lastInteraction time set in contract from block');
      assert.isAtLeast(lastInteraction.toNumber(), timeNow, 'Invalid lastInteraction time set in contract from miner time');
    });

    it ('should successfully trigger postpone with value from owner address with value', async function () {
      const timeNow = Math.floor(new Date().getTime()/1000);

      const isDisbursed = await will.disbursed.call();
      assert.isFalse(isDisbursed, 'Contract already disposed at least once');

      const ethBalance = await new Promise( (resolve, reject) => {
        web3.eth.getBalance(will.address, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });

      const postponeReceipt = await will.sendTransaction({
        from: owner,
        value: valueToSend
      });

      const txBlock = await new Promise( (resolve, reject) => {
        web3.eth.getBlock(postponeReceipt.receipt.blockHash, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });

      const lastInteraction = await will.lastInteraction.call();
      assert.strictEqual(lastInteraction.toNumber(), txBlock.timestamp, 'Invalid lastInteraction time set in contract from block');
      assert.isAtLeast(lastInteraction.toNumber(), timeNow, 'Invalid lastInteraction time set in contract from miner time');

      const newEthBalance = await new Promise( (resolve, reject) => {
        web3.eth.getBalance(will.address, (err,res) => {
          if (err) {
            return reject(err);
          }
          return resolve (res);
        });
      });
      assert.strictEqual(newEthBalance.minus(ethBalance).toNumber(), valueToSend, 'Wrong amount of Ether sent to the contract');
    });

    it('should fail to triggerDisposition() before isDispositionDue', async function () {
      const isDispositionDue = await will.isDispositionDue.call();
      assert.isFalse(isDispositionDue, 'Disposition is already due');

      const isDisbursed = await will.disbursed.call();
      assert.isFalse(isDisbursed, 'Contract already disposed at least once');

      try {
        await will.sendTransaction({
          from: accounts[3]
        });

        const disbursed = await will.disbursed.call();
        assert.isFalse(disbursed, 'Expected contract to not disburse');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
      }
    });

    it('should successfully triggerDisposition()', async function () {
      const isDispositionDue = await will.isDispositionDue.call();
      assert.isFalse(isDispositionDue, 'Disposition is already due');

      const isDisbursed = await will.disbursed.call();
      assert.isFalse(isDisbursed, 'Contract already disposed at least once');

      const accountBalances = await Promise.all(_remBeneficiaries.map( _bene => new Promise ((resolve,reject) => {
        if (_bene === NULL_ADDRESS) {
          resolve(0);
        }
        web3.eth.getBalance(_bene, (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res);
        });
      })));

      await forceMine(waitTime);

      const newIsDispositionDue = await will.isDispositionDue.call();
      assert.isTrue(newIsDispositionDue, 'Disposition is not due');

      const contractBalance = await new Promise ((resolve,reject) => {
        web3.eth.getBalance(will.address, (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res);
        });
      });

      await will.sendTransaction({
        from: accounts[3]
      });

      const disbursed = await will.disbursed.call();
      assert.isTrue(disbursed, 'Expected contract to disburse');

      const newAccountBalances = await Promise.all(_remBeneficiaries.map( _bene => new Promise ((resolve,reject) => {
        if (_bene === NULL_ADDRESS) {
          resolve(0);
        }
        web3.eth.getBalance(_bene, (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res);
        });
      })));

      const dispositionSum = _remDisposition.reduce((a,b) => a+b);
      _remDisposition.map((_disposition, index) => {
        const gross = Math.floor(contractBalance.times(_disposition).toNumber());
        const amountDue = Math.floor(gross/dispositionSum/(UNIT));
        accountBalances[index] = accountBalances[index] === 0 ? amountDue : accountBalances[index].plus(amountDue);
      });

      _remBeneficiaries.map((_bene, index) => {
        // console.log(Number(newAccountBalances[index]), Number(accountBalances[index]))
        assert.isAtLeast(Number(newAccountBalances[index]), Number(accountBalances[index])* 0.99, 'Incorrect amounts disbursed');
        // assert.isAtMost(Number(newAccountBalances[index]), Number(accountBalances[index]), 'Incorrect amounts disbursed');
      });
    });
  });
});
