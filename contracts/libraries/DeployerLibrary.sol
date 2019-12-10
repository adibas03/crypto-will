pragma solidity ^0.5.12;

import "../WillWallet.sol";

library DeployerLibrary {

  enum ContractTypes { will, wallet, willwallet }

  function deployContract(ContractTypes _type, uint256 _waitTime)
    public
  returns (address newContract)
  {
    if (_type == ContractTypes.will) {
      newContract = address(new Will(_waitTime));
    } else if (_type == ContractTypes.wallet) {
      newContract = address(new Wallet());
    } else if (_type == ContractTypes.willwallet) {
      newContract = address(new WillWallet(_waitTime));
    }
  }
}
