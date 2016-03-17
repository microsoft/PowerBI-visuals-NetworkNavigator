"use strict";
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
        this.element = $("<div/>");
        this.sandboxed = VisualBase.DEFAULT_SANDBOX_ENABLED;
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
        this.width = options.viewport.width;
        this.height = options.viewport.height;
        var dataView = options.dataViews && options.dataViews[0];
        if (dataView) {
            if (VisualBase.EXPERIMENTAL_ENABLED) {
                var objs = dataView.metadata.objects;
                var experimental = objs && objs['experimental'];
                var sandboxed = experimental && experimental['sandboxed'];
                sandboxed = typeof sandboxed === "undefined" ? VisualBase.DEFAULT_SANDBOX_ENABLED : sandboxed;
                if (this.sandboxed !== sandboxed) {
                    this.sandboxed = sandboxed;
                }
            }
        }
        this.parent.css({ width: this.width, height: this.height });
    };
    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    VisualBase.prototype.enumerateObjectInstances = function (options) {
        if (options.objectName === 'experimental' && VisualBase.EXPERIMENTAL_ENABLED) {
            return [{
                    selector: null,
                    objectName: 'experimental',
                    properties: {
                        sandboxed: this.sandboxed
                    }
                }];
        }
    };
    Object.defineProperty(VisualBase.prototype, "sandboxed", {
        /**
         *
         */
        get: function () {
            return this._sandboxed;
        },
        /**
         * Sets the sandboxed state
         */
        set: function (value) {
            var _this = this;
            this._sandboxed = value;
            this.element.detach();
            if (this.parent) {
                this.parent.remove();
            }
            if (value) {
                this.parent = $("<iframe style=\"width:" + this.width + "px;height:" + this.height + "px;border:0;margin:0;padding:0\" frameBorder=\"0\"/>");
                // Important that this happens first, otherwise there might not be a body
                this.container.append(this.parent);
                if (typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                    // If you append the element without doing this, the iframe will load after you've appended it and remove everything that you added
                    this.parent[0].onload = function () {
                        setTimeout(function () {
                            _this.parent.contents().find("body").append(_this.element);
                        }, 0);
                    };
                }
                else {
                    this.parent.contents().find("head").append($('<meta http-equiv="X-UA-Compatible" content="IE=edge">'));
                    this.parent.contents().find("body").append(this.element);
                }
                this.HACK_fonts();
            }
            else {
                this.parent = $("<div style=\"width:" + this.width + "px;height:" + this.height + "px;border:0;margin:0;padding:0\"/>");
                this.parent.append(this.element);
                this.container.append(this.parent);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the inline css used for this element
     */
    VisualBase.prototype.getCss = function () {
        return [require("!css!sass!./css/main.scss")];
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
    VisualBase.prototype.HACK_fonts = function () {
        var faces = this.HACK_getFontFaces();
        this.element.append(faces.map(function (n) { return $("<st" + "yle>" + n.cssText + "</st" + "yle>"); }));
    };
    VisualBase.prototype.HACK_getFontFaces = function (obj) {
        var sheet = document.styleSheets, rule = null, i = sheet.length, j, toReturn = [];
        while (0 <= --i) {
            rule = sheet[i]['rules'] || sheet[i]['cssRules'] || [];
            j = rule.length;
            while (0 <= --j) {
                if (rule[j].constructor.name === 'CSSFontFaceRule') {
                    //o[ rule[j].style.fontFamily ] = rule[j].style.src;
                    toReturn.push(rule[j]);
                }
                ;
            }
        }
        return toReturn;
    };
    // TODO: Switch this to a build config
    VisualBase.EXPERIMENTAL_ENABLED = false;
    /**
     * True if the sandbox is enabled by default
     */
    VisualBase.DEFAULT_SANDBOX_ENABLED = window.parent === window /* Checks if we are in an iframe */;
    /**
     * The set of capabilities for the visual
     */
    VisualBase.capabilities = VisualBase.EXPERIMENTAL_ENABLED ? {
        objects: {
            experimental: {
                displayName: "Experimental",
                properties: {
                    sandboxed: {
                        type: { bool: true },
                        displayName: "Enable to sandbox the visual into an IFrame"
                    }
                }
            }
        }
    } : {};
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
