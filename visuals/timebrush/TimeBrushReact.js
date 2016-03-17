"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var TimeBrush_1 = require("./TimeBrush");
;
/**
 * Thin wrapper around TimeBrush
 */
var TimeBrush = (function (_super) {
    __extends(TimeBrush, _super);
    function TimeBrush() {
        _super.apply(this, arguments);
        this.props = {};
    }
    TimeBrush.prototype.componentDidMount = function () {
        var _this = this;
        this.node = ReactDOM.findDOMNode(this);
        this.timeBrush = new TimeBrush_1.TimeBrush($(this.node), { width: this.props.width, height: this.props.height });
        +this.timeBrush.events.on("rangeSelected", function (range) {
            if (_this.props) {
                _this.props.onSelectedRangeChanged(range);
            }
        });
        this.renderContent();
    };
    TimeBrush.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    TimeBrush.prototype.render = function () {
        return React.createElement("div", {style: { width: "100%", height: "100%" }});
    };
    TimeBrush.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.timeBrush.data = props.data || [];
        this.timeBrush.selectedRange = props.selectedRange || null;
    };
    return TimeBrush;
}(React.Component));
exports.TimeBrush = TimeBrush;
