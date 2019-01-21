const Deployer = artifacts.require('./Deployer');
const Will = artifacts.require('./Will');
const Wallet = artifacts.require('./Wallet');
const WillWallet = artifacts.require('./WillWallet');

contract ('Deployer', function (accounts) {

  const owner = accounts[0];
  const waitTime = 86400;
  let deployer;

  before(async function () {
    deployer = await Deployer.new();
    console.log('Deployer version:', (await deployer.version.call()).toString());
    assert.exists(deployer.address, ' Failed to deploy Deployer with address');
  });

  it('should deployWill', async function () {
    const receipt = await deployer.deployWill(waitTime);
    const logs = receipt.receipt.logs || [];
    const log = logs.filter(log => log.event === 'ContractDeployed')[0];
    const newContractAddress = log.args.contractAddress;

    assert.exists(log, 'Contract deployed event not found');
    assert.equal(log.args.contractType, 'will', 'Incorrect contract type deployed');
    assert.exists(newContractAddress, 'Contract not successfully deployed with an address');
    assert.exists(logs.filter(log => log.event === 'OwnershipTransferred')[0], 'Contract deployed event not found');

    const newWill = await Will.at(newContractAddress)
    assert.equal(await newWill.waitingTime.call(), waitTime, 'Incorrect waitTime set in contract');
  });

  it('should deployWallet', async function () {
    const receipt = await deployer.deployWallet();
    const logs = receipt.receipt.logs || [];
    const log = logs.filter(log => log.event === 'ContractDeployed')[0];
    const newContractAddress = log.args.contractAddress;
    assert.exists(log, 'Contract deployed event not found');
    assert.equal(log.args.contractType, 'wallet', 'Incorrect contract type deployed');
    assert.exists(newContractAddress, 'Contract not successfully deployed with an address');
    assert.exists(logs.filter(log => log.event === 'OwnershipTransferred')[0], 'Contract deployed event not found');
  });

  it('should deployWillWallet', async function () {
    const receipt = await deployer.deployWillWallet(waitTime);
    const logs = receipt.receipt.logs || [];
    const log = logs.filter(log => log.event === 'ContractDeployed')[0];
    const newContractAddress = log.args.contractAddress;
    assert.exists(log, 'Contract deployed event not found');
    assert.equal(log.args.contractType, 'willwallet', 'Incorrect contract type deployed');
    assert.exists(newContractAddress, 'Contract not successfully deployed with an address');
    assert.exists(logs.filter(log => log.event === 'OwnershipTransferred')[0], 'Contract deployed event not found');

    const newWillWallet = await WillWallet.at(newContractAddress);
    assert.equal(await newWillWallet.waitingTime.call(), waitTime, 'Incorrect waitTime set in contract');
  });
});
