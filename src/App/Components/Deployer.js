import React, { Component } from "react";
import PropTypes from "prop-types";

import { ContractTypes, FormHelp } from '../../Config';

import Dropdown from 'antd/lib/dropdown';
import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';import Col from 'antd/lib/layout';

import Button from 'antd/lib/button';
// import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Layout from 'antd/lib/layout';
import Row from 'antd/lib/row';
import Select from 'antd/lib/select';

import 'antd/lib/button/style';
// import 'antd/lib/col/style';
import 'antd/lib/form/style';
import 'antd/lib/input/style';
import 'antd/lib/layout/style';
import 'antd/lib/row/style';
import 'antd/lib/select/style';

import 'antd/lib/dropdown/style';
import 'antd/lib/icon/style';
import 'antd/lib/menu/style';

const { Header, Content, Sider } = Layout;
const { Item } = Form;
const { Option } = Select;


class Deployer extends Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    contractHelp() {
        return FormHelp.deployer[this.state.contractType || ''];
    }

    handleChange = (field) => (e) => {
        this.setState({ [field]: typeof e === 'string' ? e : e.target.value });
    }
    
    render () {
        return (
            <Row>
                <Col span={24} style={{ margin: '10px 0'}}>
                    <h2>Deploy { this.state.contractType } contract:</h2>
                </Col>
                <Col >
                    <Form>
                        <Item label='Contract Type' help={this.contractHelp()}>
                            <Select onSelect={this.handleChange('contractType')} value={this.state.contractType} enum={ContractTypes}>
                                {
                                    ContractTypes.map( (contractType) =>
                                        <Option key={contractType} value={contractType}> { contractType } </Option>
                                    )
                                }
                            </Select>
                        </Item>
                        { this.state.contractType !== 'Wallet' &&
                            <Item label='Wait time'>
                                <Input onChange={this.handleChange('waitTime')} value={this.state.waitTime} />
                            </Item>
                        }
                    </Form>
                </Col>
            </Row>
        );
    }
}

Deployer.propTypes = {
    // account: PropTypes.object.isRequired,
}

export default Deployer;