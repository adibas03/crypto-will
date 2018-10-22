import React, { Component } from "react";
import Accounts from "./Components/Accounts";
// import logo from "./logo.svg";
// import "./App.css";

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
            <Layout >
                <h1 className="App-title">Crypto will</h1>
            </Layout>
            <Accounts {...{ accounts: this.props.accounts, selected: this.state.selecedAccount, selectAccount: this.updateSelectedAccount }} />
            <Content className="App-intro">
              
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