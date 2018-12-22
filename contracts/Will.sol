pragma solidity ^0.4.24;

import "../installed_contracts/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../installed_contracts/zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
* Vault only instantiation, only focuses on eth value
*/
contract Will is Ownable {
  using SafeMath for uint;

  uint256 constant decimals = 8; //Allow fractions for disposition
  uint256 waitingTime; //How long to wait before initiating distribution
  uint256 lastInteraction; //Last time contract was interacted with
  address[] public beneficiaries; //Address for each beneficiary
  mapping( address => uint256) public disposition; //List of ratio of contract balance to sent to each beneficiary
  mapping(address => bool) public beneficiaryExists; //Boolean to indicate that address exists as beneficiary
  mapping(address => uint256) beneficiaryIndex; //Mapping of beneficiary to index in beneficiaries list

  event BeneficiaryUpdated( address beneficiary, uint256 disposition, uint256 timestamp); //Notify of update to beneficiaries / disposition

  constructor (uint256 _waitTime )
    public
  {
    beneficiaries.push(msg.sender);
    waitingTime = _waitTime;
    lastInteraction = now;
  }

  function unit ()
    public pure
  returns (uint256) {
    return 10**decimals;
  }

  function totalBeneficiaries ()
    public view
  returns (uint) {
    return beneficiaries.length;
  }

  function dispositionSum ()
    public view
  returns (uint256 _sum) {
    for (uint256 i=0; i<beneficiaries.length; i++){
      _sum.add(disposition[ beneficiaries[i] ]);
    }
  }

  function totalDisposed ()
    public view
  returns (uint256 _total) {//Total amount already disposed
    for (uint256 i=0; i<beneficiaries.length; i++){
      _total.add(disposition[ beneficiaries[i] ].div(unit()));
    }
  }

  function isDispositionDue ()
    public view
  returns (bool) {
    return now.sub(lastInteraction) >= waitingTime;
  }

  function getBeneficiaryIndex (address _beneficiary)
    public view
  returns (uint256){
    return beneficiaryIndex[_beneficiary];
  }

  function _addBeneficiary (address _beneficiary, uint256 _disposition)
    internal onlyOwner
  returns (bool)
  {
    require(_beneficiary != 0x0, '_beneficiary cannot be Zero');
    require(beneficiaryExists[_beneficiary] == false, 'Cannot add existing beneficiary Anew, use update');
    beneficiaryExists[_beneficiary] = true;
    beneficiaryIndex[_beneficiary] = beneficiaries.length;
    disposition[_beneficiary] = _disposition;
    beneficiaries.push(_beneficiary);
    emit BeneficiaryUpdated(_beneficiary, _disposition, block.timestamp);
  }

  function updateBeneficiary (address _beneficiary, uint256 _disposition)
    public onlyOwner
  returns (bool)
  {
    require(_beneficiary != 0x0, '_beneficiary cannot be Zero');
    require(!isDispositionDue(), 'Can not update dispositions when disposition is Due');
    if (getBeneficiaryIndex(_beneficiary) == 0) {
      return _addBeneficiary(_beneficiary,_disposition);
    } else {
      disposition[_beneficiary] = _disposition;
      emit BeneficiaryUpdated(_beneficiary, _disposition, block.timestamp);
      return true;
    }
  }

  // Update batch of up to Ten (10) beneficiaries, beneficiary must have corresponding index for disposition in _dispositions
  function updateBeneficiaries (address[10] _beneficiaries, uint256[10] _dispositions)
    public onlyOwner
  returns (bool)
  {
    uint256 maxLength = 10;

    for (uint256 i=0; i<maxLength; i++) {
      if (_beneficiaries[i] != 0x0) {
        updateBeneficiary(_beneficiaries[i], _dispositions[i]);
      }
    }
    return true;
  }

  function removeBeneficiary (address _beneficiary)
    public onlyOwner
  {
    require(_beneficiary != 0x0, 'Provide a beneficiary address to remove');
    require(!isDispositionDue(), 'Can not update dispositions when disposition is Due');

    uint256 idx = getBeneficiaryIndex(_beneficiary);

    assert(beneficiaries[idx] == _beneficiary, 'Beneficiary not successfully located, try again');
    require(idx != 0);//Ensure  first beneficiary can never be removed

    delete(disposition[_beneficiary]);
    beneficiaries[idx] = beneficiaries[ beneficiaries.length-1 ];
    delete(beneficiaries[beneficiaries.length-1]);
    beneficiaries.length--;
    delete(beneficiaryIndex[_beneficiary]);
    delete(beneficiaryExists[_beneficiary]);
    emit BeneficiaryUpdated(_beneficiary, 0, block.timestamp);
  }

  //Remove up to Ten(10) beneficiaries
  function removeBeneficiaries (address[10] _beneficiaries)
      public onlyOwner
    {
      uint256 maxLength = 10;

      for (uint256 i=0; i<maxLength; i++) {
        if (_beneficiaries[i] != 0x0) {
          removeBeneficiary(_beneficiaries[i]);
        }
      }
      return true;
    }

  function triggerDisposition () //Send balances to beneficiaries and send remainder to contract creator
    public
  {
    require(isDispositionDue(), 'Will is not yet due for disposition');
    uint256 _balance = address(this).balance;
    uint256 _dispositionSum = dispositionSum();
    uint256 _unit = unit();
    for (uint256 _b=1;_b<beneficiaries.length;_b++) {
      beneficiaries[_b].transfer( _balance.mul(disposition[beneficiaries[_b]] ).div(_dispositionSum).div(_unit) );
    }
    beneficiaries[0].transfer(address(this).balance);
  }

  function ()
    public payable
  {
    if (msg.value == 0) {
      triggerDisposition();
    }
  }
}
