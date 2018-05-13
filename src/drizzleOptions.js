import Will from './../build/contracts/Will.json'
import Wallet from './../build/contracts/Wallet.json'
import WillWallet from './../build/contracts/WillWallet.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    Will,
    Wallet,
    WillWallet
  ],
  events: {
    Will: ['BeneficiaryUpdated']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions