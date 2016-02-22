import * as React from "react";
import * as ReactDOM from "react-dom";
const $ = require("jquery");
import { TimeScale as TimeScaleImpl, TimeScaleDataItem } from "./TimeScale";

export interface TimeScaleProps {
    selectedRange?: [Date, Date];
    onSelectedRangeChanged?: (range: [Date, Date]) => void;
    data?: TimeScaleDataItem[],
    width?: number;
    height?: number;
};

export interface TimeScaleState { }

/**
 * Thin wrapper around TimeScale
 */
export class TimeScale extends React.Component<TimeScaleProps, TimeScaleState> {
    private timescale: TimeScaleImpl;
    private node: any;
    public props : TimeScaleProps = {};

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.timescale = new TimeScaleImpl($(this.node), {width: this.props.width, height: this.props.height});+
        this.timescale.events.on("rangeSelected", (range) => {            
            if (this.props) {
                this.props.onSelectedRangeChanged(range);
            }
        });
        this.renderContent();
    }

    componentWillReceiveProps(newProps : TimeScaleProps) {
        this.renderContent(newProps);
    }

    /**
     * Renders this component
     */
    render() {
        return <div style={{width:"100%", height:"100%"}}></div>;
    }

    private renderContent(props? : TimeScaleProps) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;

        this.timescale.data = props.data || [];
        this.timescale.selectedRange = props.selectedRange || null;
    }
}