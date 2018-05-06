pragma solidity ^0.4.23;

import './libraries/SafeMath.sol';
import './Ownable.sol';

/**
* Vault only instantiation, only focuses on eth value
*/
contract Will is Ownable {
  using SafeMath for uint;

  uint256 decimals = 8; //Allow fractions for disposition
  uint256 waitingTime; //How long to wait before initiating distribution
  uint256 lastInteraction; //Last time contract was interacted with
  address[] beneficiaries; //Address for each beneficiary
  mapping( address => uint256) disposition; //Percentage of total balacne to be sent to each beneficiary

  event BeneficiaryUpdated( address _beneficiary, uint256 _disposition, uint256 _timestamp); //Notify of update to beneficiaries / disposition

  constructor (uint256 _waitTime )
    public
  {
    beneficiaries[0] = msg.sender;
    waitingTime = _waitTime;
  }

  function unit ()
    public view
  returns (uint) {
    return 10**decimals;
  }

  function totalDisposed ()
    public view
  returns (uint256 _total) {//Total amount already disposed
    for (uint256 i=0; i<beneficiaries.length; i++){
      _total.add(disposition[ beneficiaries[i] ].div(unit()));
    }
    return _total;
  }

  function isDispositionDue ()
    public view
  returns (bool) {
    return now.sub(lastInteraction) >= waitingTime;
  }

  function getBeneficiaryIndex (address _beneficiary)
    public view
  returns (uint256){
    for (uint256 _b=0; _b<beneficiaries.length; _b++) {
      if (beneficiaries[_b] == _beneficiary) {
        return _b;
      }
    }
    return 0;
  }

  function addBeneficiary (address _beneficiary, uint256 _disposition)
    public onlyOwner
  {
    require(_beneficiary != 0x0);
    require(getBeneficiaryIndex(_beneficiary) == 0);
    disposition[_beneficiary] = _disposition;
    beneficiaries.push(_beneficiary);
    emit BeneficiaryUpdated(_beneficiary, _disposition, block.timestamp);
  }
  }

  function removeBeneficiary (address _beneficiary)
    public onlyOwner
  {
    require(_beneficiary != 0x0);
    require(_beneficiary != beneficiaries[0]);//Ensure  first beneficiary can never be removed
    uint256 idx = getBeneficiaryIndex(_beneficiary);

    assert(beneficiaries[idx] == _beneficiary);

    delete(disposition[_beneficiary]);
    beneficiaries[idx] = beneficiaries[ beneficiaries.length-1 ];
    delete(beneficiaries[beneficiaries.length-1]);
    beneficiaries.length--;
    emit BeneficiaryUpdated(_beneficiary, 0, block.timestamp);
  }

  function triggerDisposition () //Send balances to beneficiaries and send remainder to contract creator
    public
  {
    require(isDispositionDue());
    uint256 _balance = address(this).balance;
    for (uint256 _b=1;_b<beneficiaries.length;_b++) {
      beneficiaries[_b].transfer( _balance.mul(disposition[beneficiaries[_b]]).div(unit()) );
    }
    beneficiaries[_0].transfer(address(this).balance);
  }

  function ()
    public payable
  {
    if (msg.value == 0) {
      triggerDisposition();
    }
  }
}
