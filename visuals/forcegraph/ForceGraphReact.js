var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var ForceGraph_1 = require("./ForceGraph");
;
/**
 * Thin wrapper around LineUp
 */
var ForceGraph = (function (_super) {
    __extends(ForceGraph, _super);
    function ForceGraph() {
        _super.apply(this, arguments);
    }
    ForceGraph.prototype.componentDidMount = function () {
        var _this = this;
        this.node = ReactDOM.findDOMNode(this);
        this.forcegraph = new ForceGraph_1.ForceGraph($(this.node));
        this.forcegraph.events.on("selectionChanged", function (node) {
            if (_this.props.onSelectionChanged) {
                _this.props.onSelectionChanged(node);
            }
        });
        this.forcegraph.dimensions = { width: $(this.node).width(), height: $(this.node).height() };
        this.renderContent();
    };
    ForceGraph.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    ForceGraph.prototype.render = function () {
        return React.createElement("div", {"style": { width: "100%", height: "100%" }});
    };
    ForceGraph.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        if (this.selectionListener) {
            this.selectionListener.destroy();
        }
        this.forcegraph.data = props.graph;
        if (props.config) {
            this.forcegraph.configuration = props.config;
        }
        if (props.onSelectionChanged) {
            this.selectionListener = this.forcegraph.events.on("selectionChanged", function (rows) { return props.onSelectionChanged(rows); });
        }
        else if (this.selectionListener) {
            this.selectionListener.destroy();
        }
    };
    return ForceGraph;
})(React.Component);
exports.ForceGraph = ForceGraph;
