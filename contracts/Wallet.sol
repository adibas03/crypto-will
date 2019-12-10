pragma solidity ^0.5.12;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import './Version.sol';

/**
* Wallet instantiation, is able to run almost any Interaction: eth, token, transactions
* It is basically a minimalistic implementation of Proxy contract discussed
* The owner of the contract can be set as an Identity contract like EIP 725 and increse the possibilities
*/
contract Wallet is Ownable, Version {

  constructor ()
    public
  {}

  function transferEth (address payable _destination, uint256 _value)
    public payable onlyOwner
  returns (bool) {
    _destination.transfer(_value);
    return true;
  }

  function callFunction (address payable _address, uint256 _value, bytes memory _callData) //Can be used to make wallet type calls, to interact with smart contracts
    public payable onlyOwner
  returns (bool, bytes memory) {
    return _address.call.value(_value)(_callData);
  }

  function ()
    external payable
  {
  }
}
