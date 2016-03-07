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
