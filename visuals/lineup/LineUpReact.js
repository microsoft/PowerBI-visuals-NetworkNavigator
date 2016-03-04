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
