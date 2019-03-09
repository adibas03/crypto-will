import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from "./ErrorBoundary";
import DrizzleTxResolver from "./DrizzleTxResolver";

import { FormHelp } from '../../Config';
import { web3Scripts } from '../../Scripts';

import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';

import 'antd/lib/button/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';

const MILLISECONDS = 1000;

class Postpone extends DrizzleTxResolver {
    constructor (props) {
        super(props);
        this.state = {}

        this.postponeDisbursement = this.postponeDisbursement.bind(this);
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

    async loadTimingData () {
        const disbursing = await web3Scripts.isContractDisbursing(this.props.Contract);
        const lastInteraction = await web3Scripts.makeContractCall(this.props.Contract, 'lastInteraction');
        const waitTime = await web3Scripts.makeContractCall(this.props.Contract, 'waitingTime');

        this.setState({
            disbursing,
            lastInteraction,
            waitTime
        });
    }

    async postponeDisbursement (e) {
        try {
            this.setState({ postponing: true });
            const stack = web3Scripts.postponeDisbursement(this.props.selectedAccount, this.props.Contract);
            const tx = await this.watchTxStack(stack);

            this.watchTransaction(tx, {
                onError: (e) => {
                    notification['error']({
                        message: 'Transaction failed',
                        description: e.message || e
                    });
                    this.setState({ postponing: false });
                },
                onChanged: (txHash) => {
                    notification['success']({
                        message: 'Transaction sent',
                        description: txHash
                    });
                    this.setState({ postponing: false });
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
            this.setState({ postponing: false });
        }
    }
    
    render () {
        return (
            <Row>
                <Col span={24} style={{ margin: '0 0 24px' }}>
                    <p>
                        <b>Disburse date:</b> {this.humanReadableTime(this.dueDate)}
                    </p>
                    <Button type='primary' disabled={!this.canPostpone()} loading={this.state.postponing} onClick={this.postponeDisbursement} icon='fast-forward' title={FormHelp.postpone} >
                        Postpone Disbursement
                    </Button>
                </Col>
            </Row>
        );
    }
}

Postpone.propTypes = {
    isOwner: PropTypes.bool,
    Contract: PropTypes.object,
    disbursed: PropTypes.bool,
    selectedAccount: PropTypes.string
}

export default ErrorBoundary(Postpone);