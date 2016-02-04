import * as React from "react";
import * as ReactDOM from "react-dom";
const $ = require("jquery");
import { LineUp as LineUpImpl } from "./LineUp";
import { ILineUpRow, ILineUpColumn, ILineUpSettings, ILineUpConfiguration, IDataProvider, IQueryOptions, IQueryResult } from "./models";
import { JSONDataProvider } from "./providers/JSONDataProvider";

export interface LineUpProps {
    cols: ILineUpColumn[],
    provider: IDataProvider;
    multiSelect?: boolean;
    count?: number;
    singleSelect?: boolean;
    inferColumnTypes?: boolean;
    showHistograms?: boolean;
    showValues?: boolean;
    showAnimations?: boolean;
    showStacked?: boolean;
    onSortChanged?: (column: string, asc: boolean) => void;
    onSelectionChanged?: (selectedRows: ILineUpRow[]) => void;
    onFilterChanged?: (filter: { column: string; value: string|{ domain: [number,number];range:[number,number]}}) => void;
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
        this.lineup.events.on(LineUpImpl.EVENTS.SELECTION_CHANGED, guardedEventer('onSelectionChanged'));
        this.lineup.events.on(LineUpImpl.EVENTS.LOAD_MORE_DATA, guardedEventer('onLoadMoreData'));
        this.lineup.events.on(LineUpImpl.EVENTS.FILTER_CHANGED, guardedEventer('onFilterChanged'));
        this.lineup.events.on(LineUpImpl.EVENTS.SORT_CHANGED, guardedEventer('onSortChanged'));
    }

    private renderContent(props? : LineUpProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;

        this.lineup.settings = this.getSettingsFromProps(props);
        this.lineup.count = props.count || 100;
        if (props.provider && props.cols) {
            let config : ILineUpConfiguration = this.lineup.configuration || {
                primaryKey: props.cols[0].column,
                columns: []
            };
            config.columns = props.cols;
            this.lineup.configuration = config;
        }
        this.lineup.dataProvider = props.provider;
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