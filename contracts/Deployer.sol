pragma solidity ^0.4.24;

import "../installed_contracts/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./WillWallet.sol";

contract Deployer is Pausable {
  constructor ()
  public {

  }

  enum ContractTypes { will, wallet, willwallet }
  event ContractDeployed(string contractType, address indexed contractAddress, address indexed creator);

  function _transferOwnership(address _contract, address _newOwner)
  internal
  {
    Ownable(_contract).transferOwnership(_newOwner);
  }

  function _deployContract(ContractTypes _type, uint256 _waitTime)
  internal
  returns (address newContract)
  {
    if (_type == ContractTypes.will) {
      newContract = new Will(_waitTime);
    } else if (_type == ContractTypes.wallet) {
      newContract = new Wallet();
    } else if (_type == ContractTypes.willwallet) {
      newContract = new WillWallet(_waitTime);
    }
    if (newContract != 0x0) {
      _transferOwnership(newContract, msg.sender);
      _handleDeposit(newContract);
    }
  }

  function _handleDeposit(address _newContract)
  internal
  {
    if (msg.value > 0) {
      _newContract.transfer(msg.value);
    }
  }

  function deployWill(uint256 _waitTime)
  public whenNotPaused
  {
    address newContract = _deployContract(ContractTypes.will, _waitTime);
    require(newContract != 0x0, 'Will not successfull deployed');
    emit ContractDeployed('will', newContract, msg.sender);
  }

  function deployWallet()
  public whenNotPaused
  {
    address newContract = _deployContract(ContractTypes.wallet, 0x0);
    require(newContract != 0x0, 'Wallet not successfull deployed');
    emit ContractDeployed('wallet', newContract, msg.sender);
  }

  function deployWillWallet(uint256 _waitTime)
  public whenNotPaused
  {
    address newContract = _deployContract(ContractTypes.willwallet, _waitTime);
    require(newContract != 0x0, 'Willwallet not successfull deployed');
    emit ContractDeployed('willwallet', newContract, msg.sender);
  }
}
