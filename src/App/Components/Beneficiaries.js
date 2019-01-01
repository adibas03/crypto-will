import React, { Component } from 'react';
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";
import NetworkComponent from "./NetworkComponent";

import { web3Scripts } from '../../Scripts';
import { ContractTypes, FormHelp } from '../../Config';

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
        this.validateStatus = this.validateStatus.bind(this);
    }

    state = {
        newBeneficiary: '',
        newBeneficiaryDisposition: '',
        newBeneficiaryDispositionPercentage: '',
        newBeneficiaryDispositionValue: ''
    }

    get newBeneficiaryCorrect () {
    }

    addBeneficiary () {
    }

    loadBeneficiaries () {
        // this.props.contractAddress;
    }

    validateStatus (field) {
    }

    handleChange = (field) => (e) => {
        this.setState({ [field]: typeof e === 'string' ? e : e.target.value });
    }

    async componentWillMOunt () {
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
                        <Col span={12}>
                            <h4>
                                <span title={FormHelp['newBeneficiary']} style={{ cursor: 'help' }}>
                                    Address
                                </span>
                            </h4>
                        </Col>
                        <Col span={4}>
                            <h4>
                                <span title={FormHelp['newBeneficiaryDisposition']} style={{ cursor: 'help' }}>
                                    Ratio
                                </span>
                            </h4>
                        </Col>
                        <Col span={2}>
                            <h4>
                                <span title={FormHelp['newBeneficiaryDispositionPercentage']} style={{ cursor: 'help' }}>
                                    %
                                </span>
                            </h4>
                        </Col>
                        <Col span={4}>
                            <h4>
                                <span title={FormHelp['newBeneficiaryDispositionValue']} style={{ cursor: 'help' }}>
                                    Value
                                </span>
                            </h4>
                        </Col>
                        <Col span={2}>
                        </Col>
                        <Col span={24}>
                            <Divider />
                        </Col>
                    </Row>
                    {
                        // this.
                    }
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item hasFeedback={true} validateStatus={this.validateStatus('newBeneficiary')} required>
                                <Input onChange={this.handleChange('newBeneficiary')} value={this.state.newBeneficiary} />
                            </Item>
                        </Col>
                        <Col span={4}>
                            <Item hasFeedback={true} validateStatus={this.validateStatus('newBeneficiaryDisposition')} required>
                                <Input onChange={this.handleChange('newBeneficiaryDisposition')} value={this.state.newBeneficiaryDisposition} />
                            </Item>
                        </Col>
                        <Col span={2}>
                            <Item hasFeedback={true} validateStatus={this.validateStatus('newBeneficiaryDispositionPercentage')} required>
                                <Input onChange={this.handleChange('newBeneficiaryDispositionPercentage')} value={this.state.newBeneficiaryDispositionPercentage} />
                            </Item>
                        </Col>
                        <Col span={4}>
                            <Item hasFeedback={true} validateStatus={this.validateStatus('newBeneficiaryDispositionValue')} required>
                                <Input disabled={true} value={this.state.newBeneficiaryDispositionValue} />
                            </Item>
                        </Col>
                        <Col span={2}>
                            <Button  disabled={!this.newBeneficiaryCorrect} onClick={this.addBeneficiary()}>
                                <Icon type='plus-square' style={{ fontSize: '28px' }} />
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Layout>
        )
    }

}

Beneficiaries.propTypes = {
    contractAddress: PropTypes.string.isRequired,
    contractBalance: PropTypes.number.isRequired,
    networkId: PropTypes.number.isRequired,
}

export default ErrorBoundary(NetworkComponent(Beneficiaries));