const web3Scripts = {
    async deployContract ({Deployer, transactionStack, transactions, fromAddress, type, args, notifier}) {
        if (!Deployer) {
            throw('Deployer instance not available');
        }
        console.log(Deployer, fromAddress, type, args)
        console.log(transactionStack, transactions)
        let idx;
        try {
            switch (type) {
                case 'Will':
                    idx = await Deployer.methods.deployWill().send(
                        args['waitTime'],
                        {
                            from: fromAddress
                        });
                    break;
                case 'Wallet':
                    // idx = await Deployer.methods.deployWallet().send({
                    idx = await Deployer.methods.deployWallet.send({
                        from: fromAddress
                    });
                    break;
            }
            if (transactionStack[idx]) {
                this.awaitTransactionConfirmation(transactions, transactionStack[idx], notifier);
            } else {
                throw('Transaction details could not be retrieved');
            }
        } catch (e) {
            throw e;
        }
    },
    awaitTransactionConfirmation (transactions, idx, notifier, count=0) {
        const tx = transactions[idx];
        if (tx.status === 'pending') {
            if (count === 0) {
                notification['info']({
                    message: 'Transaction created',
                    description: `${idx} created, Awaiting confirmation`
                });
            }
            setTimeout(() => this.awaitTransactionConfirmation(transactions, idx, notifier, ++count), 2500);
        } else if (tx.status === 'success') {
            notification['success']({
                message: 'Transaction confirmed',
                description: `${idx} successfully confirmed`
            });
        }

    },
    watchWeb3Addresses (web3, ) {

    }
}

export { web3Scripts };