const Deployer = artifacts.require('./Deployer');
const BigNumber = require('bignumber.js');

contract ('Deployer', function (accounts) {
  const ETHER = 10**18;
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
  const CALC_ACCURACY = 0.9999;

  const forceMine = async (value, isBlock) => {
  	//value: number of seconds or blocks to advance by
  	let count = 1;
    const send = web3.currentProvider.sendAsync || web3.currentProvider.send;
  	if (!isBlock) {
  		 await new Promise((resolve, reject) => {
         send({
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
       send({
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

  const getBalance = function (address) {
    return new Promise ((resolve,reject) => {
      web3.eth.getBalance(address, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(new BigNumber(res));
      });
    });
  }

  const getTxBlock = function (hash) {
    return new Promise( (resolve, reject) => {
      web3.eth.getBlock(hash, (err,res) => {
        if (err) {
          reject(err);
        }
        resolve (res);
      });
    });
  }

  const owner = accounts[0];
  const waitTime = 86400;
  let deployer;

  const beneficiaries = [
    [ accounts[1], 150 ],
    [ accounts[2], 100 ],
    [ NULL_ADDRESS, 0 ],
    [ accounts[3], 50 ],
    [ accounts[4], 70 ],
    [ NULL_ADDRESS, 0 ],
    [ accounts[5], 150 ],
    [ NULL_ADDRESS, 0 ],
    [ accounts[6], 30 ],
  ];

  before(async function () {
    deployer = await Deployer.new();
    console.log('Deployer version:', (await deployer.version.call()).toString());
    assert.exists(deployer.address, ' Failed to deploy Deployer with address');
  });

  describe('deployWill', function () {
    it('should fail to deploywill', function () {
      console.log(deployer)
    })
  })

  describe.skip('updateBeneficiary', function () {
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

  describe.skip('updateBeneficiaries', function () {
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

  describe.skip('removeBeneficiary()', function () {

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

  describe.skip('removeBeneficiaries', function () {
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
});
