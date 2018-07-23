import React, { Component } from "react";
// import logo from "./logo.svg";
// import "./App.css";

import { drizzleConnect } from "drizzle-react";
import { LoadingContainer, ContractData, ContractForm } from "drizzle-react-components";

class App extends Component {
  constructor(props, context) {
    console.log(props);
    console.log(context)
  }

  render() {
    const { drizzleStatus, accounts } = this.props;
    console.log(drizzleStatus)
    console.log(this.props)

    if (drizzleStatus.initialized) {
    console.log(drizzleStatus)

    return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Tutorial Token</h1>
            x
            <h3>Send Tokens</h3>
          </header>
          <div className="App-intro">
            
          </div>
        </div>
      );
    }

    return (<div><LoadingContainer/></div>);
  }
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    accountBalances: state.accountBalances,
    drizzleStatus: state.drizzleStatus,
    TutorialToken: state.contracts.TutorialToken
  };
};

const AppContainer = drizzleConnect(App, mapStateToProps);
export default AppContainer;
// export default App;