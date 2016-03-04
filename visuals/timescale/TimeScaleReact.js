var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var TimeScale_1 = require("./TimeScale");
;
/**
 * Thin wrapper around TimeScale
 */
var TimeScale = (function (_super) {
    __extends(TimeScale, _super);
    function TimeScale() {
        _super.apply(this, arguments);
        this.props = {};
    }
    TimeScale.prototype.componentDidMount = function () {
        var _this = this;
        this.node = ReactDOM.findDOMNode(this);
        this.timescale = new TimeScale_1.TimeScale($(this.node), { width: this.props.width, height: this.props.height });
        +this.timescale.events.on("rangeSelected", function (range) {
            if (_this.props) {
                _this.props.onSelectedRangeChanged(range);
            }
        });
        this.renderContent();
    };
    TimeScale.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    TimeScale.prototype.render = function () {
        return React.createElement("div", {"style": { width: "100%", height: "100%" }});
    };
    TimeScale.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.timescale.data = props.data || [];
        this.timescale.selectedRange = props.selectedRange || null;
    };
    return TimeScale;
})(React.Component);
exports.TimeScale = TimeScale;
