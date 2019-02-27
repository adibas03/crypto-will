import React, { Component } from 'react';
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";
import NetworkComponent from "./NetworkComponent";
import DrizzleTxResolver from "./DrizzleTxResolver";

import { web3Scripts, CONTRACT_ARRAYs_LENGTH, BENEFICIARY_EVENT, NULL_ADDRESS } from '../../Scripts';
import { FormHelp } from '../../Config';

import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Layout from 'antd/lib/layout';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';
import Spin from 'antd/lib/spin';

import 'antd/lib/button/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/form/style';
import 'antd/lib/icon/style';
import 'antd/lib/input/style';
import 'antd/lib/layout/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';
import 'antd/lib/spin/style';

const { Item } = Form;

class Beneficiaries extends DrizzleTxResolver {

    constructor (props) {
        super(props);

        this.addBeneficiary = this.addBeneficiary.bind(this);
        this.removeBeneficiary = this.removeBeneficiary.bind(this);
        this.calcValue = this.calcValue.bind(this);
        this.loadBeneficiaries = this.loadBeneficiaries.bind(this);
        this.storeToNetwork = this.storeToNetwork.bind(this);
        this.validateStatus = this.validateStatus.bind(this);
        this.validateBeneficiary = this.validateBeneficiary.bind(this);
    }

    state = {
        beneficiaries: [''],
        contractBeneficiaries: [],
        dispositions: [''],
        loading: false,
        storingToContract: false
    }

    get contractBeneficiaries () {
        const beneficiaries = [];
        this.state.contractBeneficiaries.forEach((contractBeneficiary) => {
            beneficiaries.push(contractBeneficiary.address);
        });
        return beneficiaries;
    }

    get contractDispositions () {
        const dispositions = [];
        this.state.contractBeneficiaries.forEach((contractBeneficiary) => {
            dispositions.push(contractBeneficiary.disposition);
        });
        return dispositions;
        
    }

    get beneficiariesToAdd () {
        const toAdd = [];
        const contractBeneficiaries = this.contractBeneficiaries;
        const contractDispositions = this.contractDispositions;
        this.state.beneficiaries.map((beneficiary, index) => {
            const foundIndex = contractBeneficiaries.findIndex(one => one.toLowerCase() === beneficiary.toLowerCase());
            if (foundIndex < 0 || contractDispositions[foundIndex] != this.state.dispositions[index]) {
                toAdd.push(beneficiary);
            }
        });
        return toAdd;
    }

    get beneficiariesToRemove () {
        const toRemove = [];
        const contractBeneficiaries = this.contractBeneficiaries;
        contractBeneficiaries.map((beneficiary) => {
            const foundIndex = this.state.beneficiaries.findIndex(one => one.toLowerCase() === beneficiary.toLowerCase());
            if (foundIndex < 0) {
                toRemove.push(beneficiary);
            }
        });
        return toRemove;
    }

    get shouldUpdate() {
        const removeBeneficiaries = this.beneficiariesToRemove && this.beneficiariesToRemove.length > 0 && !this.beneficiariesToRemove.some(beneficiary => !web3Scripts.isValidAddress(this.props.drizzle.web3, beneficiary));
        let addBeneficiaries = this.beneficiariesToAdd && this.beneficiariesToAdd.length > 0 && !this.beneficiariesToAdd.some(beneficiary => !web3Scripts.isValidAddress(this.props.drizzle.web3, beneficiary));
        if (this.beneficiariesToAdd.length > 0) {
            const toAddDispositions = this.beneficiariesToAdd.map(bene => this.fetchBeneficiaryDisposition(bene)).map(disposition => disposition || 0);
            addBeneficiaries = addBeneficiaries && !toAddDispositions.some((disp, ind) => !this.validateDisposition(ind));
        }
        return this.props.isOwner && (removeBeneficiaries || addBeneficiaries);
    }

    get canUpdate () {
        return !this.state.loading && !this.state.storingToContract && !this.props.disbursed && this.shouldUpdate;
    }

    get getTotalRatio () {
        let total =  0;
        if (this.state.dispositions && this.state.dispositions.length > 0) {
            this.state.dispositions.map(bene => {
                total += Number(bene)
            });
        }
        return total;
    }

