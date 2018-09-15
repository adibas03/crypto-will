import React, { Component } from "react";
// import logo from "./logo.svg";
// import "./App.css";

import { drizzleConnect } from "drizzle-react";
import { LoadingContainer, ContractData, ContractForm } from "drizzle-react-components";

class App extends Component {
  }

  render() {
    const { drizzleStatus, accounts } = this.props;

    if (drizzleStatus.initialized) {
          </div>
        </div>
      );
    } else {
      return (<div><LoadingContainer/></div>);
    }
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