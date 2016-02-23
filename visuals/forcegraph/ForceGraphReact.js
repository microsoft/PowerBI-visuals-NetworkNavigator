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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9yY2VHcmFwaFJlYWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRm9yY2VHcmFwaFJlYWN0LnRzeCJdLCJuYW1lcyI6WyJGb3JjZUdyYXBoIiwiRm9yY2VHcmFwaC5jb25zdHJ1Y3RvciIsIkZvcmNlR3JhcGguY29tcG9uZW50RGlkTW91bnQiLCJGb3JjZUdyYXBoLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJGb3JjZUdyYXBoLnJlbmRlciIsIkZvcmNlR3JhcGgucmVuZGVyQ29udGVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxJQUFZLEtBQUssV0FBTSxPQUFPLENBQUMsQ0FBQTtBQUMvQixJQUFZLFFBQVEsV0FBTSxXQUFXLENBQUMsQ0FBQTtBQUN0QyxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsMkJBQStFLGNBQWMsQ0FBQyxDQUFBO0FBSzdGLENBQUM7QUFJRjs7R0FFRztBQUNIO0lBQWdDQSw4QkFBbURBO0lBQW5GQTtRQUFnQ0MsOEJBQW1EQTtJQThDbkZBLENBQUNBO0lBdkNHRCxzQ0FBaUJBLEdBQWpCQTtRQUFBRSxpQkFVQ0E7UUFUR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLHVCQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuREEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxVQUFDQSxJQUFJQTtZQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaENBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDeENBLENBQUNBO1FBQ0xBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFVBQVVBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLE1BQU1BLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBO1FBQzVGQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFFREYsOENBQXlCQSxHQUF6QkEsVUFBMEJBLFFBQTJCQTtRQUNqREcsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDakNBLENBQUNBO0lBRURIOztPQUVHQTtJQUNIQSwyQkFBTUEsR0FBTkE7UUFDSUksTUFBTUEsQ0FBQ0EscUJBQUNBLEdBQUdBLEtBQUNBLEtBQUtBLEdBQUVBLEVBQUNBLEtBQUtBLEVBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUNBLE1BQU1BLEVBQUVBLEVBQU9BLENBQUNBO0lBQzdEQSxDQUFDQTtJQUVPSixrQ0FBYUEsR0FBckJBLFVBQXNCQSxLQUF5QkE7UUFDM0NLLGtFQUFrRUE7UUFDbEVBLDZDQUE2Q0E7UUFDN0NBLEtBQUtBLEdBQUdBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQzVCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ3JDQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUVuQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxrQkFBa0JBLEVBQUVBLFVBQUNBLElBQUlBLElBQUtBLE9BQUFBLEtBQUtBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBOUJBLENBQThCQSxDQUFDQSxDQUFDQTtRQUNySEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNyQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFDTEwsaUJBQUNBO0FBQURBLENBQUNBLEFBOUNELEVBQWdDLEtBQUssQ0FBQyxTQUFTLEVBOEM5QztBQTlDWSxrQkFBVSxhQThDdEIsQ0FBQSJ9