    async loadBeneficiaries () {
        this.setState({
            loading: true
        });
        const beneficiaries = await web3Scripts.fetchBeneficiaries(this.props.drizzle, this.props.networkId, this.props.contractAddress);
        this.setState({
            contractBeneficiaries: beneficiaries,
            loading: false
        }, () => { 
            this.updateBeneficiariesFromContract();
            this.watchForBeneficiaries();
        });
    }

    async storeToNetwork () {
        const addTx = [];
        const removeTx = [];
        
        this.setState({
            storingToContract: true
        })

        const addLength = Math.ceil(this.beneficiariesToAdd.length / CONTRACT_ARRAYs_LENGTH);
        const remLength = Math.ceil(this.beneficiariesToRemove.length / CONTRACT_ARRAYs_LENGTH);
        
        notification['info']({
            message: 'Sending Transactions',
            description: `You will need to approve a total of ${addLength + remLength} transaction(s)`
        });

        if (this.beneficiariesToAdd && this.beneficiariesToAdd.length > 0) {
            for (let i =0; i<addLength; i++) {
                let start = (i*CONTRACT_ARRAYs_LENGTH);
                let batchBeneficiaries = this.beneficiariesToAdd.slice(start , start+CONTRACT_ARRAYs_LENGTH);
                let toAdd = Array(10).fill(NULL_ADDRESS).map((empty, index) => batchBeneficiaries[index] || empty);
                let toAddDispositions = toAdd.map(bene => this.fetchBeneficiaryDisposition(bene)).map(disposition => disposition || 0);
                addTx.push(web3Scripts.addBeneficiaries(this.props.selectedAccount, this.props.drizzle.contracts[this.props.contractAddress], toAdd, toAddDispositions));
            }
        }
        if (this.beneficiariesToRemove && this.beneficiariesToRemove.length > 0) {
            for (let i =0; i<remLength; i++) {
                let start = (i*CONTRACT_ARRAYs_LENGTH);
                let batchRemoveBeneficiaries = this.beneficiariesToRemove.slice(start, start+CONTRACT_ARRAYs_LENGTH);
                let toRemove = Array(10).fill(NULL_ADDRESS).map((empty, index ) => batchRemoveBeneficiaries[index] || empty);
                removeTx.push(web3Scripts.removeBeneficiaries(this.props.selectedAccount, this.props.drizzle.contracts[this.props.contractAddress], toRemove));
            }
        }
        this.resolveTransactions(addTx.concat(removeTx));
    }

    async resolveTransactions (transactionStack) {
        transactionStack.forEach((txStack, ind) => {
            setTimeout(() => this.watchTxsStack(txStack, transactionStack.length === (ind+1)), 300);
        })
    }

    async watchTxsStack (txStack, lastStack) {
        const tx = await this.watchTxStack(txStack);
        if (lastStack) {
            this.allTransactionsSent();
        }

        this.watchTransaction(tx, {
            onError: (e) => {
                notification['error']({
                    message: 'Transaction failed',
                    description: e.message || e
                });
            },
            onChanged: (txHash) => {
                notification['success']({
                    message: 'Transaction sent',
                    description: txHash
                });
            },
            onReceipt: (receipt) => {
                notification['success']({
                    message: 'Transaction confirmed',
                    description: `HASH: ${tx}, BLOCK: ${receipt.blockNumber}`
                });
                this.loadBeneficiaries();
            }
        });
    }

    allTransactionsSent () {
        this.setState({
            storingToContract: false
        });
    }

    async watchForBeneficiaries () {
        const contract = this.props.drizzle.contracts[this.props.contractAddress];
        const fromBlock = await web3Scripts.getBlockNumber(this.props.drizzle.web3);
        const beneficiaryWatcher = web3Scripts.subscribeEvents(contract, BENEFICIARY_EVENT, fromBlock );
        web3Scripts.setupListeners( beneficiaryWatcher, {
            onData: (data) => {
                const contractBeneficiaries = this.state.contractBeneficiaries;
                web3Scripts.getBeneficiaryFromEvent(data, contractBeneficiaries);

                this.setState({
                    contractBeneficiaries
                }, ()=> {
                    this.updateBeneficiariesFromContract();
                })
            }
        })

        this.setState({
            beneficiaryWatcher
        });
    }

