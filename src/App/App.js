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
  }

  render() {
    const { drizzleStatus } = this.props;

    if (drizzleStatus.initialized) {
      return (
          <div className="App">
            <header className="App-header">
              <h1 className="App-title">Crypto will</h1>
              <Accounts {...{ accounts: this.props.accounts, selected: this.state.selecedAccount }} />
              <h3>Send Tokens</h3>
            </header>
            <div className="App-intro">
              
            </div>
          </div>
      );
    } else {
      return (<div><LoadingContainer><div></div></LoadingContainer></div>);
    }
  }
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    accountBalances: state.accountBalances,
    drizzleStatus: state.drizzleStatus,
    Deployer: state.contracts.Deployer,
    TutorialToken: state.contracts.TutorialToken,
    // WillWallet: state.contracts.WillWallet
  };
};

const AppContainer = drizzleConnect(App, mapStateToProps);
export default AppContainer;
// export default App;