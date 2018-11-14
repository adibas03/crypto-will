import React, { Component } from "react";
import { Switch, Redirect } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import Accounts from "./Components/Accounts";
import ContractsList from "./Components/ContractsList";
import Deployer from "./Components/Deployer";

import Alert from 'antd/lib/alert';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Layout from 'antd/lib/layout';
import Row from 'antd/lib/row';

import 'antd/lib/alert/style';
import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/layout/style';
import 'antd/lib/row/style';

const { Content } = Layout;

import { drizzleConnect } from "drizzle-react";
import { LoadingContainer } from "drizzle-react-components";

class App extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      drizzle: context.drizzle
    };

    this.updateSelectedAccount = this.updateSelectedAccount.bind(this);
  }

  updateSelectedAccount (event) {
    this.setState({ selectedAccount: event.key });
  }

  render() {
    const { drizzleStatus } = this.props;

    return (
      <Layout className="App">
        { !drizzleStatus.initialized &&
          <LoadingContainer>
            <div></div>
          </LoadingContainer>
        }
        { drizzleStatus.initialized &&
          <Layout>
            <Content>
              <Layout style={{ margin: '16px 56px 0' }}>
                  <h1 className="App-title">Crypto will</h1>
              </Layout>
              <Layout>
                <Accounts {...{ accounts: this.props.accounts, selected: this.state.selectedAccount, selectAccount: this.updateSelectedAccount }} />
              </Layout>
              <Layout>
                <Content className="App-intro" style={{ margin: '0 56px' }}>
                  <Row style={{ margin: '56px 0' }}>
                    <Col >
                      <p>
                        Crypto Will, is a tool to deploy your personal will on the Ethereum blockchain.<br/>
                        You can add beneficiaries, delete beneficiaries, set their percentage, also set the Waiting period before the wealth can be disposed.
                      </p>
                      <Divider style={{ height: '2.5px', margin: '0' }} />
                    </Col>
                  </Row>
                  { !this.state.selectedAccount &&
                    <Alert
                      description="Please select / Unlock an Account/Address to continue."
                      type="info"
                    />
                  }
                  <Row >
                    <Col md={15} sm={24}  >
                      <BrowserRouter sm={22} >
                        <div>
                          <Switch>
                            <Redirect exact from='/' to='/deploy'></Redirect>
                          </Switch>
                          <Route path='/deploy' render= {(props) => <Deployer {...props} selectedAccount={this.state.selectedAccount} DeployerContract={this.state.drizzle.contracts.Deployer} transactionStack={this.props.transactionStack} transactions={this.props.transactions}/>} ></Route>
                          <Route path='/contract' component={null}></Route>
                        </div>
                      </BrowserRouter >
                    </Col>
                    <Col md={1} sm={24} >
                      <Col md={1} sm={0} >
                          <Divider type='vertical' style={{ width: '2.5px', 'minHeight': '200px', 'marginLeft': '25px' }} />
                      </Col>
                      <Col md={0} sm={24} >
                        <Divider type='horizontal'style={{ height: '2.5px' }} />
                      </Col>
                    </Col>
                    <Col md={8} sm={24}  >
                      <ContractsList></ContractsList>
                    </Col>
                  </Row>
                  { JSON.stringify(this.props.drizzleState) }
                </Content>
              </Layout>
            </Content>
          </Layout>
        }
      </Layout>
    );
  }
}

App.contextTypes = {
  drizzle: PropTypes.object
}

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