pragma solidity ^0.4.23;

import './Will.sol';
import './Wallet.sol';

/**
* Vault only instantiation, only focuses on eth value
*/
contract WillWallet is Will, Wallet {

  uint256 constant decimals = 8; //Allow fractions for disposition
  uint256 waitingTime; //How long to wait before initiating distribution
  uint256 lastInteraction; //Last time contract was interacted with
  address[] beneficiaries; //Address for each beneficiary
  mapping( address => uint256) disposition; //Percentage of total balacne to be sent to each beneficiary

  event BeneficiaryUpdated( address _beneficiary, uint256 _disposition, uint256 _timestamp); //Notify of update to beneficiaries / disposition

  constructor (uint256 _waitTime )
    Will(_waitTime)
    public
  {
  }
}
