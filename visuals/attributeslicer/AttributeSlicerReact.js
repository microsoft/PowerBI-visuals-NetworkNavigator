"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var AttributeSlicer_1 = require("./AttributeSlicer");
;
/**
 * Thin wrapper around LineUp
 */
var AttributeSlicer = (function (_super) {
    __extends(AttributeSlicer, _super);
    function AttributeSlicer() {
        _super.apply(this, arguments);
    }
    AttributeSlicer.prototype.componentDidMount = function () {
        this.node = ReactDOM.findDOMNode(this);
        this.mySlicer = new AttributeSlicer_1.AttributeSlicer($(this.node));
        this.attachEvents();
        this.renderContent();
    };
    AttributeSlicer.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    AttributeSlicer.prototype.render = function () {
        return React.createElement("div", {className: "advanced-slicer-container", style: { width: "100%", height: "100%" }});
    };
    /**
     * Attaches events to the slicer
     */
    AttributeSlicer.prototype.attachEvents = function () {
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
    AttributeSlicer.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.mySlicer.showHighlight = props.showHighlight;
        this.mySlicer.showValues = props.showValues;
        this.mySlicer.showSelections = props.showSelections;
        this.mySlicer.serverSideSearch = props.serverSideSearch;
        this.mySlicer.data = props.data;
    };
    return AttributeSlicer;
}(React.Component));
exports.AttributeSlicer = AttributeSlicer;
