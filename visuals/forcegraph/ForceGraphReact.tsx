import * as React from "react";
import * as ReactDOM from "react-dom";
import { ForceGraph as ForceGraphImpl, IForceGraphData, IForceGraphNode } from "./ForceGraph";

export interface IForceGraphProps {
    graph: IForceGraphData<IForceGraphNode>,
    onSelectionChanged: (node: IForceGraphNode) => void;
};

export interface IForceGraphState { }

/**
 * Thin wrapper around LineUp
 */
export class ForceGraph extends React.Component<IForceGraphProps, IForceGraphState> {
    private forcegraph: ForceGraphImpl;
    private node: any;
    private selectionListener : any;
    private canLoadListener : any;
    public props : IForceGraphProps;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.forcegraph = new ForceGraphImpl($(this.node));
        this.forcegraph.events.on("selectionChanged", (node) => {
            if (this.props.onSelectionChanged) {
                this.props.onSelectionChanged(node);
            }
        });
        this.forcegraph.dimensions = { width: $(this.node).width(), height: $(this.node).height() };
    }

    componentWillReceiveProps(newProps : IForceGraphProps) {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    render() {
        return <div style={{width:"100%", height:"100%"}}></div>;
    }

    private renderContent(props? : IForceGraphProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        if (this.selectionListener) {
            this.selectionListener.destroy();
        }

        if (props.onSelectionChanged) {
            this.selectionListener = this.forcegraph.events.on("selectionChanged", (rows) => props.onSelectionChanged(rows));
        } else if (this.selectionListener) {
            this.selectionListener.destroy();
        }
    }
}