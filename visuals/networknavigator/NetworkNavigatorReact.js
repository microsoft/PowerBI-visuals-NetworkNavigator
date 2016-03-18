"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var NetworkNavigator_1 = require("./NetworkNavigator");
;
/**
 * Thin wrapper around LineUp
 */
var NetworkNavigator = (function (_super) {
    __extends(NetworkNavigator, _super);
    function NetworkNavigator() {
        _super.apply(this, arguments);
    }
    NetworkNavigator.prototype.componentDidMount = function () {
        var _this = this;
        this.node = ReactDOM.findDOMNode(this);
        this.networkNavigator = new NetworkNavigator_1.NetworkNavigator($(this.node));
        this.networkNavigator.events.on("selectionChanged", function (node) {
            if (_this.props.onSelectionChanged) {
                _this.props.onSelectionChanged(node);
            }
        });
        this.networkNavigator.dimensions = { width: $(this.node).width(), height: $(this.node).height() };
        this.renderContent();
    };
    NetworkNavigator.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    NetworkNavigator.prototype.render = function () {
        return React.createElement("div", {style: { width: "100%", height: "100%" }});
    };
    NetworkNavigator.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        if (this.selectionListener) {
            this.selectionListener.destroy();
        }
        this.networkNavigator.data = props.graph;
        if (props.config) {
            this.networkNavigator.configuration = props.config;
        }
        if (props.onSelectionChanged) {
            this.selectionListener = this.networkNavigator.events.on("selectionChanged", function (rows) { return props.onSelectionChanged(rows); });
        }
        else if (this.selectionListener) {
            this.selectionListener.destroy();
        }
    };
    return NetworkNavigator;
}(React.Component));
exports.NetworkNavigator = NetworkNavigator;