    async stopBeneficiariesWatcher () {
        if (this.state.beneficiaryWatcher) {
            await web3Scripts.unsubscribeEvent(this.state.beneficiaryWatcher);
        }
    }

    updateBeneficiariesFromContract () {
        const contractBeneficiaries = this.state.contractBeneficiaries;
        const beneficiaries = this.state.beneficiaries || [];
        const dispositions = this.state.dispositions || [];

        contractBeneficiaries.map((beneficiary, index) => {
            if (beneficiaries.includes(beneficiary.address)) {
                const pos = beneficiaries.indexOf(beneficiary.address);
                // delete(beneficiaries[pos])
                // delete(dispositions[pos])
                beneficiaries.splice(pos, 1);
                dispositions.splice(pos, 1);
            }
            beneficiaries.splice(index, 0, beneficiary.address);
            dispositions.splice(index, 0, beneficiary.disposition);
        });

        for (let b=beneficiaries.length-1; b>0; b--) {
            if (!beneficiaries[b]) {
                beneficiaries.splice(b, 1);
                dispositions.splice(b, 1);
            }
        }

        this.setState({
            beneficiaries,
            dispositions
        });
    }

    fetchBeneficiaryDisposition (beneficiary) {
        const index = this.state.beneficiaries.findIndex(one => one === beneficiary);
        return this.state.dispositions[index];
    }

    calcValue (ratio) {
        return ((this.props.contractBalance * ratio) / this.getTotalRatio) || 0;
    }

    updateArray (array, index, value) {
        array[index] = value;
        return array;
    }

    validateBeneficiary (index) {
        if (!web3Scripts.isValidAddress(this.props.drizzle.web3 ,this.state.beneficiaries[index]) || this.state.beneficiaries[index].toLowerCase() === this.props.selectedAccount.toLowerCase()) {
            return false;
        }
        return !this.state.beneficiaries.some((one, oneIndex) => one === this.state.beneficiaries[index] && index !== oneIndex);
    }

    validateDisposition (index) {
        const reg = new RegExp(/\d+/);
        return reg.test(this.state.dispositions[index]) && Number(this.state.dispositions[index]) > 0;
    }

    addBeneficiary () {
        if (!this.state.beneficiaries.includes('')) {
            this.setState({
                beneficiaries: this.state.beneficiaries.concat(['']),
                dispositions: this.state.dispositions.concat([''])
            });
        }
    }

    validateStatus (field, index) {
        if (field === 'beneficiaries') {
            return this.validateBeneficiary(index) ? 'success' : 'error';
        } else if (field === 'dispositions') {
            return this.validateDisposition(index) ? 'success' : 'error';
        }
    }

    removeBeneficiary = (index) => () => {
        const beneficiaries = this.state.beneficiaries;
        const dispositions = this.state.dispositions;
        // delete(beneficiaries[index]);
        // delete(dispositions[index]);
        beneficiaries.splice(index, 1);
        dispositions.splice(index, 1);

        this.setState({
            beneficiaries,
            dispositions
        });
    }

    handleChange = (field, index) => (e) => {
        if (typeof index === 'undefined') {
            this.setState({ [field]: typeof e === 'string' ? e : e.target.value });
        } else {
            this.setState({ [field]: typeof e === 'string' ? this.updateArray(this.state[field], index, e) : this.updateArray(this.state[field], index, e.target.value) });
        }
    }

    async componentWillMount () {
        await this.loadBeneficiaries ();
    }

    async componentWillUnmount () {
        super.componentWillUnmount();
        await this.stopBeneficiariesWatcher();
    }

