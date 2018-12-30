import React, { Component } from 'react';
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";
import NetworkComponent from "./NetworkComponent";

import { web3Scripts } from '../../Scripts';
import { ContractTypes, FormHelp } from '../../Config';

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
        newBeneficiary: ''
    }

    addBeneficiary () {
    }

    validateStatus (field) {
    }

    handleChange = (field) => (e) => {
        // this.setState({ [field]: typeof e === 'string' ? e : e.target.value });
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
                <Row>
                    <Form onSubmit={(e) => e.preventDefault()} >
                        <Item label='beneficiary Address' help={FormHelp['newBeneficiary']} enum={ContractTypes} hasFeedback={true} validateStatus={this.validateStatus('contractType')} required>
                            {/* <Item label='Wait time' help={FormHelp.deployer.waitTime} hasFeedback={true} validateStatus={this.validateStatus('waitTime')} required> */}
                                <Input onChange={this.handleChange('newBeneficiary')} value={this.state.newBeneficiary} />
                            {/* </Item> */}
                        </Item>
                    </Form>
                </Row>
            </Layout>
        )
    }

}

Beneficiaries.propTypes = {
    contractAddress: PropTypes.string.isRequired
}

export default ErrorBoundary(NetworkComponent(Beneficiaries));