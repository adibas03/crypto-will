pragma solidity ^0.5.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TutorialToken is ERC20 {
  string public name = "TutorialToken";
  string public symbol = "TT";
  uint public decimals = 8;
  uint public INITIAL_SUPPLY = 120000000000000;
  address public minter;

  constructor() public {
    _mint(msg.sender, INITIAL_SUPPLY);
    minter = msg.sender;
  }

  function mint(address _receiver, uint256 _amount)
    public
  {
    require(minter == msg.sender, 'Only minter can mint tokens' );
    _mint(_receiver, _amount);
  }
}
