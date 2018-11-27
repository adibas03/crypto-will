import React, { Component } from 'react';

function NetworkComponent (WrappedComonent) {
    return class extends Component {
        render () {
            if (!this.props.networkId) {
                return (
                    <div>
                        Loading Ethereum Network ...
                    </div>
                );
            } else {
                return (
                    <WrappedComonent {...this.props} />
                )
            }
        }
    }
}

export default NetworkComponent;