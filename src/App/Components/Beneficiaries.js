import React, { Component } from 'react';
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";
import NetworkComponent from "./NetworkComponent";

import { web3Scripts } from '../../Scripts';

import Card from 'antd/lib/card';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Icon from 'antd/lib/icon';
import Layout from 'antd/lib/layout';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';

import 'antd/lib/card/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/icon/style';
import 'antd/lib/layout/style';
import 'antd/lib/notification/style';
import 'antd/lib/row/style';
import { Explorers } from "../../Config";

class Beneficiaries extends Component {

    render () {
        return (
            <Layout>
                <Row gutter={0} style={{ margin: '0 0 24px' }}>
                    <Col span={24}>
                        <h2>Benefeciaries</h2>
                    </Col>
                </Row>
            </Layout>
        )
    }

}

Beneficiaries.propTypes = {
}

export default ErrorBoundary(NetworkComponent(Beneficiaries));