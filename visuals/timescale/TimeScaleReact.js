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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZVNjYWxlUmVhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUaW1lU2NhbGVSZWFjdC50c3giXSwibmFtZXMiOlsiVGltZVNjYWxlIiwiVGltZVNjYWxlLmNvbnN0cnVjdG9yIiwiVGltZVNjYWxlLmNvbXBvbmVudERpZE1vdW50IiwiVGltZVNjYWxlLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJUaW1lU2NhbGUucmVuZGVyIiwiVGltZVNjYWxlLnJlbmRlckNvbnRlbnQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsSUFBWSxLQUFLLFdBQU0sT0FBTyxDQUFDLENBQUE7QUFDL0IsSUFBWSxRQUFRLFdBQU0sV0FBVyxDQUFDLENBQUE7QUFDdEMsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVCLDBCQUE4RCxhQUFhLENBQUMsQ0FBQTtBQVEzRSxDQUFDO0FBSUY7O0dBRUc7QUFDSDtJQUErQkEsNkJBQStDQTtJQUE5RUE7UUFBK0JDLDhCQUErQ0E7UUFHbkVBLFVBQUtBLEdBQW9CQSxFQUFFQSxDQUFDQTtJQWdDdkNBLENBQUNBO0lBOUJHRCxxQ0FBaUJBLEdBQWpCQTtRQUFBRSxpQkFTQ0E7UUFSR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLHFCQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxFQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFDQSxDQUFDQSxDQUFDQTtRQUFBQSxDQUN2R0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsZUFBZUEsRUFBRUEsVUFBQ0EsS0FBS0E7WUFDNUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO2dCQUNiQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxzQkFBc0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQzdDQSxDQUFDQTtRQUNMQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFFREYsNkNBQXlCQSxHQUF6QkEsVUFBMEJBLFFBQXlCQTtRQUMvQ0csSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDakNBLENBQUNBO0lBRURIOztPQUVHQTtJQUNIQSwwQkFBTUEsR0FBTkE7UUFDSUksTUFBTUEsQ0FBQ0EscUJBQUNBLEdBQUdBLEtBQUNBLEtBQUtBLEdBQUVBLEVBQUNBLEtBQUtBLEVBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUNBLE1BQU1BLEVBQUVBLEVBQU9BLENBQUNBO0lBQzdEQSxDQUFDQTtJQUVPSixpQ0FBYUEsR0FBckJBLFVBQXNCQSxLQUF1QkE7UUFDekNLLGtFQUFrRUE7UUFDbEVBLDZDQUE2Q0E7UUFDN0NBLEtBQUtBLEdBQUdBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBRTVCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUN2Q0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsR0FBR0EsS0FBS0EsQ0FBQ0EsYUFBYUEsSUFBSUEsSUFBSUEsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBQ0xMLGdCQUFDQTtBQUFEQSxDQUFDQSxBQW5DRCxFQUErQixLQUFLLENBQUMsU0FBUyxFQW1DN0M7QUFuQ1ksaUJBQVMsWUFtQ3JCLENBQUEifQ==