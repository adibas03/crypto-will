const Will = artifacts.require('./Will');

contract ('Will', function (accounts) {
  const UNIT = 10**8;
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

  const owner = accounts[0];
  const waitTime = 86400;
  let will;

  const beneficiaries = [
    [ accounts[1], 150 * UNIT ],
    [ accounts[2], 100 * UNIT ],
    [ 0, 0 ],
    [ accounts[3], 50 * UNIT ],
    [ accounts[4], 70 * UNIT ],
    [ 0, 0 ],
    [ accounts[5], 150 * UNIT ],
    [ 0, 0 ],
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

      await will.updateBeneficiaries(fullBeneficiaries, fullDisposition);

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

      const setDispositions = await Promise.all(_remBeneficiaries.map( async _bene => (await will.disposition.call(_bene)).toNumber()));
      assert.deepEqual(setDispositions, _remDisposition, 'Incorrect disposition set for beneficiaries');
    });
  });

  describe('removeBeneficiary()', function () {

  })
})
