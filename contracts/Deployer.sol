pragma solidity ^0.5.12;

import "@openzeppelin/contracts/lifecycle/Pausable.sol";
import "./libraries/DeployerLibrary.sol";
import "./Version.sol";

contract Deployer is Pausable, Version {

  constructor ()
    public
  {}

  event ContractDeployed(string contractType, address indexed contractAddress, address indexed creator);

  function _transferOwnership(address _contract, address _newOwner)
  internal
  {
    Ownable(_contract).transferOwnership(_newOwner);
  }

  function _handleDeposit(address _newContract)
  internal
  {
    if (msg.value > 0) {
      address payable newContract = address(uint160(_newContract));
      newContract.transfer(msg.value);
    }
  }

  function _deployContract(DeployerLibrary.ContractTypes _type, uint256 _waitTime)
  internal
  returns (address newContract)
  {
    newContract = DeployerLibrary.deployContract(_type, _waitTime);
    if (newContract != address(0)) {
      _transferOwnership(newContract, msg.sender);
      _handleDeposit(newContract);
    }
  }

  function deployWill(uint256 _waitTime)
  public whenNotPaused
  {
    address newContract = _deployContract(DeployerLibrary.ContractTypes.will, _waitTime);
    require(newContract != address(0), 'Will not successfull deployed');
    emit ContractDeployed('will', newContract, msg.sender);
  }

  function deployWallet()
  public whenNotPaused
  {
    address newContract = _deployContract(DeployerLibrary.ContractTypes.wallet, 0);
    require(newContract != address(0), 'Wallet not successfull deployed');
    emit ContractDeployed('wallet', newContract, msg.sender);
  }

  function deployWillWallet(uint256 _waitTime)
  public whenNotPaused
  {
    address newContract = _deployContract(DeployerLibrary.ContractTypes.willwallet, _waitTime);
    require(newContract != address(0), 'Willwallet not successfull deployed');
    emit ContractDeployed('willwallet', newContract, msg.sender);
  }
}
