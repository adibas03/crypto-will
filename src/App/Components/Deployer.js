import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from "./ErrorBoundary";

import { ContractTypes, FormHelp } from '../../Config';
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

class Deployer extends Component {
    constructor (props) {
        super(props);
        this.state = {
            timeSpan: timeSpans[0],
            formValidations: {
                contractType: false,
                waitTime: false,
                timeSpan: true
            }
        };
        this.deployContract = this.deployContract.bind(this);
        this.resetForm = this.resetForm.bind(this);
        this.validateField = this.validateField.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    async deployContract (e) {
        e.preventDefault();
        this.setState({ deploying: true });
        await web3Scripts.deployContract({
            Deployer: this.props.DeployerContract,
            transactionStack: this.props.transactionStack,
            transactions: this.props.transactions,
            type: this.state.contractType,
            fromAddress: this.props.selectedAccount,
            args: { waitTime: this.state.waitTime * timeSpansFactors[this.state.timeSpan] },
            onTransactionHash: (hash) => this.resetForm() && notification['success']({
                message: 'Transaction sent',
                description: hash
            }),
            onReceipt: (receipt) => notification['info']({
                message: 'Transaction confirmed',
                description: `HASH: ${receipt.transactionHash}, BLOCK: ${receipt.blockNumber}`
            }),
        })
        .catch((err) => notification['error']({
            message: 'Deployment failed',
            description: err.message || err
        }))
        this.setState({ deploying: false });
    }

    get timeSpanSelect () {
        return (
            <Select onSelect={this.handleChange('timeSpan')} value={this.state.timeSpan}>
                {
                    timeSpans.map( (timeSpan) =>
                        <Option key={timeSpan} value={timeSpan}> { timeSpan.charAt(0).toUpperCase() + timeSpan.slice(1) + '(s)' } </Option>
                    )
                }
            </Select>
        );
    }

    contractHelp() {
        return FormHelp.deployer.contractType[this.state.contractType || ''];
    }

    resetForm () {
        this.setState({
            contractType: '',
            timeSpan: timeSpans[0],
            deploying: false
        });
        return true;
    }

    validateField (field) {
        let status;
        switch (field) {
            case 'contractType':
                status = ContractTypes.includes(this.state[field]);
                break;
            case 'waitTime':
                status = this.state[field] > 0;
                break;
            case 'timeSpan':
                status = timeSpans.includes(this.state[field]);
                break;
        }
        this.state.formValidations[field] = status;
        return this.state.formValidations[field];
    }

    validateStatus (field) {
        if (this.state[field]) {
            return this.validateField(field) ? 'success' : 'error';
        } else {
            return '';
        }
    }

    validateForm () {
        return Object.keys(this.state.formValidations).every( val => {
            if (val === 'waitTime' && this.state.contractType === 'Wallet') {
                return true;
            } else {
                return this.state.formValidations[val] === true;
            }
        })
    }

    handleChange = (field) => (e) => {
        this.setState({ [field]: typeof e === 'string' ? e : e.target.value });
    }
    
    render () {
        return (
            <Row>
                <Col span={24} style={{ margin: '0 0 24px' }}>
                    <h2>Deploy { this.state.contractType } contract:</h2>
                    <Divider style={{ height: '1px', margin: '0' }} />
                </Col>
                <Col >
                    <Form onSubmit={this.deployContract} >
                        <Item label='Contract Type' help={this.contractHelp()} enum={ContractTypes} hasFeedback={true} validateStatus={this.validateStatus('contractType')} required>
                            <Select onSelect={this.handleChange('contractType')} value={this.state.contractType}>
                                {
                                    ContractTypes.map( (contractType) =>
                                        <Option key={contractType} value={contractType}> { contractType } </Option>
                                    )
                                }
                            </Select>
                        </Item>
                        { this.state.contractType && this.state.contractType !== 'Wallet' &&
                            <Item label='Wait time' help={FormHelp.deployer.waitTime} hasFeedback={true} validateStatus={this.validateStatus('waitTime')} required>
                                <Input onChange={this.handleChange('waitTime')} value={this.state.waitTime} addonAfter={this.timeSpanSelect}/>
                            </Item>
                        }
                        <Item style={{ margin: '24px 0'}}>
                            <Button type='primary' htmlType='submit' disabled={!this.props.selectedAccount || !this.validateForm() || this.state.deploying} >
                                {this.state.deploying && <Icon type='loading'/>}
                                {!this.state.deploying && <Icon type='upload'/>}
                                Deploy
                            </Button>
                        </Item>
                    </Form>
                </Col>
            </Row>
        );
    }
}

Deployer.propTypes = {
    selectedAccount: PropTypes.string,
    DeployerContract: PropTypes.object,
    transactionStack: PropTypes.array,
    transactions: PropTypes.object
}

export default ErrorBoundary(Deployer);