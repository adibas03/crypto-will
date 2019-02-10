import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from "./ErrorBoundary";

import { FormHelp } from '../../Config';
import { web3Scripts } from '../../Scripts';

import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';
import Select from 'antd/lib/select';

import 'antd/lib/button/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/form/style';
import 'antd/lib/icon/style';
import 'antd/lib/input/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';
import 'antd/lib/select/style';

const { Item } = Form;
const { Option } = Select;

const timeSpans = [
    'second',
    'day',
    'month',
    'year'
];

const timeSpansFactors = {
    second: 1,
    day: 86400,
    month: 2592000,
    year: 31536000

};

const MILLISECONDS = 1000;

class Postpone extends Component {
    constructor (props) {
        super(props);
        this.state = {}

        this.postponeDisbursement = this.postponeDisbursement.bind(this);
    }

    get dueDate () {
        return (this.props.lastInteraction + this.props.lastInteraction) * MILLISECONDS; 
    }

    humanReadableTime (timestamp) {

    }

    canPostpone () {
        return this.props.isOwner;
    }

    async postponeDisbursement (e) {
        try {
            this.setState({ postponing: true });
            const stack = web3Scripts.postponeDisbursement(this.props.selectedAccount, this.props.Contract);
            const tx = await web3Scripts.watchTxStack(stack, this.props.transactionStack, this.props.transactions);

            web3Scripts.watchTransaction(tx, this.prop.transactions, {
                onError: (e) => {
                    notification['error']({
                        message: 'Transaction failed',
                        description: e.message || e
                    });
                },
                onChanged: (tx) => {
                    notification['success']({
                        message: 'Transaction sent',
                        description: tx
                    });
                },
                onReceipt: (receipt) => {
                    notification['success']({
                        message: 'Transaction confirmed',
                        description: `HASH: ${tx}, BLOCK: ${receipt.blockNumber}`
                    });
                    this.setState({ postponing: false });
                }
            });
        } catch (e) {
            notification['error']({
                message: 'Transaction failed',
                description: e.message || e
            });

        }
    }
    
    render () {
        return (
            <Row>
                <Col span={24} style={{ margin: '0 0 24px' }}>
                    <p>
                        <b>Disburse date:</b> {new Date(this.dueDate).toString()}
                    </p>
                    <Button type='primary' disabled={!this.canPostpone} loading={this.state.postponing} onClick={this.postponeDisbursement} icon='fast-forward' title={FormHelp.postpone} >
                        Postpone Disbursement
                    </Button>
                    <Divider style={{ height: '1px', margin: '0' }} />
                </Col>
            </Row>
        );
    }
}

Postpone.propTypes = {
    isOwner: PropTypes.bool,
    Contract: PropTypes.object,
    disbursed: PropTypes.bool,
    disbursing: PropTypes.bool,
    lastInteraction: PropTypes.string,
    waitTime: PropTypes.string,
    transactionStack: PropTypes.array,
    transactions: PropTypes.object
}

export default ErrorBoundary(Postpone);