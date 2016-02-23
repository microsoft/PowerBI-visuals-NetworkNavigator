var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var LineUp_1 = require("./LineUp");
;
/**
 * Thin wrapper around LineUp
 */
var LineUp = (function (_super) {
    __extends(LineUp, _super);
    function LineUp() {
        _super.apply(this, arguments);
    }
    LineUp.prototype.componentDidMount = function () {
        this.node = ReactDOM.findDOMNode(this);
        this.lineup = new LineUp_1.LineUp($(this.node));
        this.attachEvents();
        this.renderContent();
    };
    LineUp.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    LineUp.prototype.render = function () {
        return React.createElement("div", {"style": { width: "100%", height: "100%" }});
    };
    /**
     * Attaches the events
     */
    LineUp.prototype.attachEvents = function () {
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
        this.lineup.events.on(LineUp_1.LineUp.EVENTS.SELECTION_CHANGED, guardedEventer('onSelectionChanged'));
        this.lineup.events.on(LineUp_1.LineUp.EVENTS.LOAD_MORE_DATA, guardedEventer('onLoadMoreData'));
        this.lineup.events.on(LineUp_1.LineUp.EVENTS.FILTER_CHANGED, guardedEventer('onFilterChanged'));
        this.lineup.events.on(LineUp_1.LineUp.EVENTS.SORT_CHANGED, guardedEventer('onSortChanged'));
    };
    LineUp.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.lineup.settings = this.getSettingsFromProps(props);
        this.lineup.count = props.count || 100;
        if (props.provider && props.cols) {
            var config = this.lineup.configuration || {
                primaryKey: props.cols[0].column,
                columns: []
            };
            config.columns = props.cols;
            this.lineup.configuration = config;
        }
        this.lineup.dataProvider = props.provider;
    };
    /**
     * Converts the lineup props to settings
     */
    LineUp.prototype.getSettingsFromProps = function (props) {
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
    };
    return LineUp;
})(React.Component);
exports.LineUp = LineUp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZVVwUmVhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJMaW5lVXBSZWFjdC50c3giXSwibmFtZXMiOlsiTGluZVVwIiwiTGluZVVwLmNvbnN0cnVjdG9yIiwiTGluZVVwLmNvbXBvbmVudERpZE1vdW50IiwiTGluZVVwLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJMaW5lVXAucmVuZGVyIiwiTGluZVVwLmF0dGFjaEV2ZW50cyIsIkxpbmVVcC5yZW5kZXJDb250ZW50IiwiTGluZVVwLmdldFNldHRpbmdzRnJvbVByb3BzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLElBQVksS0FBSyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0FBQy9CLElBQVksUUFBUSxXQUFNLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1Qix1QkFBcUMsVUFBVSxDQUFDLENBQUE7QUFtQi9DLENBQUM7QUFJRjs7R0FFRztBQUNIO0lBQTRCQSwwQkFBeUNBO0lBQXJFQTtRQUE0QkMsOEJBQXlDQTtJQTZFckVBLENBQUNBO0lBdEVHRCxrQ0FBaUJBLEdBQWpCQTtRQUNJRSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2Q0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsZUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1FBQ3BCQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFFREYsMENBQXlCQSxHQUF6QkEsVUFBMEJBLFFBQXNCQTtRQUM1Q0csSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDakNBLENBQUNBO0lBRURIOztP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