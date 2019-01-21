pragma solidity ^0.4.24;

import "../installed_contracts/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract TutorialToken is StandardToken {
  string public name = "TutorialToken";
  string public symbol = "TT";
  uint public decimals = 8;
  uint public INITIAL_SUPPLY = 120000000000000;
  address public minter;

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    minter = msg.sender;
  }

  function mint(address _receiver, uint256 _amount)
    public
  {
    require(minter == msg.sender, 'Only minter can mint tokens' );
    balances[_receiver] = balances[_receiver] + _amount;
  }
}