    render () {
        return (
            <Layout>
                <Row gutter={0} style={{ margin: '48px 0 24px' }}>
                    <Col span={24}>
                        <h3>Benefeciaries</h3>
                        <Divider style={{ height: '1px', margin: '0' }} />
                    </Col>
                </Row>
                { this.state.loading &&
                    <Layout>
                        <Spin size="large" />
                    </Layout>
                }
                { !this.state.loading &&
                    <Form onSubmit={(e) => e.preventDefault()} >
                        <Row gutter={16}>
                            <Col span={15}>
                                <h5>
                                    <span title={FormHelp['newBeneficiary']} style={{ cursor: 'help' }}>
                                        Address
                                    </span>
                                </h5>
                            </Col>
                            <Col span={3}>
                                <h5>
                                    <span title={FormHelp['newBeneficiaryDisposition']} style={{ cursor: 'help' }}>
                                        Ratio
                                    </span>
                                </h5>
                            </Col>
                            <Col span={4}>
                                <h5>
                                    <span title={FormHelp['newBeneficiaryDispositionValue']} style={{ cursor: 'help' }}>
                                        Value (Eth)
                                    </span>
                                </h5>
                            </Col>
                            <Col span={2}>
                            </Col>
                            <Col span={24}>
                                <Divider />
                            </Col>
                        </Row>
                        {
                            this.state.beneficiaries.map( (one, index) => 
                                <Row gutter={16} key={index}>
                                    <Col span={15}>
                                        <Item validateStatus={this.state.beneficiaries[index] && this.validateStatus('beneficiaries', index)} required>
                                            <Input onChange={this.handleChange('beneficiaries', index)} value={one} />
                                        </Item>
                                    </Col>
                                    <Col span={3}>
                                        <Item validateStatus={this.state.dispositions[index] && this.validateStatus('dispositions', index)} required>
                                            <Input onChange={this.handleChange('dispositions', index)} type='number' min={1} value={this.state.dispositions[index]} />
                                        </Item>
                                    </Col>
                                    <Col span={4}>
                                        <Item >
                                            <Input disabled={true} value={ web3Scripts.parseEtherValue(this.calcValue(this.state.dispositions[index]), true) } />
                                        </Item>
                                    </Col>
                                    <Col span={2}>
                                        <Button style={{ marginTop: '4px' }} icon='minus-square' title={FormHelp.removeBeneficiary} onClick={this.removeBeneficiary(index)} />
                                    </Col>
                                </Row>
                            )
                        }
                        <Row>
                            <Col span={2}>
                                <Button style={{ marginTop: '4px' }} icon='plus-square' disabled={this.props.disbursed} title={FormHelp.addNewBeneficiary} onClick={this.addBeneficiary} />
                            </Col>
                            <Col offset={18} span={4}>
                                <Button type='primary' style={{ marginTop: '4px' }} icon='upload' disabled={!this.canUpdate} title={FormHelp.updateContract} onClick={this.storeToNetwork} >
                                    Save
                                </Button>
                            </Col>
                        </Row>
                        {/* <Row gutter={16}>
                            <Col span={15}>
                                <Item hasFeedback={true} validateStatus={this.validateStatus('newBeneficiary')} required>
                                    <Input onChange={this.handleChange('newBeneficiary')} value={this.state.newBeneficiary} />
                                </Item>
                            </Col>
                            <Col span={3}>
                                <Item hasFeedback={true} validateStatus={this.validateStatus('newBeneficiaryDisposition')} required>
                                    <Input onChange={this.handleChange('newBeneficiaryDisposition')} type='number' min={1} value={this.state.newBeneficiaryDisposition} />
                                </Item>
                            </Col>
                            <Col span={4}>
                                <Item >
                                    <Input disabled={true} value={ web3Scripts.parseEtherValue(this.calcValue(this.state.newBeneficiaryDisposition), true) } />
                                </Item>
                            </Col>
                            <Col span={2}>
                                <Button style={{ marginTop: '4px' }} icon='plus-square' disabled={!this.newBeneficiaryCorrect} title={FormHelp.addNewBeneficiary} onClick={this.addBeneficiary()} />
                            </Col>
                        </Row> */}
                    </Form>
                }
            </Layout>
        )
    }

}

Beneficiaries.propTypes = {
    drizzle: PropTypes.object.isRequired,
    isOwner: PropTypes.bool.isRequired,
    contractAddress: PropTypes.string.isRequired,
    contractBalance: PropTypes.number.isRequired,
    disbursed: PropTypes.bool.isRequired,
    networkId: PropTypes.number.isRequired,
    selectedAccount: PropTypes.string,
    transactionStack: PropTypes.array,
    transactions: PropTypes.object
}

export default ErrorBoundary(NetworkComponent(Beneficiaries));