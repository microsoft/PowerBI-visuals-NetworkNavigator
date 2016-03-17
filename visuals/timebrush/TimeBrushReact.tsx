import * as React from "react";
import * as ReactDOM from "react-dom";
const $ = require("jquery");
import { TimeBrush as TimeBrushImpl, TimeBrushDataItem } from "./TimeBrush";

export interface TimeBrushProps {
    selectedRange?: [Date, Date];
    onSelectedRangeChanged?: (range: [Date, Date]) => void;
    data?: TimeBrushDataItem[],
    width?: number;
    height?: number;
};

export interface TimeBrushState { }

/**
 * Thin wrapper around TimeBrush
 */
export class TimeBrush extends React.Component<TimeBrushProps, TimeBrushState> {
    private timeBrush: TimeBrushImpl;
    private node: any;
    public props : TimeBrushProps = {};

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.timeBrush = new TimeBrushImpl($(this.node), {width: this.props.width, height: this.props.height});+
        this.timeBrush.events.on("rangeSelected", (range) => {            
            if (this.props) {
                this.props.onSelectedRangeChanged(range);
            }
        });
        this.renderContent();
    }

    componentWillReceiveProps(newProps : TimeBrushProps) {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    render() {
        return <div style={{width:"100%", height:"100%"}}></div>;
    }

    private renderContent(props? : TimeBrushProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;

        this.timeBrush.data = props.data || [];
        this.timeBrush.selectedRange = props.selectedRange || null;
    }
}