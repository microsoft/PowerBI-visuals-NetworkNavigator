import * as React from "react";
import * as ReactDOM from "react-dom";
const $ = require("jquery");
import { AdvancedSlicer as AdvancedSlicerImpl } from "./AdvancedSlicer";

export interface IAdvancedSlicerProps {
    data: any[];
    serverSideSearch?: boolean;
    dimensions?: { width: number; height: number };
    showValues?: boolean;
    showSelections?: boolean;
    showHighlight?: boolean;
    onLoadMoreData(item: { result: boolean; }) : any;
    onCanLoadMoreData(item: { result: boolean; }, isSearch: boolean) : any;
    onSelectionChanged(newItems: any[], oldItems: any[]) : any;
};

export interface IAdvancedSlicerState { }

/**
 * Thin wrapper around LineUp
 */
export class AdvancedSlicer extends React.Component<IAdvancedSlicerProps, IAdvancedSlicerState> {
    private mySlicer: AdvancedSlicerImpl;
    private node: any;
    public props : IAdvancedSlicerProps;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.mySlicer = new AdvancedSlicerImpl($(this.node));
        this.attachEvents();
        this.renderContent();
    }

    componentWillReceiveProps(newProps : IAdvancedSlicerProps) {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    render() {
        return <div style={{width:"100%", height:"100%"}}></div>;
    }

    /**
     * Attaches events to the slicer
     */
    private attachEvents() {
        const guardedEventer = (evtName) => {
            return (...args) => {
                if (this.props[evtName]) {
                    this.props[evtName].apply(this, args);
                }
            };
        };
        this.mySlicer.events.on("loadMoreData", guardedEventer("OnLoadMoreData"));
        this.mySlicer.events.on("canLoadMoreData", guardedEventer("OnCanLoadMoreData"));
        this.mySlicer.events.on("selectionChanged", guardedEventer("OnSelectionChanged"));
    }

    private renderContent(props? : IAdvancedSlicerProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;

        this.mySlicer.showHighlight = props.showHighlight;
        this.mySlicer.showValues = props.showValues;
        this.mySlicer.showSelections = props.showSelections;
        this.mySlicer.serverSideSearch = props.serverSideSearch;
        this.mySlicer.data = props.data;
    }
}