pragma solidity ^0.5.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import './Version.sol';
import "./WithSchedule.sol";

/**
* Vault only instantiation, only focuses on eth value
*/
contract Will is Ownable, Version, WithSchedule {
  using SafeMath for uint;

  uint256 constant ONE = 1; //Constant representation of 1
  uint256 constant public maxArrayLength = 10; //Maximum length of array for functions that accept arrays

  bool public disbursed; //Whether the contract has Disposed at least once
  bool public disbursing; //Whether the contract is pressently running a disbursement
  uint256 public waitingTime; //How long to wait before initiating distribution
  uint256 public lastInteraction; //Last time contract was interacted with
  address[] beneficiaries; //Address for each beneficiary
  mapping( address => uint256) public disposition; //List of ratio of contract balance to sent to each beneficiary
  mapping(address => uint256) beneficiaryIndex; //Mapping of beneficiary to index in beneficiaries list

  event BeneficiaryUpdated( address indexed beneficiary, uint256 disposition); //Notify of update to beneficiaries / disposition
  event BeneficiarySettled( address indexed beneficiary, uint256 total); //Notify of update to beneficiaries / disposition

  constructor (uint256 _waitTime )
    public
  {
    beneficiaries.push(msg.sender);
    waitingTime = _waitTime;
    lastInteraction = now;
  }

  function isBeneficiary (address _addr)
    public view
  returns (bool) {
    return disposition[_addr] > 0;
  }

  function totalBeneficiaries ()
    public view
  returns (uint) {
    return beneficiaries.length;
  }

  function dispositionSum ()
    public view
  returns (uint256 _sum) {
    for (uint256 i=1; i<beneficiaries.length; i++) {
      _sum = _sum.add(disposition[ beneficiaries[i] ]);
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

  function _calcDispositionDue (address _beneficiary, uint256 _totalBalance, uint256 _dispositionSum)
    internal view
  returns (uint256){
    return (_totalBalance.mul(disposition[_beneficiary] )).div(_dispositionSum);
  }

  function updateBeneficiary (address _beneficiary, uint256 _disposition)
    public onlyOwner
  returns (bool)
  {
    require(_beneficiary != address(0), '_beneficiary cannot be Zero');
    require(_beneficiary != beneficiaries[0], 'Cannot update Contract Owner disposition');
    require(_disposition > 0, 'Disposition must be greter than 0');
    require(!isDispositionDue(), 'Can not update dispositions when disposition is Due');
    if (getBeneficiaryIndex(_beneficiary) == 0) {
      // add beneficiary
      beneficiaryIndex[_beneficiary] = beneficiaries.length;
      beneficiaries.push(_beneficiary);
    }

    //update disposition
    disposition[_beneficiary] = _disposition;

    //reset lastInteraction
    postpone();

    emit BeneficiaryUpdated(_beneficiary, _disposition);
    return true;
  }

  // Update batch of up to Ten (10) beneficiaries, beneficiary must have corresponding index for disposition in _dispositions
  function updateBeneficiaries (address[10] memory _beneficiaries, uint256[10] memory _dispositions)
    public onlyOwner
  returns (bool)
  {

    for (uint256 i=0; i<maxArrayLength; i++) {
      if (_beneficiaries[i] != address(0)) {
        updateBeneficiary(_beneficiaries[i], _dispositions[i]);
      }
    }
    return true;
  }

  function removeBeneficiary (address _beneficiary)
    public onlyOwner
  returns (bool)
  {
    require(_beneficiary != address(0), 'Provide a beneficiary address to remove');
    require(!isDispositionDue(), 'Can not update dispositions when disposition is Due');

    uint256 idx = getBeneficiaryIndex(_beneficiary);

    assert(beneficiaries[idx] == _beneficiary);
    require(idx != 0, 'You can not remove the creator as a beneficiary');//Ensure  first beneficiary can never be removed

    //reset lastInteraction
    postpone();

    //Remove beneficiary
    delete(disposition[_beneficiary]);
    delete(beneficiaryIndex[_beneficiary]);

    // Rearrange indexes
    beneficiaries[idx] = beneficiaries[ beneficiaries.length.sub(ONE) ];
    beneficiaryIndex[ beneficiaries[idx] ] = idx;
    beneficiaries.length--;

    emit BeneficiaryUpdated(_beneficiary, 0);
    return true;
  }

  //Remove up to Ten(10) beneficiaries
  function removeBeneficiaries (address[10] memory _beneficiaries)
      public onlyOwner
  returns (bool) {

    for (uint256 i=0; i<maxArrayLength; i++) {
      if (_beneficiaries[i] != address(0)) {
        removeBeneficiary(_beneficiaries[i]);
      }
    }
    return true;
  }

  //Reset the Wait Time, by pushing Disposition forward by another waitTime cycle
  function postpone ()
    public payable onlyOwner
  returns (bool) {
    require(disbursed == false, 'Timer can not be reset after initial disposition');
    lastInteraction = now;
    return true;
  }

  //Send balances to beneficiaries and send remainder to contract creator
  function triggerDisposition ()
    public
  {
    require(isDispositionDue(), 'Will is not yet due for disposition');
    require(disbursing == false, 'An instance of disbursement is already running');
    disbursing = true;

    uint256 amountDue = 0;
    uint256 _balance = address(this).balance;
    uint256 _dispositionSum = dispositionSum();
    disbursed = true;
    if (beneficiaries.length > 1) {
      for (uint256 _b=1;_b<beneficiaries.length;_b++) {
        amountDue = _calcDispositionDue(beneficiaries[_b], _balance, _dispositionSum);
        address payable beneficiary = address(uint160(beneficiaries[_b]));
        beneficiary.transfer( amountDue );
        emit BeneficiarySettled(beneficiaries[_b], amountDue);
      }
    }
    address payable createdBy = address(uint160(beneficiaries[0]));
    createdBy.transfer(address(this).balance);
    disbursing = false;
  }

  /**
  * Scenarios:
  * - Non-owner sends funds to contract: funds are received no function is triggerred
  * - Owner sends funds to contract: funds are received and postpone is triggerred if not yet disbursed
  * - Non-owner sends no value to contract: contract triggerDisposition if isDispositionDue
  * - Owner sends no value to contract: postpone is triggerred if not yet disbursed
  */
  function ()
    external payable
  {
    if (msg.sender == owner() && disbursed == false) {
      postpone();
    } else if (msg.value == 0 && isDispositionDue()) {
      triggerDisposition();
    }
  }
}
