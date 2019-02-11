import React, { Component } from 'react';
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";
import Beneficiaries from "./NetworkComponent";
import NetworkComponent from "./NetworkComponent";
import Postpone from "./Postpone";

import { ContractTypes, Explorers } from '../../Config';
import { web3Scripts } from '../../Scripts';

import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Layout from 'antd/lib/layout';
import Row from 'antd/lib/row';

import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/layout/style';
import 'antd/lib/row/style';

class Contract extends Component {
    constructor (props) {
        super(props);

        this.fetchDeploymentReceipt = this.fetchDeploymentReceipt.bind(this);
        this.resolveContractDeploymentReceipt = this.resolveContractDeploymentReceipt.bind(this);
    }

    state= {
        contract: {},
        deploymentReceipt: null
    }

    get contractHasBeneficiaries () {
        const hasBeneficiaries = this.state.contract.contractType ? 
            [ ContractTypes[0], ContractTypes[2] ].some( type => type.toLowerCase() === this.state.contract.contractType.toLowerCase()) :
            false;
        return hasBeneficiaries;
    }

    getFromContractLists (address) {
        return this.props.contractsList.length > 0 && this.props.contractsList.find((deployEvent) => address === deployEvent.returnValues.contractAddress);
    }

    deploymentReceiptExists () {
        return !!this.state.deploymentReceipt;
    }

    componentDidUpdate() {
        if (this.state.contract.address !== this.props.match.params.contractAddress) {
            this.state.contract = {};
            this.loadContractData();
        }
    }

    async loadContractData () {
        const { contractAddress } = this.props.match.params;
        this.setState({
            contract: {
                address: contractAddress,
                blockNumber: await this.getContractDeploymentBlock(contractAddress),
                contractType: await this.getContractType(contractAddress),
                transactionHash: await this.getContractDeploymentHash(contractAddress)
            }
        });
    }

    async fetchDeploymentReceipt (contractAddress) {
        if (this.deploymentReceiptExists()) {
            return true;
        }
        const { Deployer } = this.props.drizzle.contracts;
        const receipt = await web3Scripts.getDeploymentReceipt(Deployer, this.props.networkId, contractAddress);
        return this.setState({ deploymentReceipt: receipt }, () => true);
    }

    async resolveContractDeploymentReceipt (address) {
        const deployReceipt = this.getFromContractLists(address);
        if (!deployReceipt && !this.deploymentReceiptExists()) {
            await this.fetchDeploymentReceipt(address);
        }
        return deployReceipt || this.state.deploymentReceipt;
    }

    async getContractType (address) {
            const receipt =  await this.resolveContractDeploymentReceipt(address);
            return receipt && receipt.returnValues.contractType;
    }

    async getContractDeploymentBlock(address) {
        const receipt = await this.resolveContractDeploymentReceipt(address);
        return receipt && receipt.blockNumber;
    }

    async getContractDeploymentHash(address) {
        const receipt = await this.resolveContractDeploymentReceipt(address);
        return receipt && receipt.transactionHash;
    }

    async componentWillMount () {
        await this.loadContractData();
    }

    render () {
        const { contract } = this.state;
        return (
            <Layout>
                <Row gutter={0} style={{ margin: '0 0 24px' }}>
                    <Col span={24}>
                        <h2>Contracts details</h2>
                        <h4>({ this.props.match.params.contractAddress })</h4>
                        <Divider style={{ height: '1px', margin: '0' }} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p className='word-wrapped'>
                            <b>Type: </b>{ contract.contractType }
                        </p>
                        <p className='word-wrapped'>
                            <b>Block: </b>{ contract.blockNumber }
                        </p>
                        <p className='word-wrapped'>
                            <b>Transaction: </b><a target='_blank' href={`${Explorers[this.props.networkId]}/tx/${contract.transactionHash}`}>{ contract.transactionHash }</a>
                        </p>
                    </Col>
                </Row>
                { this.contractHasBeneficiaries &&
                    <Postpone Contract={this.props.drizzle.contracts[this.state.contract.address]} isOwner={this.state.owner === this.props.selectedAccount} />
                }
                { this.contractHasBeneficiaries &&
                    <Beneficiaries />
                }
            </Layout>
        )
    }

}

Contract.propTypes = {
    contractsList: PropTypes.array,
    drizzle: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    networkId: PropTypes.number,
    selectedAccount: PropTypes.string
}

export default ErrorBoundary(NetworkComponent(Contract));