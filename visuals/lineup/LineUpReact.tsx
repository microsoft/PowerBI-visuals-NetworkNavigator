import * as React from "react";
import * as ReactDOM from "react-dom";
import { LineUp as LineUpImpl, ILineUpRow, ILineUpColumn, ILineUpSettings } from "./LineUp";

export interface LineUpProps {
    cols: ILineUpColumn[],
    rows: ILineUpRow[],
    onSelectionChanged: (selectedRows: ILineUpRow[]) => void;
};

export interface LineUpState { }

/**
 * Thin wrapper around LineUp
 */
export class LineUp extends React.Component<LineUpProps, LineUpState> {
    private lineup: LineUpImpl;
    private node: any;
    private selectionListener : any;
    public props : any;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.lineup = new LineUpImpl($(this.node));
        this.lineup.events.on("canLoadMoreData", (info) => false);
        this.renderContent();
    }

    componentWillReceiveProps(newProps : LineUpProps) {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    render() {
        return <div style={{width:"100%", height:"100%"}}></div>;
    }

    private renderContent(props? : LineUpProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;

        if (props.rows && props.cols) {
            this.lineup.loadData(props.cols, props.rows);
        }

        if (this.selectionListener) {
            this.selectionListener.destroy();
        }

        if (props.onSelectionChanged) {
            this.selectionListener = this.lineup.events.on("selectionChanged", (rows) => this.onSelectionChanged(rows));
        }
    }

    /**
     * Selects the given rows
     */
    private onSelectionChanged(rows) {
    }
}