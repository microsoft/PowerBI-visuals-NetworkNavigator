"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var TableSorter_1 = require("./TableSorter");
;
/**
 * Thin wrapper around TableSorter
 */
var TableSorter = (function (_super) {
    __extends(TableSorter, _super);
    function TableSorter() {
        _super.apply(this, arguments);
    }
    TableSorter.prototype.componentDidMount = function () {
        this.node = ReactDOM.findDOMNode(this);
        this.tableSorter = new TableSorter_1.TableSorter($(this.node));
        this.attachEvents();
        this.renderContent();
    };
    TableSorter.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    TableSorter.prototype.render = function () {
        return React.createElement("div", {style: { width: "100%", height: "100%" }});
    };
    /**
     * Attaches the events
     */
    TableSorter.prototype.attachEvents = function () {
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
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.SELECTION_CHANGED, guardedEventer('onSelectionChanged'));
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.LOAD_MORE_DATA, guardedEventer('onLoadMoreData'));
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.FILTER_CHANGED, guardedEventer('onFilterChanged'));
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.SORT_CHANGED, guardedEventer('onSortChanged'));
    };
    TableSorter.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.tableSorter.settings = this.getSettingsFromProps(props);
        this.tableSorter.count = props.count || 100;
        if (props.provider && props.cols) {
            var config = this.tableSorter.configuration || {
                primaryKey: props.cols[0].column,
                columns: []
            };
            config.columns = props.cols;
            this.tableSorter.configuration = config;
        }
        this.tableSorter.dataProvider = props.provider;
    };
    /**
     * Converts the tablesorter props to settings
     */
    TableSorter.prototype.getSettingsFromProps = function (props) {
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
    return TableSorter;
}(React.Component));
exports.TableSorter = TableSorter;
