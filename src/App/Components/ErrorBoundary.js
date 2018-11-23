import React, { Component } from 'react';

import notification from 'antd/lib/notification';

import 'antd/lib/notification/style';

function ErrorBoundary (WrappedComponent) {
    
    return class extends Component {
        componentDidCatch (error) {
            notification['error']({
                message: 'Error occurred in component',
                description: error.message || e
            });
        }

        render () {
            return <WrappedComponent {...this.props} />;
        }
    }
}

export default ErrorBoundary;