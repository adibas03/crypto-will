import React, { Component } from 'react';
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";
import NetworkComponent from "./NetworkComponent";

import { web3Scripts, CONTRACT_ARRAYs_LENGTH } from '../../Scripts';
import { FormHelp } from '../../Config';

import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Layout from 'antd/lib/layout';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';

import 'antd/lib/card/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/form/style';
import 'antd/lib/icon/style';
import 'antd/lib/input/style';
import 'antd/lib/layout/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';

const { Item } = Form;

class Beneficiaries extends Component {

    constructor (props) {
        super(props);

        this.addBeneficiary = this.addBeneficiary.bind(this);
        this.calcValue = this.calcValue.bind(this);
        this.storeToNetwork = this.storeToNetwork.bind(this);
        this.validateStatus = this.validateStatus.bind(this);
    }

    state = {
        beneficiaries: [],
        beneficiariesToAdd: [],
        beneficiariesToRemove: [],
        newBeneficiary: '',
        newBeneficiaryDisposition: '',
        newBeneficiaryDispositionPercentage: '',
        newBeneficiaryDispositionValue: ''
    }

    get newBeneficiaryCorrect () {
        return this.props.isOwner;
    }

    get getTotalRatio () {
        let total =  0;
        if (this.state.beneficiaries && this.state.beneficiaries.length > 0) {
            this.state.beneficiaries.map(bene => {
                total += bene.disposition
            });
        }
        return total;
    }

    async loadBeneficiaries () {
        this.setState({
            beneficiaries: await web3Scripts.fetchBeneficiaries(this.props.drizzle, this.props.networkId, this.props.contractAddress)
        })
        // this.props.contractAddress;
    }

    async storeToNetwork () {
        let addTx;
        let removeTx;
        if (this.state.beneficiariesToAdd && this.state.beneficiariesToAdd.length > 0) {
            const addLength = Math.ceil(this.state.beneficiariesToAdd / CONTRACT_ARRAYs_LENGTH);
            const addTx = [];
            for (let i =0; i<addLength; i++) {
                addTx.push(web3Scripts.addBeneficiaries(this.props.selectedAccount, drizzle.contracts[this.props.contractAddress], this.state.beneficiariesToAdd));
            }
            console.log(addTx)
        }
        if (this.state.beneficiariesToRemove && this.state.beneficiariesToRemove.length > 0) {
            const remLength = Math.ceil(this.state.beneficiariesToAdd / CONTRACT_ARRAYs_LENGTH);
            const removeTx = [];
            for (let i =0; i<remLength; i++) {
                removeTx.push(web3Scripts.removeBeneficiaries(this.props.selectedAccount, drizzle.contracts[this.props.contractAddress], this.state.beneficiariesToRemove));
            }
            console.log(removeTx)
        }
        this.resolveTransactions(addTx.concat(removeTx));
    }

    async resolveTransactions (transactions) {
        console.log(arguments)
    }

    addBeneficiary () {
    }

    calcValue (ratio) {
        const amount = ((this.props.contractBalance * ratio) / this.getTotalRatio) || 0;
        return web3Scripts.parseEtherValue(amount, true);
    }

    updateArray (array, index, value) {
        array[index] = value;
        return array;
    }

    validateStatus (field, index) {
    }

    handleChange = (field, index) => (e) => {
        if (typeof index === 'undefined') {
            this.setState({ [field]: typeof e === 'string' ? e : e.target.value });
        } else {
            this.setState({ [field]: typeof e === 'string' ? updateArray(this.state[field], index, e) : updateArray(this.state[field], index, e.target.value) });
        }
    }

    async componentWillMount () {
        await this.loadBeneficiaries ();
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
                        this.state.beneficiaries.map( (beneficiary, index) => 
                            <Row gutter={16}>
                                <Col span={15}>
                                    <Item hasFeedback={true} validateStatus={this.validateStatus('beneficiary', index)} required>
                                        <Input onChange={this.handleChange('beneficiary', index)} value={this.state.beneficiary[index]} />
                                    </Item>
                                </Col>
                                <Col span={3}>
                                    <Item hasFeedback={true} validateStatus={this.validateStatus('beneficiaryDisposition', index)} required>
                                        <Input onChange={this.handleChange('beneficiaryDisposition', index)} type='number' min={1} value={this.state.beneficiaryDisposition[index]} />
                                    </Item>
                                </Col>
                                <Col span={4}>
                                    <Item >
                                        <Input disabled={true} value={ web3Scripts.parseEtherValue(this.calcValue(this.state.beneficiaryDisposition[index]), true) } />
                                    </Item>
                                </Col>
                                <Col span={2}>
                                    <Button style={{ marginTop: '4px' }} icon='minus-square' title={FormHelp.removeBeneficiary} onClick={this.removeBeneficiary(index)} />
                                </Col>
                            </Row>
                        )
                    }
                    <Row gutter={16}>
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
                    </Row>
                </Form>
            </Layout>
        )
    }

}

Beneficiaries.propTypes = {
    drizzle: PropTypes.object.isRequired,
    isOwner: PropTypes.bool.isRequired,
    contractAddress: PropTypes.string.isRequired,
    contractBalance: PropTypes.number.isRequired,
    networkId: PropTypes.number.isRequired,
    selectedAccount: PropTypes.string
}

export default ErrorBoundary(NetworkComponent(Beneficiaries));