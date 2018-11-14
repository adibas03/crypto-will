const web3Scripts = {
    async deployContract ({Deployer, fromAddress, type, args, onTransactionHash, onReceipt}) {
        if (!Deployer) {
            throw('Deployer instance not available');
        }
        let idx;
        try {
            switch (type) {
                case 'Will':
                    idx = Deployer.methods.deployWill(args['waitTime']).send(
                        {
                            from: fromAddress
                        });
                    break;
                case 'Wallet':
                    idx = Deployer.methods.deployWallet().send({
                        from: fromAddress
                    });
                    break;
                case 'WillWallet':
                    idx = Deployer.methods.deployWillWallet(args['waitTime']).send({
                        from: fromAddress
                    });
                    break;
            }
            idx
            .on('transactionHash', onTransactionHash)
            .on('receipt', onReceipt);
            return idx;
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