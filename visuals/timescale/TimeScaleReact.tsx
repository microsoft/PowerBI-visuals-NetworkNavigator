import * as React from "react";
import * as ReactDOM from "react-dom";
import { TimeScale as TimeScaleImpl, TimeScaleDataItem } from "./TimeScale";

export interface TimeScaleProps {
    selectedRange: [Date, Date];
    onSelectedRangeChanged: (range: [Date, Date]) => void;
    data: TimeScaleDataItem[]
};

export interface TimeScaleState { }

/**
 * Thin wrapper around LineUp
 */
export class LineUp extends React.Component<TimeScaleProps, TimeScaleState> {
    private timescale: TimeScaleImpl;
    private node: any;
    private selectionListener : any;
    public props : TimeScaleProps;

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.timescale = new TimeScaleImpl($(this.node));
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

        if (props.data) {
            this.timescale.data = props.data;
        }

        if (this.selectionListener) {
            this.selectionListener.destroy();
        }

        if (props.onSelectedRangeChanged) {
            this.selectionListener = this.timescale.events.on("rangeSelected", (range) => props.onSelectedRangeChanged(range));
        } else if (this.selectionListener) {
            this.selectionListener.destroy();
        }
    }
}