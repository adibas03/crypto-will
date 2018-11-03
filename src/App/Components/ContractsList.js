import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';import Col from 'antd/lib/layout';
import Layout from 'antd/lib/layout';
import Row from 'antd/lib/layout';

import 'antd/lib/col/style';
import 'antd/lib/layout/style';
import 'antd/lib/row/style';
import 'antd/lib/button/style';
import 'antd/lib/dropdown/style';
import 'antd/lib/icon/style';
import 'antd/lib/menu/style';

const { Header, Content, Sider } = Layout;


class ContractsList extends Component {
    
    render () {
        return (<div>ContractsList</div>);
    }
}

ContractsList.propTypes = {
    // account: PropTypes.object.isRequired,
}

export default ContractsList;