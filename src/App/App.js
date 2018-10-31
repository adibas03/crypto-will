import React, { Component } from "react";
import { Switch, Redirect } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';

import Accounts from "./Components/Accounts";
// import logo from "./logo.svg";
// import "./App.css";

import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Layout from 'antd/lib/layout';
import Row from 'antd/lib/row';

import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/layout/style';
import 'antd/lib/row/style';

const { Content } = Layout;

import { drizzleConnect } from "drizzle-react";
import { LoadingContainer, ContractData, ContractForm } from "drizzle-react-components";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selecedAccount: this.props.accounts[0]
    };

    this.updateSelectedAccount = this.updateSelectedAccount.bind(this);
  }

  updateSelectedAccount (event) {
    this.setState({ selecedAccount: event.key });
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
            <Layout style={{ margin: '16px 56px 0' }}>
                <h1 className="App-title">Crypto will</h1>
            </Layout>
            <Accounts {...{ accounts: this.props.accounts, selected: this.state.selecedAccount, selectAccount: this.updateSelectedAccount }} />
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
              <Row >
                <Col sm={14} xs={24} >
                  <BrowserRouter >
                    <div>
                      <Switch>
                        <Redirect exact from='/' to='/deploy'></Redirect>
                      </Switch>
                      <Route path='/contract' component={null}></Route>
                    </div>
                  </BrowserRouter >
                </Col>
                <Col sm={2} xs={24} >
                  <Col sm={24} xs={0} >
                    <Divider type='vertical' style={{ width: '2.5px' }} />
                  </Col>
                  <Col sm={0} xs={24} >
                    <Divider type='horizontal'style={{ height: '2.5px' }} />
                  </Col>
                </Col>
                <Col sm={8} xs={24} >
                </Col>
              </Row>
            </Content>
          </Layout>
        }
      </Layout>
    );
  }
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    accountBalances: state.accountBalances,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3,
    Deployer: state.contracts.Deployer,
    TutorialToken: state.contracts.TutorialToken,
    // WillWallet: state.contracts.WillWallet
  };
};

const AppContainer = drizzleConnect(App, mapStateToProps);
export default AppContainer;
// export default App;