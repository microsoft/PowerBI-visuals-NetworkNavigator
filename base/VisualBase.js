"use strict";
/// <reference path="./references.d.ts"/>
var VisualBase = (function () {
    function VisualBase() {
    }
    /** This is called once when the visual is initialially created */
    VisualBase.prototype.init = function (options, template, addCssToParent) {
        var _this = this;
        if (template === void 0) { template = ""; }
        if (addCssToParent === void 0) { addCssToParent = false; }
        var width = options.viewport.width;
        var height = options.viewport.height;
        this.container = options.element;
        this.iframe = $("<iframe style=\"width:" + width + "px;height:" + height + "px;border:0;margin:0;padding:0\" frameBorder=\"0\"/>");
        this.container.append(this.iframe);
        this.element = this.iframe.contents().find("body");
        var promises = this.getExternalCssResources().map(function (resource) { return _this.buildExternalCssLink(resource); });
        $.when.apply($, promises).then(function () {
            var styles = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                styles[_i - 0] = arguments[_i];
            }
            return _this.element.append(styles.map(function (s) { return $(s); }));
        });
        if (addCssToParent) {
            this.container.append(this.getCss().map(function (css) { return $("<st" + "yle>" + css + "</st" + "yle>"); }));
        }
        this.element.append(this.getCss().map(function (css) { return $("<st" + "yle>" + css + "</st" + "yle>"); }));
        if (template) {
            this.element = this.element.append($(template));
        }
    };
    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    VisualBase.prototype.update = function (options) {
        this.iframe.css({ width: options.viewport.width, height: options.viewport.height });
    };
    /**
     * Gets the inline css used for this element
     */
    VisualBase.prototype.getCss = function () {
        return [require("!css!sass!./css/base.scss")];
    };
    /**
     * Builds the link for the given external css resource
     */
    VisualBase.prototype.buildExternalCssLink = function (resource) {
        var link = 'li' + 'nk';
        var integrity = resource.integrity ? "integrity=\"" + resource.integrity + "\"" : '';
        var href = "href=\"" + resource.url + "\"";
        var crossorigin = resource.crossorigin ? " crossorigin=\"" + resource.crossorigin + "\"" : '';
        var rel = 'rel="stylesheet"';
        var defer = $.Deferred();
        defer.resolve("<" + link + " " + href + " " + rel + " " + integrity + " " + crossorigin + ">");
        return defer.promise();
    };
    /**
     * Gets the external css paths used for this visualization
     */
    VisualBase.prototype.getExternalCssResources = function () {
        return [];
    };
    return VisualBase;
}());
exports.VisualBase = VisualBase;
/* HACK FIXES */
if (powerbi.visuals.utility.SelectionManager.prototype['selectInternal']) {
    powerbi.visuals.utility.SelectionManager.prototype['selectInternal'] = function (selectionId, multiSelect) {
        if (powerbi.visuals.utility.SelectionManager.containsSelection(this.selectedIds, selectionId)) {
            this.selectedIds = multiSelect
                ? this.selectedIds.filter(function (d) { return !powerbi.data.Selector.equals(d.getSelector(), selectionId.getSelector()); })
                : this.selectedIds.length > 1
                    ? [selectionId] : [];
        }
        else {
            if (multiSelect)
                this.selectedIds.push(selectionId);
            else
                this.selectedIds = [selectionId];
        }
    };
    console.warn("Monkey Patched: powerbi.visuals.utility.SelectionManager.prototype.selectInternal");
}
