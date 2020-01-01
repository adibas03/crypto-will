import { ContractEvents, ContractTypes, Networks, Timers } from "../Config";
import Deployer from "../../build/contracts/Deployer.json";
import Ownable from "../../build/contracts/Ownable.json";
import Will from "../../build/contracts/Will.json";
import Wallet from "../../build/contracts/Wallet.json";
import WillWallet from "../../build/contracts/WillWallet.json";

const ETHER = 10 ** 18;
const CONTRACT_ARRAYs_LENGTH = 10;
const BENEFICIARY_EVENT = "BeneficiaryUpdated";
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const CONTRACT_EVENTS = ContractEvents;

const ARTIFACTS = {
  Will,
  Wallet,
  WillWallet
};

const web3Scripts = {
  async getNetworkId(web3) {
    const getID = web3.version.getNetwork || web3.eth.net.getId;
    return new Promise((resolve, reject) => {
      getID(function(err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  },
  async getBlockNumber(web3) {
    const blockNumber = await web3.eth.getBlockNumber();
    return blockNumber;
  },
  async getAddressBalance(web3, address) {
    if (!this.isValidAddress(web3, address)) {
      throw new Error("Not a valid address");
    }
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(address, function(err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  },
  async makeContractCall(Contract, method, ...args) {
    let result;
    if (args.length > 0) {
      result = await Contract.methods[method]().call(...args);
    } else {
      result = await Contract.methods[method]().call();
    }
    return result;
  },
  async getContractOwner(web3, address) {
    const abi = Ownable.abi;
    const contract = await new web3.eth.Contract(abi, address);
    const owner = await this.makeContractCall(contract, "owner");
    return owner;
  },
  async deployContract({
    Deployer,
    fromAddress,
    type,
    args,
    onTransactionHash,
    onReceipt
  }) {
    if (!Deployer) {
      throw "Deployer instance not available";
    }
    let idx;
    try {
      switch (type) {
        case "Will":
          idx = Deployer.methods.deployWill(args["waitTime"]).send({
            from: fromAddress
          });
          break;
        case "Wallet":
          idx = Deployer.methods.deployWallet().send({
            from: fromAddress
          });
          break;
        case "WillWallet":
          idx = Deployer.methods.deployWillWallet(args["waitTime"]).send({
            from: fromAddress
          });
          break;
      }
      this.setupListeners(idx, { onTransactionHash, onReceipt });
      return idx;
    } catch (e) {
      throw e;
    }
  },
  async requireFromBlock(Contract, network) {
    const fromBlock = await this.getDeployedRBlock(Contract, network);
    if (fromBlock === null) {
      throw new Error("Contract not deployed on network");
    }
    return fromBlock;
  },
  async getDeploymentReceipt(Deployer, network, contractAddress) {
    const fromBlock = await this.requireFromBlock(Deployer, network);
    return new Promise((resolve, reject) => {
      this.truffleSubscribeOnceEvent(
        Deployer,
        "ContractDeployed",
        fromBlock,
        event => {
          resolve(event);
        },
        {
          contractAddress
        }
      );
    });
  },
  async fetchDeployments(
    Deployer,
    network,
    filter,
    { onData, onChanged, onError }
  ) {
    const fromBlock = await this.requireFromBlock(Deployer, network);
    const event = this.subscribeEvents(
      Deployer,
      "ContractDeployed",
      fromBlock,
      filter
    );
    this.setupListeners(event, { onData, onChanged, onError });
    return event;
  },
  async getDeployedRBlock(Contract, network) {
    const receipt = await this.getDeployedReceipt(Contract, network);
    return (receipt && receipt.blockNumber) || null;
  },
  async getDeployedReceipt(Contract, network) {
    let txHash;
    if (Contract.contractName === "Deployer") {
      txHash = Deployer.networks[network].transactionHash;
    } else {
      txHash = Contract.contractArtifact.networks[network].transactionHash;
    }
    const receipt = await Contract.web3.eth.getTransactionReceipt(txHash);
    return receipt;
  },
  async isContractDisbursed(Contract) {
    return await this.makeContractCall(Contract, "disbursed");
  },
  async isContractDisbursing(Contract) {
    return await this.makeContractCall(Contract, "disbursing");
  },
  async fetchBeneficiaries(drizzle, newtworkId, address) {
    if (!drizzle.contracts[address]) {
      await this.loadDrizzleContractWithContractType(
        drizzle,
        "Will",
        address,
        CONTRACT_EVENTS.will
      );
    }
    const contract = drizzle.contracts[address];
    const totalBeneficiaries = await this.makeContractCall(
      contract,
      "totalBeneficiaries"
    );

    if (Number(totalBeneficiaries) === 1) {
      return [];
    }
    const beneficiaries = [];
    const receipt = await this.getDeploymentReceipt(
      drizzle.contracts.Deployer,
      newtworkId,
      address
    );
    const events = this.subscribeEvents(
      contract,
      "allEvents",
      receipt.blockNumber
    );
    await new Promise((resolve, reject) => {
      this.setupListeners(events, {
        onData: data => {
          this.getBeneficiaryFromEvent(data, beneficiaries);
          if (beneficiaries.length === totalBeneficiaries - 1) {
            resolve(true);
          }
        },
        onError: err => {
          if (err) {
            reject(err);
          }
        }
      });
    });
    return beneficiaries;
  },
  async loadDrizzleContract(drizzle, address, abi, events = []) {
    await drizzle.addContract(
      {
        contractName: address,
        web3Contract: await new drizzle.web3.eth.Contract(abi, address)
      },
      events
    );
  },
  async loadDrizzleContractWithContractType(
    drizzle,
    contractType,
    address,
    events = []
  ) {
    if (!drizzle || !drizzle.addContract || !drizzle.web3) {
      throw new Error("Drizzle not loaded");
    }
    if (
      !contractType ||
      !ContractTypes.some(
        one => one.toLowerCase() === contractType.toLowerCase()
      )
    ) {
      throw new Error("Invalid contract type");
    }
    if (!address || !this.isValidAddress(drizzle.web3, address)) {
      throw new Error("Invalid address");
    }
    contractType = ContractTypes.find(
      one => one.toLowerCase() === contractType.toLowerCase()
    );
    const abi = ARTIFACTS[contractType].abi;
    events = events.length > 1 ? events : CONTRACT_EVENTS[contractType];
    await this.loadDrizzleContract(drizzle, address, abi, events);
  },
  // async fetchPastEvents ( Contract, event, fromBlock, filter={}, topics=[]) {
  //     return Contract.getPastEvents(
  //         event,
  //         fromBlock,
  //         filter,
  //         topics
  //     );
  // },
  async unsubscribeEvent(event) {
    return await new Promise((resolve, reject) => {
      event.unsubscribe((err, success) => {
        if (err) {
          reject(err);
        }
        resolve(success);
      });
    });
  },
  extractTxConfig({ from, gas, gasLimit, value, data }) {
    const txConfig = {};
    from ? (txConfig.from = from) : "";
    gas ? (txConfig.gas = gas) : "";
    gasLimit ? (txConfig.gasLimit = gasLimit) : "";
    value ? (txConfig.value = value) : "";
    data ? (txConfig.data = data) : "";
    return txConfig;
  },
  sendTransaction(
    Contract,
    method,
    { from, gas, gasLimit, value } = {},
    ...args
  ) {
    const txConfig = this.extractTxConfig({ from, gas, gasLimit, value });
    const txIndex = Contract.methods[method].cacheSend(...args, txConfig);
    return txIndex;
  },
  addBeneficiaries(from, contract, beneficiaries, dispositions) {
    if (
      beneficiaries.length < 1 ||
      beneficiaries.length > CONTRACT_ARRAYs_LENGTH
    ) {
      throw new Error(
        `Beneficiaries must be at least one and at most ten: ${beneficiaries.length} found`
      );
    }
    if (dispositions.length < 1 || dispositions.length > 10) {
      throw new Error(
        `Dispositions must be at least one and at most ten: ${dispositions.length} found`
      );
    }
    if (beneficiaries.length != dispositions.length) {
      throw new Error(`Beneficiaries and Dispositions do not match`);
    }
    const txIndex = contract.methods.updateBeneficiaries.cacheSend(
      beneficiaries,
      dispositions,
      {
        from
      }
    );
    return txIndex;
  },
  removeBeneficiaries(from, contract, beneficiaries) {
    if (
      beneficiaries.length < 1 ||
      beneficiaries.length > CONTRACT_ARRAYs_LENGTH
    ) {
      throw new Error(
        `Beneficiaries must be at least one and at most ten: ${beneficiaries.length} found`
      );
    }
    const txIndex = contract.methods.removeBeneficiaries.cacheSend(
      beneficiaries,
      {
        from
      }
    );
    return txIndex;
  },
  getBeneficiaryFromEvent(event, store) {
    if (event.event !== BENEFICIARY_EVENT) {
      return;
    }
    const address = event.returnValues.beneficiary;
    const disposition = event.returnValues.disposition;
    const found = store.find(item => item.address === address);
    const foundIndex = store.findIndex(item => item.address === address);
    if (disposition == 0 && found) {
      return store.splice(foundIndex, 1);
    } else if (found && disposition !== found.disposition) {
      return (store[foundIndex].disposition = disposition);
    } else if (!found) {
      store.push({
        address,
        disposition
      });
    }
  },
  isValidAddress(web3, address) {
    return web3.utils.isAddress(address);
  },
  parseEtherValue(number = 0, inbound) {
    number = number.toNumber ? number.toNumber() : Number(number);
    if (inbound) {
      return number / ETHER;
    } else {
      return number * ETHER;
    }
  },
  postponeDisbursement(from, contract) {
    if (!from || !this.isValidAddress(contract.web3, from)) {
      throw new Error(`Sender (From) address is invalid or not set`);
    }
    const txIndex = contract.methods.postpone.cacheSend({
      from
    });
    return txIndex;
  },
  truffleSubscribeOnceEvent(
    Contract,
    event,
    fromBlock,
    onData,
    filter = {},
    topics = []
  ) {
    const subObject = { fromBlock, filter };

    if (topics.length > 0) {
      subObject.topics = topics;
    }

    const tEvent = Contract.events[event](subObject);
    tEvent.on("data", async data => {
      onData(data);
      await this.unsubscribeEvent(tEvent);
    });
    return tEvent;
  },
  // subscribeOnceEvent ( Contract, event, fromBlock, onData, filter={}, topics=[]) {
  //     return Contract.once(
  //         event, {
  //             fromBlock,
  //             filter,
  //             topics
  //         },
  //         onData
  //     );
  // },
  subscribeEvents(Contract, event, fromBlock, filter = {}, topics = []) {
    const options = {
      fromBlock,
      filter
    };
    if (topics && topics.length > 0) {
      options.push(topics);
    }
    return Contract.events[event](options);
  },
  getNetwork(id) {
    return Networks[id] || "Unknown";
  },
  awaitTransactionConfirmation(transactions, idx, notifier, count = 0) {
    const tx = transactions[idx];
    if (tx.status === "pending") {
      if (count === 0) {
        notification["info"]({
          message: "Transaction created",
          description: `${idx} created, Awaiting confirmation`
        });
      }
      setTimeout(
        () =>
          this.awaitTransactionConfirmation(
            transactions,
            idx,
            notifier,
            ++count
          ),
        2500
      );
    } else if (tx.status === "success") {
      notification["success"]({
        message: "Transaction confirmed",
        description: `${idx} successfully confirmed`
      });
    }
  },
  // watchWeb3Addresses (web3, ) {
  //     web3
  // },
  setupListeners(
    event,
    { onTransactionHash, onReceipt, onData, onChanged, onError }
  ) {
    if (onError) {
      event.on("error", onError);
    }
    if (onTransactionHash) {
      event.on("transactionHash", onTransactionHash);
    }
    if (onReceipt) {
      event.on("receipt", onReceipt);
    }
    if (onChanged) {
      event.on("changed", onChanged);
    }
    if (onData) {
      event.on("data", onData);
    }
  }
};

export { web3Scripts, CONTRACT_ARRAYs_LENGTH, BENEFICIARY_EVENT, NULL_ADDRESS };
