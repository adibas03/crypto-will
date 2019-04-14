pragma solidity ^0.4.24;

import "../installed_contracts/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract WithSchedule is Ownable {
  address private _scheduleContract;

  constructor () {}

  function scheduleContract ()
    public onlyOwner
  returns (address _scheduleContract) {
    return _scheduleContract;
  }

  function setScheduleContract (address _newScheduleContract)
    public onlyOwner
  returns (bool) {
    _scheduleContract = _newScheduleContract;
    return true;
  }
}
