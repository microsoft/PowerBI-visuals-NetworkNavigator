/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { NetworkNavigator as NetworkNavigatorImpl } from "../NetworkNavigator";
import {
    INetworkNavigatorData,
    INetworkNavigatorNode,
    INetworkNavigatorConfiguration,
} from "../models";

import "../css/NetworkNavigator.scss";

export interface INetworkNavigatorProps {
    graph: INetworkNavigatorData<INetworkNavigatorNode>;
    config?: INetworkNavigatorConfiguration;
    onSelectionChanged: (node: INetworkNavigatorNode) => void;
};

export interface INetworkNavigatorState { }

/**
 * Thin wrapper around LineUp
 */
export class NetworkNavigator extends React.Component<INetworkNavigatorProps, INetworkNavigatorState> {
    public props: INetworkNavigatorProps;
    private networkNavigator: NetworkNavigatorImpl;
    private node: any;
    private selectionListener: any;

    public componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.networkNavigator = new NetworkNavigatorImpl($(this.node));
        this.networkNavigator.events.on("selectionChanged", (node: INetworkNavigatorNode) => {
            if (this.props.onSelectionChanged) {
                this.props.onSelectionChanged(node);
            }
        });
        this.networkNavigator.dimensions = { width: $(this.node).width(), height: $(this.node).height() };
        this.renderContent();
    }

    public componentWillReceiveProps(newProps: INetworkNavigatorProps) {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    public render() {
        return <div style={{width:"100%", height:"100%"}}></div>;
    }

    private renderContent(props?: INetworkNavigatorProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        if (this.selectionListener) {
            this.selectionListener.destroy();
        }

        this.networkNavigator.data = props.graph;

        if (props.config) {
            this.networkNavigator.configuration = props.config;
        }

        if (props.onSelectionChanged) {
            this.selectionListener =
                this.networkNavigator.events.on("selectionChanged", (nodes: INetworkNavigatorNode) => props.onSelectionChanged(nodes));
        } else if (this.selectionListener) {
            this.selectionListener.destroy();
        }
    }
}
