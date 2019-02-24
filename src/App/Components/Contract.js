import React, { Component } from 'react';
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";
import Beneficiaries from "./Beneficiaries";
import NetworkComponent from "./NetworkComponent";
import Postpone from "./Postpone";

import { ContractEvents, ContractTypes, Explorers,Timers } from '../../Config';
import { web3Scripts } from '../../Scripts';

import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Layout from 'antd/lib/layout';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';
import Spin from 'antd/lib/spin';

import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/layout/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';
import 'antd/lib/spin/style';

const CONTRACT_EVENTS = ContractEvents;

class Contract extends Component {
    constructor (props) {
        super(props);

        this.fetchDeploymentReceipt = this.fetchDeploymentReceipt.bind(this);
        this.resolveContractDeploymentReceipt = this.resolveContractDeploymentReceipt.bind(this);
    }

    state= {
        contract: {},
        balanceWatcher: null,
        deploymentReceipt: null,
        fetchingReceipt: false,
        loadingContracts: false
    }

    get isContractOwner () {
        return (this.state.contract && this.state.contract.owner) === this.props.selectedAccount;
    }

    get shouldHaveBeneficiaries () {
        const hasBeneficiaries = this.state.contract.contractType ? 
            [ ContractTypes[0], ContractTypes[2] ].some( type => type.toLowerCase() === this.state.contract.contractType.toLowerCase()) :
            false;
        return hasBeneficiaries;
    }

    stopWatchingBalance () {
        if (this.state.balanceWatcher) {
            clearTimeout(this.state.balanceWatcher);
        }
        this.state.balanceWatcher = null;
    }

    watchContractBalance () {
        this.stopWatchingBalance();
        if (!this._mounted) {
            return;
        }
        const balanceWatcher = setTimeout(async () => {
            const balance = await this.getContractBalance(this.state.contract.address);
            if (this._mounted && balance !== this.state.contract.balance) {
                this.setState({ contract: { balance: balance }}); 
            }
            this.watchContractBalance();
        }, Timers.balanceTimeout);
        this.setState({
            balanceWatcher
        });
    }

    getFromContractLists (address) {
        return this.props.contractsList.length > 0 && this.props.contractsList.find((deployEvent) => address === deployEvent.returnValues.contractAddress);
    }

    deploymentReceiptExists () {
        return !!this.state.deploymentReceipt;
    }

    componentDidUpdate() {
        if (this.state.contract.address !== this.props.match.params.contractAddress) {
            this.state.contract = {};
            this.loadContractData();
        }
    }

    componentWillUnmount () {
        this._mounted = false;
        this.stopWatchingBalance();
    }

    async loadContractData () {
        if (this.state.loadingContracts || !this._mounted) {
            return;
        }
        this.setState({
            loadingContracts: true
        });
        try{
            const { contractAddress } = this.props.match.params;

            this.setState({
                contract: {
                    address: contractAddress,
                    blockNumber: await this.getContractDeploymentBlock(contractAddress),
                    contractType: await this.getContractType(contractAddress),
                    transactionHash: await this.getContractDeploymentHash(contractAddress),
                    balance: await this.getContractBalance(contractAddress),
                    owner: await this.getContractOwner(contractAddress),
                    disbursed: false
                },
                loadingContracts: false
            }, () => {
                this.loadDrizzleContract();
                this.watchContractBalance();
            });
        } catch (err) {
            notification['error']({
                duration: 0,
                message: 'Failled to load contract',
                description: err.message || err
            });
        }
    }

    async loadDrizzleContract () {
        if (!this._mounted) {
            return;
        }
        const type = this.state.contract.contractType.toLowerCase().charAt(0).toUpperCase() + this.state.contract.contractType.slice(1);
        if (!this.props.drizzle.contracts[this.state.contract.address]) {
            await web3Scripts.loadDrizzleContractWithContractType(this.props.drizzle, type, this.state.contract.address, CONTRACT_EVENTS[type]);
        }

        const disbursed = this.shouldHaveBeneficiaries ? await web3Scripts.isContractDisbursed(this.props.drizzle.contracts[this.state.contract.address]) : false;
        this.setState({
            contract: Object.assign({}, this.state.contract, {disbursed: disbursed })
        })
    }

