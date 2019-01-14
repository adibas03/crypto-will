pragma solidity ^0.4.24;

import './Will.sol';
import './Wallet.sol';

/**
* Vault only instantiation, only focuses on eth value
*/
contract WillWallet is Will, Wallet {

  constructor (uint256 _waitTime )
    Will(_waitTime)
    public
  {
  }
}
