import * as React from "react";
import * as ReactDOM from "react-dom";
const $ = require("jquery");
import { LineUp as LineUpImpl, ILineUpRow, ILineUpColumn, ILineUpSettings } from "./LineUp";

export interface LineUpProps {
    cols: ILineUpColumn[],
    rows: ILineUpRow[],
    multiSelect?: boolean;
    singleSelect?: boolean;
    selectable?: boolean;
    inferColumnTypes?: boolean;
    showHistograms?: boolean;
    showValues?: boolean;
    showAnimations?: boolean;
    showStacked?: boolean;
    onSelectionChanged?: (selectedRows: ILineUpRow[]) => void;
    onCanLoadMoreData?: (options: { result: boolean;}) => void;
    onLoadMoreData?: () => void;
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
    public props : LineUpProps;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.lineup = new LineUpImpl($(this.node));
        this.attachEvents();
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

    /**
     * Attaches the events
     */
    private attachEvents() {
        const guardedEventer = (evtName) => {
            return (...args) => {
                if (this.props[evtName]) {
                    this.props[evtName].apply(this, args);
                }
            };
        };
        this.lineup.events.on("selectionChanged", guardedEventer('onSelectionChanged'));
        this.lineup.events.on("canLoadMoreData", guardedEventer('onCanLoadMoreData'));
        this.lineup.events.on("loadMoreData", guardedEventer('onLoadMoreData'));
    }

    private renderContent(props? : LineUpProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;

        this.lineup.settings = this.getSettingsFromProps(props);
        this.lineup.selectionEnabled = !!props.selectable;
        if (props.rows && props.cols) {
            this.lineup.setData(/*props.cols, */props.rows);
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
            presentation: {
                values: props.showValues,
                stacked: props.showStacked,
                histograms: props.showHistograms,
                animation: props.showAnimations,
            },
        };
    }
}