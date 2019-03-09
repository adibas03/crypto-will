import React from 'react';
import PropTypes from 'prop-types';
import Collapsable from "./Collapsable";
import ErrorBoundary from "./ErrorBoundary";
import DrizzleTxResolver from "./DrizzleTxResolver";

import { FormHelp } from '../../Config';
import { web3Scripts } from '../../Scripts';

import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';

import 'antd/lib/button/style';
import 'antd/lib/col/style';
import 'antd/lib/form/style';
import 'antd/lib/icon/style';
import 'antd/lib/input/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';

const { Item } = Form;

class Wallet extends DrizzleTxResolver {
    constructor (props) {
        super(props);
        this.state = {
            address: '',
            amount: ''
        };

        this.sendTransaction = this.sendTransaction.bind(this);
        this.sendEntireBalance = this.sendEntireBalance.bind(this);
    }

    sendEntireBalance () {
        this.setState({
            amount: web3Scripts.parseEtherValue(this.props.contractBalance, true)
        });
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
            return Number(this.state[field]) > 0 && this.props.contractBalance >= web3Scripts.parseEtherValue(this.state[field]) ? 'success' : 'error';
        }
    }

    validateForm () {
        return Object.keys(this.state).every( val => {
           return this.state[val] && this.validateStatus(val) === 'success';
        });
    }

    async sendTransaction (e) {
        e.preventDefault();
        try {
            this.setState({ sendingTx: true });
            const stack = web3Scripts.sendTransaction(this.props.Contract, 'transferEth', { from: this.props.selectedAccount }, this.state.address, web3Scripts.parseEtherValue(this.state.amount));
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
            <Collapsable opened title={'Wallet'} style={{ margin: '48px 0 12px' }}>
                <Form onSubmit={this.sendTransaction} style={{ margin: '0 0 12x' }}>
                    <Row gutter={24}>
                        <Col span={17}>
                            <Item label='Address' help={FormHelp.recipientAddress} validateStatus={this.validateStatus('address')} required>
                                <Input onChange={this.handleChange('address')} value={this.state.address} />
                            </Item>
                        </Col>
                        <Col span={6}>
                            <Item label='Amount' help={FormHelp.recipientValue} validateStatus={this.validateStatus('amount')} required>
                                <Input onChange={this.handleChange('amount')} value={this.state.amount}
                                    addonAfter={<Icon onClick={this.sendEntireBalance} style={{ cursor: 'pointer' }} type='wallet' theme='twoTone' title='Send entire balance' />}
                                />
                            </Item>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '18px'}}>
                        <Col offset={20} span={4}>
                            <Button type='primary' htmlType='submit' icon='export' loading={this.state.sendingTx} disabled={!this.props.selectedAccount || !this.validateForm() || this.state.sendingTx} >
                                Send {this.state.value}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Collapsable>
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