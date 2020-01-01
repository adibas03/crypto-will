import React, { Component } from "react";
import { Switch, Redirect } from "react-router";
import { HashRouter, Link, Route } from "react-router-dom";
import PropTypes from "prop-types";

import { web3Scripts, eacScript } from "../Scripts";

import { Accounts, Contract, ContractsList, Deployer } from "./Components";

import Alert from "antd/lib/alert";
import Col from "antd/lib/col";
import Divider from "antd/lib/divider";
import Layout from "antd/lib/layout";
import Row from "antd/lib/row";

import "antd/lib/alert/style";
import "antd/lib/col/style";
import "antd/lib/divider/style";
import "antd/lib/layout/style";
import "antd/lib/row/style";

const { Content } = Layout;

import { drizzleConnect } from "@drizzle/react-plugin";
import { LoadingContainer } from "@drizzle/react-components";

class App extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      drizzle: context.drizzle,
      fetchingNetwork: false,
      accountUpdatedCalls: [],
      ContractsList: [],
      networkUpdatedCalls: []
    };

    this.updateSelectedAccount = this.updateSelectedAccount.bind(this);
    this.callOnAccountUpdate = this.callOnAccountUpdate.bind(this);
    this.callOnNetworkUpdate = this.callOnNetworkUpdate.bind(this);
    this.foundContractAddress = this.foundContractAddress.bind(this);
  }

  async getNetwork() {
    if (this.state.fetchingNetwork || !this._mounted) {
      return false;
    }
    this.setState({ fetchingNetwork: true });

    const activeNetworkId = await web3Scripts.getNetworkId(
      this.state.drizzle.web3
    );
    const activeNetwork = web3Scripts.getNetwork(activeNetworkId);
    const valuesUpdated = activeNetworkId !== this.state.activeNetworkId;

    this.setState(
      {
        activeNetworkId,
        activeNetwork,
        fetchingNetwork: false
      },
      () => {
        if (valuesUpdated) {
          this.networkUpdated(activeNetworkId, activeNetwork);
        }
      }
    );
  }

  runNetworkWatcher() {
    if (this.state.networkInterval) {
      clearInterval(this.state.networkInterval);
    }

    const networkInterval = setInterval(() => {
      const { drizzleStatus } = this.props;
      if (drizzleStatus.initialized && !this.state.activeNetwork) {
        this.getNetwork();
      }
    }, 1000);
    this.setState({ networkInterval });
  }

  updateSelectedAccount(event) {
    if (this._mounted && this.state.selectedAccount !== event.key) {
      this.setState({ selectedAccount: event.key, ContractsList: [] }, () => {
        this.accountUpdated(this.state.selectedAccount);
      });
    }
  }

  foundContractAddress(deployLog) {
    if (this._mounted) {
      //Object comparison hack
      const found = this.state.ContractsList.some(
        contract => JSON.stringify(contract) === JSON.stringify(deployLog)
      );
      if (!found) {
        this.state.ContractsList.push(deployLog);
      }
    }
  }

  callOnNetworkUpdate(fn) {
    this.state.networkUpdatedCalls.push(fn);
  }

  networkUpdated(networkId, network) {
    this.state.networkUpdatedCalls.forEach(fn => fn(networkId, network));
  }

  callOnAccountUpdate(fn) {
    this.state.accountUpdatedCalls.push(fn);
  }

  accountUpdated(address) {
    this.state.accountUpdatedCalls.forEach(fn => fn(address));
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillMount() {
    this.runNetworkWatcher();
  }

  componentWillUnmount() {
    this._mounted = false;
    clearInterval(this.state.networkInterval);
  }

  render() {
    const { drizzleStatus } = this.props;

    return (
      <HashRouter basename="/">
        <Layout
          className="App"
          style={{ minWidth: "576px", minHeight: "100vh", overflowY: "hidden" }}
        >
          {!drizzleStatus.initialized && (
            <div style={{ textAlign: "center" }}>
              {!this.state.fetchingNetwork && (
                <h4>Network might not be supported</h4>
              )}
              <LoadingContainer>
                <div></div>
              </LoadingContainer>
            </div>
          )}
          {drizzleStatus.initialized && (
            <Layout>
              <Content>
                <Layout style={{ margin: "16px 56px 0" }}>
                  <span>
                    <Link to="/">
                      <h1 className="App-title">Crypto will </h1>
                    </Link>
                  </span>
                  <h5>
                    ( {this.state.activeNetwork || "No connected"} network )
                  </h5>
                </Layout>
                <Layout>
                  <Accounts
                    {...{
                      accounts: this.props.accounts,
                      selected: this.state.selectedAccount,
                      selectAccount: this.updateSelectedAccount
                    }}
                  />
                </Layout>
                <Layout>
                  <Content className="App-intro" style={{ margin: "0 56px" }}>
                    <Row style={{ margin: "56px 0" }}>
                      <Col>
                        <p>
                          Crypto Will, is a tool to deploy your personal will on
                          the Ethereum blockchain.
                          <br />
                          You can add beneficiaries, delete beneficiaries, set
                          their percentage, also set the Waiting period before
                          the wealth can be disposed.
                        </p>
                        <Divider style={{ height: "2.5px", margin: "0" }} />
                      </Col>
                    </Row>
                    {!this.state.selectedAccount && (
                      <Alert
                        description="Please select / Unlock an Account/Address to continue."
                        type="info"
                        style={{ margin: "24px 0" }}
                      />
                    )}
                    <Row>
                      <Col lg={14} md={24}>
                        <Col sm={24} lg={22}>
                          <div>
                            <Switch>
                              <Redirect exact from="/" to="/deploy"></Redirect>
                              <Redirect
                                exact
                                from="/contract"
                                to="/deploy"
                              ></Redirect>
                            </Switch>
                            <Route
                              exact
                              path="/deploy"
                              render={props => (
                                <Deployer
                                  {...props}
                                  selectedAccount={this.state.selectedAccount}
                                  DeployerContract={
                                    this.state.drizzle.contracts.Deployer
                                  }
                                  transactionStack={this.props.transactionStack}
                                  transactions={this.props.transactions}
                                />
                              )}
                            ></Route>
                            <Route
                              exact
                              path="/contract/:contractAddress"
                              render={props => (
                                <Contract
                                  {...props}
                                  networkId={this.state.activeNetworkId}
                                  selectedAccount={this.state.selectedAccount}
                                  drizzle={this.state.drizzle}
                                  transactionStack={this.props.transactionStack}
                                  transactions={this.props.transactions}
                                  contractsList={this.state.ContractsList}
                                />
                              )}
                            ></Route>
                          </div>
                        </Col>
                      </Col>
                      <Col lg={1} md={24}>
                        <Col lg={1} xs={0}>
                          <Divider
                            type="vertical"
                            style={{
                              minHeight: "200px",
                              marginLeft: "25px",
                              width: "2.5px"
                            }}
                          />
                        </Col>
                        <Col lg={0} md={24}>
                          <Divider
                            type="horizontal"
                            style={{ height: "2.5px" }}
                          />
                        </Col>
                      </Col>
                      <Col lg={9} md={24}>
                        <ContractsList
                          networkUpdated={this.callOnNetworkUpdate}
                          networkId={this.state.activeNetworkId}
                          accountUpdated={this.callOnAccountUpdate}
                          selectedAccount={this.state.selectedAccount}
                          DeployerContract={
                            this.state.drizzle.contracts.Deployer
                          }
                          foundNewContract={this.foundContractAddress}
                          foundContracts={this.state.ContractsList}
                        ></ContractsList>
                      </Col>
                    </Row>
                  </Content>
                </Layout>
              </Content>
            </Layout>
          )}
        </Layout>
      </HashRouter>
    );
  }
}

App.contextTypes = {
  drizzle: PropTypes.object
};

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    accountBalances: state.accountBalances,
    drizzleStatus: state.drizzleStatus,
    transactionStack: state.transactionStack,
    transactions: state.transactions
  };
};

const AppContainer = drizzleConnect(App, mapStateToProps);
export default AppContainer;
