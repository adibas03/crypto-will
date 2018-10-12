import React, { Component } from "react";
import PropTypes from "prop-types";
import { Menu, Dropdown }  from 'antd'

class Accounts extends Component {
    menu(list) {
        return (
            <Menu>
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
    
    render () {
        if (this.props.accounts) {
            const accounts = Object.keys(this.props.accounts).map( id => this.props.accounts[id] );
            const menu = this.menu(accounts);
            return (
                <Dropdown overlay={menu}>
                    <span>{ this.props.selected || "Select account" }</span>
                </Dropdown>
            );
        } else {
            return <i>No accounts available</i>
        }
    }
}

Accounts.propTypes = {
    accounts: PropTypes.object.isRequired
}

export default Accounts;