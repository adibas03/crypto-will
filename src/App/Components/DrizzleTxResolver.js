import React, { Component } from 'react';
import PropTypes from "prop-types";
import { Timers } from '../../Config';

const WATCH_TX_INTERVAL = Timers.watchTxTimeout;

class DrizzleTxResolver extends Component {

    constructor (props) {
        super(props);

        this.watchTxStack = this.watchTxStack.bind(this);
        this.watchTransaction = this.watchTransaction.bind(this);
    }

    async watchTxStack (txStack) {
        if (!this._mounted) {
            return;
        }

        const { transactionStack, transactions } = this.props;

        return new Promise((resolve) => {
            if (transactionStack[txStack]) {
                const tx = transactionStack[txStack];
                if (new RegExp(/TEMP.*/).test(tx)) {
                    if (!transactions[tx]) {
                        setTimeout(() => resolve(this.watchTxStack(txStack)), WATCH_TX_INTERVAL);
                    } else {
                        resolve(tx);
                    }
                } else {
                    resolve(tx);
                }
            } else {
                setTimeout(() => resolve(this.watchTxStack(txStack)), WATCH_TX_INTERVAL);
            }
        });
    }

    watchTransaction (tx, { onError, onChanged, onReceipt }, lastStatus) {
        const { transactions } = this.props;

        if (transactions[tx] && transactions[tx].status) {
            const transaction = transactions[tx];
            if (transaction.status === 'error') {
                onError && onError(transaction.error.message || transaction.error);
            } else if (transaction.status === 'pending') {
                if (lastStatus !== 'pending') {
                    onChanged && onChanged(tx);
                }
                setTimeout(() => this.watchTransaction(tx, { onError, onChanged, onReceipt }, 'pending'), WATCH_TX_INTERVAL);
            } else if (transaction.status === 'success') {
                onReceipt && onReceipt(transaction.receipt);
            }
        } else {
            setTimeout(() => this.watchTransaction(tx, { onError, onChanged, onReceipt }), WATCH_TX_INTERVAL);
        }
    }

    async componentDidMount () {
        this._mounted = true;
    }

    async componentWillUnmount () {
        this._mounted = false;
    }
}

DrizzleTxResolver.propTypes = {
    transactionStack: PropTypes.array.isRequired,
    transactions: PropTypes.object.isRequired
}

export default DrizzleTxResolver;