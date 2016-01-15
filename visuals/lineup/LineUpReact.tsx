import * as React from "react";
import * as ReactDOM from "react-dom";
import { LineUp as LineUpImpl, ILineUpRow, ILineUpColumn, ILineUpSettings } from "./LineUp";

export interface LineUpProps {
    cols: ILineUpColumn[],
    rows: ILineUpRow[],
    multiSelect: boolean;
    singleSelect: boolean;
    selectable: boolean;
    inferColumnTypes: boolean;
    showHistograms: boolean;
    showValues: boolean;
    showAnimations: boolean;
    showStacked: boolean;
    onSelectionChanged: (selectedRows: ILineUpRow[]) => void;
    onCanLoadMoreData: (options: { result: boolean;}) => void;
};

export interface LineUpState { }

/**
 * Thin wrapper around LineUp
 */
export class LineUp extends React.Component<LineUpProps, LineUpState> {
    private lineup: LineUpImpl;
    private node: any;
    private selectionListener : any;
    private canLoadListener : any;
    public props : any;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.lineup = new LineUpImpl($(this.node));
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

        this.lineup.settings = this.getSettingsFromProps(props);
        this.lineup.selectionEnabled = !!props.selectable;
        if (props.rows && props.cols) {
            this.lineup.loadData(props.cols, props.rows);
        }

        if (this.selectionListener) {
            this.selectionListener.destroy();
        }

        if (props.onSelectionChanged) {
            this.selectionListener = this.lineup.events.on("selectionChanged", (rows) => props.onSelectionChanged(rows));
        } else if (this.selectionListener) {
            this.selectionListener.destroy();
        }

        if (props.onCanLoadMoreData) {
            this.canLoadListener = this.lineup.events.on("canLoadMoreData", (options) => props.onCanLoadMoreData(options));
        } else if (this.canLoadListener) {
            this.canLoadListener.destroy();
        }
    }

    /**
     * Converts the lineup props to settings
     */
    private getSettingsFromProps(props: LineUpProps) : ILineUpSettings {
        return {
            selection: {
                singleSelect: props.singleSelect,
                multiSelect: props.multiSelect,
            },
            data: {
                inferColumnTypes: props.inferColumnTypes
            },
            presentation: {
                values: props.showValues,
                stacked: props.showStacked,
                histograms: props.showHistograms,
                animation: props.showAnimations,
            },
        };
    }
}