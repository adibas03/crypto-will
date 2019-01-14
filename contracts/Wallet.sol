pragma solidity ^0.4.24;

import "../installed_contracts/zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
* Wallet instantiation, is able to run almost any Interaction: eth, token, transactions
* It is basically a minimalistic implementation of Proxy contract discussed
* The owner of the contract can be set as an Identity contract like EIP 725 and increse the possibilities
*/
contract Wallet is Ownable {

  constructor ()
    public
  {}

  function transfer (address _destination, uint256 _value)
    public onlyOwner
  returns (bool) {
    _destination.transfer(_value);
    return true;
  }

  function callFunction (address _address, uint256 _value, bytes _callData) //Can be used to make wallet type calls, to interact with smart contracts
    public payable onlyOwner
  returns (bool) {
    return _address.call.value(_value)(_callData);
  }

  function ()
    public payable
  {
  }
}
