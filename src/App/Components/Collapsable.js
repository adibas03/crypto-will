import React, { Component } from 'react';
import PropTypes from "prop-types";

import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Layout from 'antd/lib/layout';

import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/layout/style';

class Collapsable extends Component {

    constructor (props) {
        super(props);

        this.state = {
            collapsed: props.opened ? false : true
        }
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    toggleCollapse () {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render () {
        const { title, children, opened, ...others } = this.props;
        return (
            <Layout {...others}>
                <Col span={24} style={{ cursor: 'pointer', margin: '0 0 12px' }}>
                    <div onClick={this.toggleCollapse} >
                        {typeof title === 'string' &&
                            <h3>
                                {title}
                            </h3>
                        }
                        {typeof title === 'object' &&
                            title
                        }
                        <Divider style={{ height: '1px', margin: '0' }} />
                    </div>
                </Col>
                <Col span={24} >
                    { !this.state.collapsed && children }
                </Col>
            </Layout>
        );
    }
}

Collapsable.propTypes = {
    opened: PropTypes.bool,
    title: PropTypes.any.isRequired,
    children: PropTypes.object.isRequired
}

export default Collapsable;