var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var AdvancedSlicer_1 = require("./AdvancedSlicer");
;
/**
 * Thin wrapper around LineUp
 */
var AdvancedSlicer = (function (_super) {
    __extends(AdvancedSlicer, _super);
    function AdvancedSlicer() {
        _super.apply(this, arguments);
    }
    AdvancedSlicer.prototype.componentDidMount = function () {
        this.node = ReactDOM.findDOMNode(this);
        this.mySlicer = new AdvancedSlicer_1.AdvancedSlicer($(this.node));
        this.attachEvents();
        this.renderContent();
    };
    AdvancedSlicer.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    AdvancedSlicer.prototype.render = function () {
        return React.createElement("div", {"style": { width: "100%", height: "100%" }});
    };
    /**
     * Attaches events to the slicer
     */
    AdvancedSlicer.prototype.attachEvents = function () {
        var _this = this;
        var guardedEventer = function (evtName) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (_this.props[evtName]) {
                    _this.props[evtName].apply(_this, args);
                }
            };
        };
        this.mySlicer.events.on("loadMoreData", guardedEventer("onLoadMoreData"));
        this.mySlicer.events.on("canLoadMoreData", guardedEventer("onCanLoadMoreData"));
        this.mySlicer.events.on("selectionChanged", guardedEventer("onSelectionChanged"));
    };
    AdvancedSlicer.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.mySlicer.showHighlight = props.showHighlight;
        this.mySlicer.showValues = props.showValues;
        this.mySlicer.showSelections = props.showSelections;
        this.mySlicer.serverSideSearch = props.serverSideSearch;
        this.mySlicer.data = props.data;
    };
    return AdvancedSlicer;
})(React.Component);
exports.AdvancedSlicer = AdvancedSlicer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWR2YW5jZWRTbGljZXJSZWFjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFkdmFuY2VkU2xpY2VyUmVhY3QudHN4Il0sIm5hbWVzIjpbIkFkdmFuY2VkU2xpY2VyIiwiQWR2YW5jZWRTbGljZXIuY29uc3RydWN0b3IiLCJBZHZhbmNlZFNsaWNlci5jb21wb25lbnREaWRNb3VudCIsIkFkdmFuY2VkU2xpY2VyLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJBZHZhbmNlZFNsaWNlci5yZW5kZXIiLCJBZHZhbmNlZFNsaWNlci5hdHRhY2hFdmVudHMiLCJBZHZhbmNlZFNsaWNlci5yZW5kZXJDb250ZW50Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLElBQVksS0FBSyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0FBQy9CLElBQVksUUFBUSxXQUFNLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QiwrQkFBcUQsa0JBQWtCLENBQUMsQ0FBQTtBQVl2RSxDQUFDO0FBSUY7O0dBRUc7QUFDSDtJQUFvQ0Esa0NBQTJEQTtJQUEvRkE7UUFBb0NDLDhCQUEyREE7SUFrRC9GQSxDQUFDQTtJQTdDR0QsMENBQWlCQSxHQUFqQkE7UUFDSUUsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLCtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1FBQ3BCQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFFREYsa0RBQXlCQSxHQUF6QkEsVUFBMEJBLFFBQStCQTtRQUNyREcsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDakNBLENBQUNBO0lBRURIOztPQUVHQTtJQUNIQSwrQkFBTUEsR0FBTkE7UUFDSUksTUFBTUEsQ0FBQ0EscUJBQUNBLEdBQUdBLEtBQUNBLEtBQUtBLEdBQUVBLEVBQUNBLEtBQUtBLEVBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUNBLE1BQU1BLEVBQUVBLEVBQU9BLENBQUNBO0lBQzdEQSxDQUFDQTtJQUVESjs7T0FFR0E7SUFDS0EscUNBQVlBLEdBQXBCQTtRQUFBSyxpQkFXQ0E7UUFWR0EsSUFBTUEsY0FBY0EsR0FBR0EsVUFBQ0EsT0FBT0E7WUFDM0JBLE1BQU1BLENBQUNBO2dCQUFDQSxjQUFPQTtxQkFBUEEsV0FBT0EsQ0FBUEEsc0JBQU9BLENBQVBBLElBQU9BO29CQUFQQSw2QkFBT0E7O2dCQUNYQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdEJBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO2dCQUMxQ0EsQ0FBQ0E7WUFDTEEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsQ0FBQ0EsQ0FBQ0E7UUFDRkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsY0FBY0EsRUFBRUEsY0FBY0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxjQUFjQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO1FBQ2hGQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxrQkFBa0JBLEVBQUVBLGNBQWNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdEZBLENBQUNBO0lBRU9MLHNDQUFhQSxHQUFyQkEsVUFBc0JBLEtBQTZCQTtRQUMvQ00sa0VBQWtFQTtRQUNsRUEsNkNBQTZDQTtRQUM3Q0EsS0FBS0EsR0FBR0EsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFFNUJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGFBQWFBLEdBQUdBLEtBQUtBLENBQUNBLGFBQWFBLENBQUNBO1FBQ2xEQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxVQUFVQSxHQUFHQSxLQUFLQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUM1Q0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsY0FBY0EsR0FBR0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0E7UUFDcERBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGdCQUFnQkEsR0FBR0EsS0FBS0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUN4REEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDcENBLENBQUNBO0lBQ0xOLHFCQUFDQTtBQUFEQSxDQUFDQSxBQWxERCxFQUFvQyxLQUFLLENBQUMsU0FBUyxFQWtEbEQ7QUFsRFksc0JBQWMsaUJBa0QxQixDQUFBIn0=