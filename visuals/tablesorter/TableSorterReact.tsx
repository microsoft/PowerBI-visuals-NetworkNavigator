import * as React from "react";
import * as ReactDOM from "react-dom";
const $ = require("jquery");
import { TableSorter as TableSorterImpl } from "./TableSorter";
import { ITableSorterRow, ITableSorterColumn, ITableSorterSettings, ITableSorterConfiguration, IDataProvider, IQueryOptions, IQueryResult } from "./models";
import { JSONDataProvider } from "./providers/JSONDataProvider";

export interface TableSorterProps {
    cols: ITableSorterColumn[],
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
    onSelectionChanged?: (selectedRows: ITableSorterRow[]) => void;
    onFilterChanged?: (filter: { column: string; value: string|{ domain: [number,number];range:[number,number]}}) => void;
    onLoadMoreData?: () => void;
};

export interface TableSorterState { }

/**
 * Thin wrapper around TableSorter
 */
export class TableSorter extends React.Component<TableSorterProps, TableSorterState> {
    private tableSorter: TableSorterImpl;
    private node: any;
    private selectionListener : any;
    private canLoadListener : any;
    public props : TableSorterProps;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.tableSorter = new TableSorterImpl($(this.node));
        this.attachEvents();
        this.renderContent();
    }

    componentWillReceiveProps(newProps : TableSorterProps) {
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
        this.tableSorter.events.on(TableSorterImpl.EVENTS.SELECTION_CHANGED, guardedEventer('onSelectionChanged'));
        this.tableSorter.events.on(TableSorterImpl.EVENTS.LOAD_MORE_DATA, guardedEventer('onLoadMoreData'));
        this.tableSorter.events.on(TableSorterImpl.EVENTS.FILTER_CHANGED, guardedEventer('onFilterChanged'));
        this.tableSorter.events.on(TableSorterImpl.EVENTS.SORT_CHANGED, guardedEventer('onSortChanged'));
    }

    private renderContent(props? : TableSorterProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;

        this.tableSorter.settings = this.getSettingsFromProps(props);
        this.tableSorter.count = props.count || 100;
        if (props.provider && props.cols) {
            let config : ITableSorterConfiguration = this.tableSorter.configuration || {
                primaryKey: props.cols[0].column,
                columns: []
            };
            config.columns = props.cols;
            this.tableSorter.configuration = config;
        }
        this.tableSorter.dataProvider = props.provider;
    }

    /**
     * Converts the tablesorter props to settings
     */
    private getSettingsFromProps(props: TableSorterProps) : ITableSorterSettings {
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