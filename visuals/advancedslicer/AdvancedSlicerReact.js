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
        return React.createElement("div", {"className": "advanced-slicer-container", "style": { width: "100%", height: "100%" }});
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
