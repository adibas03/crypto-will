const FormHelp = {
    deployer: {
        contractType: {
            '': 'Choose the desired contract type to be deployed',
            'Will': 'A Will contract allows you send desired coins/tokens to the contract, which can then only be distributed to the beneficiaries, only after the set WaitTime',
            'Wallet': 'A Wallet contract allows you send desired coins/tokens to the contract, which can be sent to any address by the contract creator like a normal external wallet',
            'WillWallet': 'A willWallet combines both features of the Will and Wallet allowing transfer to any address by the Contract creator, as well as distribution to beneficiaries after specified WaitTime'
        },
        waitTime: 'WaitTime indicates how long after the last interaction with the smart contract, before the held tokens/coins can be distributed among the beneficiaries. Months are calculated as 30 days, and years as 365 days'
    },
    addNewBeneficiary: 'Add another Beneficiary',
    removeBeneficiary: 'Remove/Delete Beneficiary',
    newBeneficiary: 'The ethereum address you want to add as a beneficiary for the Will',
    newBeneficiaryDisposition: 'The desired portion to allocate to the address',
    newBeneficiaryDispositionPercentage: 'The desired percentage of the Will to allocate to the address',
    newBeneficiaryDispositionValue: 'The actual value based on the present contract balance',
    postpone: 'Push disbursement time forward by another cycle',
    recipientAddress: 'Address of the reciever',
    recipientValue: 'Amount to send to the reciever in Ether',
    updateContract: 'Store changes to contract'
};

export { FormHelp }; 