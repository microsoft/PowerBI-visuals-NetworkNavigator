import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import {
    NetworkNavigator as NetworkNavigatorImpl,
    INetworkNavigatorData,
    INetworkNavigatorNode,
    INetworkNavigatorConfiguration,
} from "./NetworkNavigator";

import "./css/NetworkNavigator.scss";

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
