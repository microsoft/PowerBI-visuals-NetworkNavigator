import * as React from "react";
import * as ReactDOM from "react-dom";
import { LineUp, ILineUpRow, ILineUpColumn, ILineUpSettings } from "./LineUp";

export interface LineUpProps {
    dataStore: {
        getData() : PromiseLike<{ cols: ILineUpColumn[], rows: ILineUpRow[] }>;
    },
    onSelectionChanged: (selectedRows: ILineUpRow[]) => void;
};

export interface LineUpState { }

/**
 * Thin wrapper around LineUp
 */
export class LineUpComponent extends React.Component<LineUpProps, LineUpState> {
    private lineup: LineUp;
    private node: any;
    private selectionListener : any;
    public props : any;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.lineup = new LineUp($(this.node));
        this.lineup.events.on("canLoadMoreData", (info) => false);
        // this.lineup.events.on("loadMoreData", (info) => this.host.loadMoreData());
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

        // the code that used to be in `componentDidMount`
        // ReactDOM.render(<div>{props.children}</div>, this.node);
        if (props.dataStore) {
            props.dataStore.getData().then((value) => {
                this.lineup.loadData(value.cols, value.rows);
            });
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