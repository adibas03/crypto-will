import React from "react";
import ReactDOM from "react-dom";
// import "./index.css";

import "./Style";
import App from "./App";
// import registerServiceWorker from "./registerServiceWorker";
import { DrizzleProvider } from "@drizzle/react-plugin";

// Import contract
import Deployer from "../build/contracts/Deployer.json";

const options = {
  web3: {
    //   block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545"
    }
  },
  contracts: [Deployer],
  // events: {},
  polls: {
    accounts: 100,
    blocks: 10000
  }
};

const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.appendChild(root);

ReactDOM.render(
  <DrizzleProvider options={options}>
    <App />
  </DrizzleProvider>,
  document.getElementById("root")
);
