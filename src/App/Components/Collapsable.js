import React, { Component } from 'react';
import PropTypes from "prop-types";

import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Icon from 'antd/lib/icon';
import Layout from 'antd/lib/layout';

import 'antd/lib/col/style';
import 'antd/lib/divider/style';
import 'antd/lib/icon/style';
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
        const Title = title;
        return (
            <Layout {...others}>
                <Col onClick={this.toggleCollapse} span={24} style={{ cursor: 'pointer', margin: '0 0 12px' }}>
                    <div style={{minHeight: '24px'}} >
                        {typeof title === 'string' &&
                            <h3>
                                {title} <Icon type={this.state.collapsed ? 'caret-right' : 'caret-down'} style={{marginLeft: '12px', color: 'gray'}}/>
                            </h3>
                        }
                        {typeof title === 'object' &&
                            {title}
                        }
                        {typeof title === 'function' && 
                            <Title collapsed={this.state.collapsed} toggleCollapse={this.toggleCollapse} />
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