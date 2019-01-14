const FormHelp = {
    deployer: {
        contractType: {
            '': 'Choose the desired contract type to be deployed',
            'Will': 'A Will contract allows you send desired coins/tokens to the contract, which can then only be distributed to the beneficiaries, only after the set WaitTime',
            'Wallet': 'A Wallet contract allows you send desired coins/tokens to the contract, which can be sent to any address by the contract creator like a normal external wallet',
            'WillWallet': 'A willWallet combines both features of the Will and Wallet allowing transfer to any address by the Contract creator, as well as distribution to beneficiaries after specified WaitTime'
        },
        waitTime: 'WaitTime indicates how long after the last interaction with the smart contract, before the held tokens/coins can be distributed among the beneficiaries. Months are calculated as 30 days, and years as 365 days'
    }
};

export { FormHelp }; 