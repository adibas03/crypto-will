import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';

import 'antd/lib/button/style';
import 'antd/lib/dropdown/style';
import 'antd/lib/icon/style';
import 'antd/lib/menu/style';

class Accounts extends Component {
    menu(list) {
        return (
            <Menu onClick={this.props.selectAccount} onSelect={this.props.selectAccount}>
                { list.map( (item) => {
                    const value = list[item] || item;
                        return (
                            <Menu.Item key={value}>
                                {item}
                            </Menu.Item>
                        );
                    })
                }
            </Menu>
        );
    }
    componentDidMount () {
        if (!this.props.selected && this.props.accounts && this.props.accounts.length > 0) {
            this.props.selectAccount({ key: this.props.accounts[0] });
        }
    }
    
    render () {
        if (this.props.accounts) {
            const accounts = Object.keys(this.props.accounts).map( id => this.props.accounts[id] );
            const menu = this.menu(accounts);
            return (
                <Dropdown overlay={menu} trigger={['click']}>
                    <Button>
                        { this.props.selected || "Select account" }
                        <Icon type="down" />
                    </Button>
                </Dropdown>
            );
        } else {
            return <i>No accounts available</i>
        }
    }
}

Accounts.propTypes = {
    accounts: PropTypes.object.isRequired,
    selectAccount: PropTypes.func.isRequired,
    selected: PropTypes.string
}

export default Accounts;