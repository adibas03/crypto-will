pragma solidity ^0.4.23;

import './Ownable.sol';

/**
* Wallet instantiation, is albe to run almost any Interaction: eth, toke, transactions
*/
contract Wallet is Ownable {

  constructor ()
    public
  {
  }

  function transfer (address _destination, uint256 _value)
    public onlyOwner
  returns (bool) {
    _destination.transfer(_value);
    return true;
  }

  function callFunction (address _address, uint256 _value, bytes32 _callData) //Can be used to make wallet type calls, to interact with smart contracts
    public payable onlyOwner
  returns (bool) {
    return _address.call.value(_value)(_callData);
  }

  function ()
    public payable
  {
  }
}
