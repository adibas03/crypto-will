import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from "./ErrorBoundary";
import DrizzleTxResolver from "./DrizzleTxResolver";

import { FormHelp } from '../../Config';
import { web3Scripts } from '../../Scripts';

import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/input';
import Input from 'antd/lib/input';
import Layout from 'antd/lib/layout';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';
import Select from 'antd/lib/select';

import 'antd/lib/button/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/form/style';
import 'antd/lib/icon/style';
import 'antd/lib/input/style';
import 'antd/lib/layout/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';
import 'antd/lib/select/style';

const { Item } = Form;
const { Option } = Select;

const MILLISECONDS = 1000;

class Wallet extends DrizzleTxResolver {
    constructor (props) {
        super(props);
        this.state = {
            address: '',
            amount: ''
        };

        this.sendTransaction = this.sendTransaction.bind(this);
        this.loadTimingData();
    }

    get dueDate () {
        return (Number(this.state.lastInteraction) + Number(this.state.waitTime)); 
    }

    humanReadableTime (timestamp, duration = false) {
        timestamp = timestamp || 0;
        return new Date(timestamp * MILLISECONDS).toString();
    }

    canPostpone () {
        return this.props.isOwner && !this.props.disbursed && Math.floor(new Date().getTime()/1000) > Number(this.state.lastInteraction);
    }

    handleChange = (field) => (e) => {
        this.setState({ [field]: typeof e === 'string' ? e : e.target.value });
    }

    validateAddress (address) {
        return web3Scripts.isValidAddress(this.props.Contract.web3, address);
    }

    validateStatus (field) {
        if (!this.state[field]) return 'success';
        if (field === 'address') {
            return this.validateAddress(this.state[field]) ? 'success' : 'error';
        } else if (field === 'amount') {
            return Number(this.state[field]) > 0 && this.props.contractBalance > web3Scripts.parseEtherValue(this.state[field]) ? 'success' : 'error';
        }
    }

    validateForm () {
        return Object.keys(this.state).every( val => {
           return this.state[val] && this.validateStatus(val) === 'success';
        });
    }

    async loadTimingData () {
        // const disbursing = await web3Scripts.isContractDisbursing(this.props.Contract);
        // const lastInteraction = await web3Scripts.makeContractCall(this.props.Contract, 'lastInteraction');
        // const waitTime = await web3Scripts.makeContractCall(this.props.Contract, 'waitingTime');

        // this.setState({
        //     disbursing,
        //     lastInteraction,
        //     waitTime
        // });
    }

    async sendTransaction (e) {
        e.preventDefault();
        try {
            this.setState({ sendingTx: true });
            const stack = web3Scripts.sendTransaction(this.props.Contract, 'transfer', { from: this.props.selectedAccount }, this.state.address, web3Scripts.parseEtherValue(this.state.amount));
            const tx = await this.watchTxStack(stack);

            this.watchTransaction(tx, {
                onError: (e) => {
                    notification['error']({
                        message: 'Transaction failed',
                        description: e.message || e
                    });
                    this.setState({ sendingTx: false });
                },
                onChanged: (txHash) => {
                    notification['success']({
                        message: 'Transaction sent',
                        description: txHash
                    });
                    this.setState({ sendingTx: false });
                },
                onReceipt: (receipt) => {
                    notification['success']({
                        message: 'Transaction confirmed',
                        description: `HASH: ${tx}, BLOCK: ${receipt.blockNumber}`
                    });
                }
            });
        } catch (e) {
            notification['error']({
                message: 'Transaction failed',
                description: e.message || e
            });
            this.setState({ sendingTx: false });
        }
    }
    
    render () {
        return (
            <Row style={{ margin: '48px 0 24px' }}>
                <Col span={24} style={{ margin: '0 0 24px' }}>
                    <h3>Wallet</h3>
                    <Divider style={{ height: '1px', margin: '0' }} />
                </Col>
                <Form onSubmit={this.sendTransaction} style={{ margin: '0 0 12x' }}>
                    <Row gutter={16} >
                        <Col span={17}>
                            <Item label='Address' help={FormHelp.recipientAddress} validateStatus={this.validateStatus('address')} required>
                                <Input onChange={this.handleChange('address')} value={this.state.address} />
                            </Item>
                        </Col>
                        <Col span={7}>
                            <Item label='Amount' help={FormHelp.recipientValue} validateStatus={this.validateStatus('amount')} required>
                                <Input onChange={this.handleChange('amount')} value={this.state.amount} />
                            </Item>
                        </Col>
                    </Row>
                    <Row >
                        <Col offset={20} span={4}>
                            <Button type='primary' htmlType='submit' icon='export' loading={this.state.sendingTx} disabled={!this.props.selectedAccount || !this.validateForm() || this.state.sendingTx} >
                                Send {this.state.value}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
        );
    }
}

Wallet.propTypes = {
    isOwner: PropTypes.bool,
    Contract: PropTypes.object,
    selectedAccount: PropTypes.string,
    contractBalance: PropTypes.number.isRequired
}

export default ErrorBoundary(Wallet);