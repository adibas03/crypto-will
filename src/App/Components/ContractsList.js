import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
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

class ContractsList extends Component {
    state = {
        activeAccount: '',
        foundContracts: [],
        fetchingContracts: false,
        runningSubscription: null
    }

    constructor (props) {
        super(props);
        this.fetchDeployedContracts = this.fetchDeployedContracts.bind(this);
        this.accountUpdated = this.accountUpdated.bind(this);

        this.props.accountUpdated(this.accountUpdated);
        this.props.networkUpdated(this.fetchDeployedContracts);
        this.accountUpdated();
    }

    get fetchingContracts () {
        return !!this.state.runningSubscription;
    }

    get displayList () {
        return this.props.foundContracts.sort(
            function compareNumbers(a, b) {
                return b.blockNumber - a.blockNumber;
            });
    }

    accountUpdated () {
        if (!this._mounted) {
            return;
        }
        if (!this.accountLoaded()) {
            // this.setState({ activeAccount: this.props.selectedAccount }, () => {
                this.fetchDeployedContracts();
            // });
        }
    }

    accountLoaded () {
        return this.state.activeAccount === this.props.selectedAccount;
    }

    contractReady () {
        return !!this.props.DeployerContract;
    }

    accountReady () {
        return !!this.props.selectedAccount;
    }

    async fetchDeployedContracts (force = false) {
        if (!this._mounted || !this.accountReady() || !this.contractReady() || (!force && (this.fetchingContracts && this.accountLoaded()))) {
            return ;
        }
        if (this.state.runningSubscription) {
            await web3Scripts.unsubscribeEvent(this.state.runningSubscription);
        }
        const selectedAccount = this.props.selectedAccount;

        this.setState({
            foundContracts: [],
            fetchingContracts: true,
            runningSubscription: null
        });
        try {
            const fetchSubscription = web3Scripts.fetchDeployments(this.props.DeployerContract, this.props.networkId, { creator: [ selectedAccount ] }, {
                onData: (event) => {
                    this.props.foundNewContract(event);
                    this.forceUpdate();
                },
                onChanged: (event) => console.log('Changed', event)
            });

            fetchSubscription.then(sub => {
                this.setState({
                    activeAccount: selectedAccount,
                    runningSubscription: sub,
                    fetchingContracts: false
                });
            });
        } catch (e) {
            notification['error']({
                duration: 0,
                message: 'Contract List failed to load',
                description: e.message || e
            });
        }
    }

    componentDidMount () {
        this._mounted = true;
        this.fetchDeployedContracts();
    }
  
    componentWillUnmount () {
      this._mounted = false;
    }
    
    render () {
        return (
            <Layout>
                <Row gutter={0} style={{ margin: '0 0 24px' }}>
                    <Col span={20}>
                        <h2>Deployed Contracts</h2>
                    </Col>
                    <Col span={4}>
                        <Row gutter={0} justify='center'>
                            <Col span={11} >
                                <NavLink to='/deploy' title='New contract' >
                                    <Icon type='plus-square' style={{ fontSize: '28px' }} />
                                </NavLink>
                            </Col>
                            <Col span={11} >
                                <h3>: { this.state.fetchingContracts ? '...' : this.props.foundContracts.length }</h3>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24} >
                        <Divider style={{ height: '1px', margin: '0' }} />
                    </Col>
                </Row>
                <Layout style={{ overflowY: 'auto', maxHeight: '900px' }}>
                    {this.displayList.map( (contract, index) => {
                        return (
                            <div key={index}>
                                <Card
                                    title={
                                        <NavLink to={`/contract/${ contract.returnValues.contractAddress }`} >
                                            { `${index+1}: ${ contract.returnValues.contractAddress }` }
                                        </NavLink>}
                                    style={{ background: 'transparent' }}
                                    headStyle={{ background: '#dedede' }}
                                    extra={
                                        <a title='Block Explorer' target='_blank' href={ Explorers[this.props.networkId] ? `${Explorers[this.props.networkId]}/address/${contract.returnValues.contractAddress}` : '#' }>
                                            <Icon type='cluster' style={{ fontSize: '24px' }}/>
                                        </a>}
                                >
                                    <Row>
                                        <Col span={5}>
                                            <h4>Type:</h4>
                                        </Col>
                                        <Col span={19} className='word-wrapped'>{ contract.returnValues.contractType }</Col>
                                    </Row>
                                    <Row>
                                        <Col span={5}>
                                            <h4>Block:</h4>
                                        </Col>
                                        <Col span={19} className='word-wrapped'>{ contract.blockNumber }</Col>
                                    </Row>
                                    <Row>
                                        <Col span={5}>
                                            <h4>Tx Hash:</h4>
                                        </Col>
                                        <Col span={19} className='word-wrapped'>{ contract.transactionHash }</Col>
                                    </Row>
                                </Card>
                            </div>
                        );
                    })}
                </Layout>
                
            </Layout>
        );
    }
}

ContractsList.propTypes = {
    selectedAccount: PropTypes.string,
    DeployerContract: PropTypes.object,
    accountUpdated: PropTypes.func,
    foundcontracts: PropTypes.array,
    foundNewContract: PropTypes.func.isRequired,
    networkId: PropTypes.number,
    networkUpdated: PropTypes.func
}

export default ErrorBoundary(NetworkComponent(ContractsList));