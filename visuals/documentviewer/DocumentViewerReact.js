var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var DocumentViewer_1 = require("./DocumentViewer");
;
/**
 * Thin wrapper around LineUp
 */
var DocumentViewer = (function (_super) {
    __extends(DocumentViewer, _super);
    function DocumentViewer() {
        _super.apply(this, arguments);
    }
    DocumentViewer.prototype.componentDidMount = function () {
        this.node = ReactDOM.findDOMNode(this);
        this.documentViewer = new DocumentViewer_1.DocumentViewer($(this.node));
        this.renderContent();
    };
    DocumentViewer.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    DocumentViewer.prototype.render = function () {
        return React.createElement("div", {"style": { width: "100%", height: "100%" }});
    };
    DocumentViewer.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.documentViewer.data = props.data;
    };
    return DocumentViewer;
})(React.Component);
exports.DocumentViewer = DocumentViewer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9jdW1lbnRWaWV3ZXJSZWFjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRvY3VtZW50Vmlld2VyUmVhY3QudHN4Il0sIm5hbWVzIjpbIkRvY3VtZW50Vmlld2VyIiwiRG9jdW1lbnRWaWV3ZXIuY29uc3RydWN0b3IiLCJEb2N1bWVudFZpZXdlci5jb21wb25lbnREaWRNb3VudCIsIkRvY3VtZW50Vmlld2VyLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJEb2N1bWVudFZpZXdlci5yZW5kZXIiLCJEb2N1bWVudFZpZXdlci5yZW5kZXJDb250ZW50Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLElBQVksS0FBSyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0FBQy9CLElBQVksUUFBUSxXQUFNLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QiwrQkFBOEUsa0JBQWtCLENBQUMsQ0FBQTtBQUloRyxDQUFDO0FBSUY7O0dBRUc7QUFDSDtJQUFvQ0Esa0NBQTJEQTtJQUEvRkE7UUFBb0NDLDhCQUEyREE7SUE0Qi9GQSxDQUFDQTtJQXZCR0QsMENBQWlCQSxHQUFqQkE7UUFDSUUsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLCtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBO0lBQ3pCQSxDQUFDQTtJQUVERixrREFBeUJBLEdBQXpCQSxVQUEwQkEsUUFBK0JBO1FBQ3JERyxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7SUFFREg7O09BRUdBO0lBQ0hBLCtCQUFNQSxHQUFOQTtRQUNJSSxNQUFNQSxDQUFDQSxxQkFBQ0EsR0FBR0EsS0FBQ0EsS0FBS0EsR0FBRUEsRUFBQ0EsS0FBS0EsRUFBQ0EsTUFBTUEsRUFBRUEsTUFBTUEsRUFBQ0EsTUFBTUEsRUFBRUEsRUFBT0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRU9KLHNDQUFhQSxHQUFyQkEsVUFBc0JBLEtBQTZCQTtRQUMvQ0ssa0VBQWtFQTtRQUNsRUEsNkNBQTZDQTtRQUM3Q0EsS0FBS0EsR0FBR0EsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDNUJBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO0lBQzFDQSxDQUFDQTtJQUNMTCxxQkFBQ0E7QUFBREEsQ0FBQ0EsQUE1QkQsRUFBb0MsS0FBSyxDQUFDLFNBQVMsRUE0QmxEO0FBNUJZLHNCQUFjLGlCQTRCMUIsQ0FBQSJ9