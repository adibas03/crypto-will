import { Networks } from '../Config';
import Ownable from '../../build/contracts/Ownable.json';
import Will from '../../build/contracts/Will.json';

const ETHER = 10**18;

const web3Scripts = {
    async getNetworkId (web3) {
        const getID = web3.version.getNetwork || web3.eth.net.getId;
        return new Promise((resolve, reject) => {
            getID(function(err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            })
        })
    },
    async getAddressBalance (address) {
        return new Promise((resolve, reject) => {
            web3.eth.getBalance(address, function(err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            })
        })
    },
    async getContractOwner (web3, address) {
        const abi = Ownable.abi;
        const contract = await new web3.eth.Contract(abi, address);
        const owner = await contract.methods.owner().call();
        return owner;
    },
    async deployContract ({ Deployer, fromAddress, type, args, onTransactionHash, onReceipt }) {
        if (!Deployer) {
            throw('Deployer instance not available');
        }
        let idx;
        try {
            switch (type) {
                case 'Will':
                    idx = Deployer.methods.deployWill(args['waitTime']).send(
                        {
                            from: fromAddress
                        });
                    break;
                case 'Wallet':
                    idx = Deployer.methods.deployWallet().send({
                        from: fromAddress
                    });
                    break;
                case 'WillWallet':
                    idx = Deployer.methods.deployWillWallet(args['waitTime']).send({
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
    async requireFromBlock (Contract, network) {
        const fromBlock = await this.getDeployedRBlock(Contract, network);
        if (fromBlock === null) {
            throw new Error('Contract not deployed on network');
        }
        return fromBlock;
    },
    async getDeploymentReceipt (Deployer, network, contractAddress) {
        const fromBlock = await this.requireFromBlock(Deployer, network);
        return new Promise ((resolve, reject) => {
            this.truffleSubscribeOnceEvent(
                Deployer,
                'ContractDeployed',
                fromBlock,
                (event) => {
                    resolve(event);
                },
                {
                    contractAddress
                }
                )
        });
    },
    async fetchDeployments (Deployer, network, filter, { onData, onChanged, onError }) {
        const fromBlock = await this.requireFromBlock(Deployer, network);
        const event = this.subscribeEvents(
            Deployer,
            'ContractDeployed',
            fromBlock,
            filter
        );
        this.setupListeners(event, { onData, onChanged, onError });
        return event;
    },
    async getDeployedRBlock (Contract, network) {
        const receipt = await this.getDeployedReceipt(Contract, network);
        return (receipt && receipt.blockNumber) || null;
    },
    async getDeployedReceipt (Contract, network) {
        const txHash = Contract.contractArtifact.networks[network].transactionHash;
        const receipt = await Contract.web3.eth.getTransactionReceipt(txHash);
        return receipt;
    },
    async fetchBeneficiaries (drizzle, newtworkId, address) {
        if (!drizzle.contracts[address]) {
            await this.loadDrizzleContract(drizzle, address, Will.abi, ['BeneficiaryUpdated', 'BeneficiarySettled']);
        }
        const contract = drizzle.contracts[address];
        const receipt = await this.getDeploymentReceipt(drizzle.contracts.Deployer, newtworkId, address);
        const events = this.subscribeEvents(contract, 'allEvents', receipt.blockNumber);
        this.setupListeners(events, {
            onData: (err, res) => {
            }
        });
        // const beneficiaries = await contract.methods.beneficiaries().call();
        // console.log(beneficiaries);
        return [];
    },
    async addBeneficiaries (contract) {
    },
    async removeBeneficiaries () {
    },
    async loadDrizzleContract (drizzle, address, abi, events) {
        await drizzle.addContract({
            contractName: address,
            web3Contract: await new drizzle.web3.eth.Contract(abi, address)
        }, events);
    },
    // async fetchPastEvents ( Contract, event, fromBlock, filter={}, topics=[]) {
    //     return Contract.getPastEvents(
    //         event,
    //         fromBlock,
    //         filter,
    //         topics
    //     );
    // },
    async unsubscribeEvent (event) {
        return await event.unsubscribe();
    },
    parseEtherValue (number = 0, inbound) {
        number = number.toNumber ? number.toNumber() : Number(number);
        if (inbound) {
            return number/ETHER;
        } else {
            return number * ETHER;
        }
    },
    truffleSubscribeOnceEvent (Contract, event, fromBlock, onData, filter={}, topics=[]) {
        const subObject = { fromBlock, filter };

        if (topics.length > 0) {
            subObject.topics = topics;
        }

        const tEvent = Contract.events[event](subObject);
        tEvent.on('data', async (data) => {
            onData(data);
            await this.unsubscribeEvent(tEvent);
        })
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
    subscribeEvents ( Contract, event, fromBlock, filter={}, topics=[]) {
        return Contract.events[event]({
            fromBlock,
            filter,
            topics
        });
    },
    getNetwork (id) {
        return Networks[id] || 'Unknown';
    },
    awaitTransactionConfirmation (transactions, idx, notifier, count=0) {
        const tx = transactions[idx];
        if (tx.status === 'pending') {
            if (count === 0) {
                notification['info']({
                    message: 'Transaction created',
                    description: `${idx} created, Awaiting confirmation`
                });
            }
            setTimeout(() => this.awaitTransactionConfirmation(transactions, idx, notifier, ++count), 2500);
        } else if (tx.status === 'success') {
            notification['success']({
                message: 'Transaction confirmed',
                description: `${idx} successfully confirmed`
            });
        }
    },
    // watchWeb3Addresses (web3, ) {
    //     web3
    // },
    setupListeners (event, { onTransactionHash, onReceipt, onData, onChanged, onError }) {
        if (onError) {
            event
            .on('error', onError);
        }
        if (onTransactionHash) {
            event
            .on('transactionHash', onTransactionHash);
        }
        if (onReceipt) {
            event
            .on('receipt', onReceipt);
        }
        if (onChanged) {
            event
            .on('changed', onChanged);
        }
        if (onData) {
            event
            .on('data', onData);
        }
    }
}

export { web3Scripts };