    async fetchDeploymentReceipt (contractAddress) {
        if (!this._mounted) {
            return false;
        }
        if (this.deploymentReceiptExists() || this.state.fetchingReceipt) {
            return true;
        }
        this.setState({ fetchingReceipt: true });
        const { Deployer } = this.props.drizzle.contracts;
        const receipt = await web3Scripts.getDeploymentReceipt(Deployer, this.props.networkId, contractAddress);
        return this.setState({ deploymentReceipt: receipt, fetchingReceipt: false }, () => true);
    }

    async resolveContractDeploymentReceipt (address) {
        const deployReceipt = this.getFromContractLists(address);
        if (!deployReceipt && !this.deploymentReceiptExists()) {
            await this.fetchDeploymentReceipt(address);
        }
        return deployReceipt || this.state.deploymentReceipt;
    }

    async getContractBalance (address) {
        const balance = await web3Scripts.getAddressBalance(this.props.drizzle.web3, address);
        return balance.toNumber ? balance.toNumber() : (Number(balance) || 0);
    }

    async getContractOwner (address) {
        const owner = await web3Scripts.getContractOwner(this.props.drizzle.web3, address);
        return owner;
    }

    async getContractType (address) {
        const receipt =  await this.resolveContractDeploymentReceipt(address);
        return receipt && receipt.returnValues.contractType;
    }

    async getContractDeploymentBlock(address) {
        const receipt = await this.resolveContractDeploymentReceipt(address);
        return receipt && receipt.blockNumber;
    }

    async getContractDeploymentHash(address) {
        const receipt = await this.resolveContractDeploymentReceipt(address);
        return receipt && receipt.transactionHash;
    }

    async componentWillMount () {
        this._mounted = true;
        await this.loadContractData();
    }

    render () {
        const { contract } = this.state;
        return (
            <div>
                { this.state.loadingContracts &&
                    <Layout>
                        <Spin size="large" />
                    </Layout>
                }
                { !this.state.loadingContracts &&
                    <Layout>
                        <Row gutter={0} style={{ margin: '0 0 24px' }}>
                            <Col span={24}>
                                <h2>Contracts details</h2>
                                <h4 className='word-wrapped'>
                                    (<a target='_blank' href={`${Explorers[this.props.networkId]}/address/${this.props.match.params.contractAddress}`}>
                                        { this.props.match.params.contractAddress }
                                    </a>)
                                </h4>
                                <Divider style={{ height: '1px', margin: '0' }} />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p className='word-wrapped'>
                                    <b>Type: </b>{ contract.contractType }
                                </p>
                                <p className='word-wrapped'>
                                    <b>Block: </b>{ contract.blockNumber }
                                </p>
                                <p className='word-wrapped'>
                                    <b>Tx Hash: </b><a target='_blank' href={`${Explorers[this.props.networkId]}/tx/${contract.transactionHash}`}>{ contract.transactionHash }</a>
                                </p>
                                <p className='word-wrapped'>
                                    <b>Balance: </b>{ web3Scripts.parseEtherValue(contract.balance, true) } Eth
                                </p>
                            </Col>
                        </Row>
                        { this.shouldHaveBeneficiaries && this.props.drizzle.contracts[this.state.contract.address] &&
                            <Postpone
                                Contract={this.props.drizzle.contracts[this.state.contract.address]}
                                selectedAccount={this.props.selectedAccount}
                                isOwner={this.isContractOwner}
                                disbursed={this.state.contract.disbursed}
                                disbursing={this.state.contract.disbursing}
                                transactionStack={this.props.transactionStack}
                                transactions={this.props.transactions}
                                />
                        }
                        { this.shouldHaveBeneficiaries &&
                            <Beneficiaries
                                selectedAccount={ this.props.selectedAccount }
                                contractAddress={ this.state.contract.address }
                                networkId={ this.props.networkId }
                                contractBalance={ contract.balance }
                                disbursed={ this.state.contract.disbursed }
                                isOwner={ this.isContractOwner }
                                drizzle={ this.props.drizzle }
                                transactionStack={this.props.transactionStack}
                                transactions={this.props.transactions}
                            />
                        }
                    </Layout>
                }
            </div>
        )
    }

}

Contract.propTypes = {
    contractsList: PropTypes.array,
    drizzle: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    networkId: PropTypes.number,
    selectedAccount: PropTypes.string,
    transactionStack: PropTypes.array,
    transactions: PropTypes.object
}

export default ErrorBoundary(NetworkComponent(Contract));