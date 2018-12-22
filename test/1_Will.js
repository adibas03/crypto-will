const Will = artifacts.require('./Will');

contract ('Will', function (accounts) {
  const UNIT = 10**8;

  const owner = accounts[0];
  const waitTime = 86400;
  let will;

  before(async function () {
    will = await Will.new(waitTime);
    assert.exists(will.address, ' Failed to deploy Will with address');
  });

  describe('updateBeneficiary', function () {
    const _beneficiary = accounts[1];
    const _disposition = 150 * UNIT;

    it('should fail to access _addBeneficiary', function () {
      try {
        await will._addBeneficiary(
          _beneficiary, _disposition
        );
        assert.notExists(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.notEists()', 'Expected non-assert failure');
      }
    });

    it('should fail to updateBeneficiary from non-priviledged address', function () {
      try {
        await will.updateBeneficiary(
          _beneficiary, _disposition
        );
        assert.notExists(true, 'Expected function to throw');
      } catch (e) {
        assert.exists(e.message || e, 'Transaction should fail with an error');
        assert.isFalse((e.message || e) === 'assert.notEists()', 'Expected non-assert failure');
      }
    });

    it('should successfully updateBeneficiary', function () {
      try {
        const beneficiaryExists = will.beneficiaryExists.call(_beneficiary);
        assert.isFalse(beneficiaryExists, 'Address already set as beneficiary');

        await will.updateBeneficiary(
          _beneficiary, _disposition
        );

        const newBeneficiaryExists = will.beneficiaryExists.call(_beneficiary);
        assert.isFalse(newBeneficiaryExists, 'Address already set as beneficiary');
      } catch (e) {
        assert.notExists(e.message || e, 'Transaction should succeed');
      }
    });
  });
})
