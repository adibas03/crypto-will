import React, { Component } from 'react';

import notification from 'antd/lib/notification';

import 'antd/lib/notification/style';

function ErrorBoundary (WrappedComponent) {
    
    return class extends Component {
        state = {
            hasError: false
        }

        componentDidCatch (error) {
            this.setState({ hasError: true });
            notification['error']({
                duration: 0,
                message: 'Error occurred in component',
                description: error.message || e
            });
        }

        render () {

            return this.state.hasError ?
                <div> React to Houston... We have a problem!!!</div>
                : <WrappedComponent {...this.props} />;
        }
    }
}

export default ErrorBoundary;