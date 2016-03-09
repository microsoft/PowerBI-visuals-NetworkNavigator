"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="./references.d.ts"/>
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var DocumentViewer_1 = require("./DocumentViewer");
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var DocumentViewerVisual = (function (_super) {
    __extends(DocumentViewerVisual, _super);
    function DocumentViewerVisual() {
        _super.apply(this, arguments);
    }
    /**
     * Initializes an instance of the IVisual.
     *
        * @param options Initialization options for the visual.
        */
    DocumentViewerVisual.prototype.init = function (options) {
        _super.prototype.init.call(this, options, '<div></div>');
        this.myDocumentViewer = new DocumentViewer_1.DocumentViewer(this.element);
    };
    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    DocumentViewerVisual.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        if (options.dataViews && options.dataViews.length > 0) {
            var table = options.dataViews[0].table;
            var data = DocumentViewerVisual.converter(options.dataViews[0]);
            this.myDocumentViewer.data = data;
        }
    };
    /**
     * Gets the inline css used for this element
     */
    DocumentViewerVisual.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([require("!css!sass!./css/DocumentViewer.scss")]);
    };
    /**
     * Converts the dataview into our own model
     */
    DocumentViewerVisual.converter = function (dataView) {
        var data = [];
        if (dataView && dataView.table && dataView.table.rows.length > 0) {
            var table = dataView.table;
            var columns = table.columns;
            table.rows.forEach(function (row, i) {
                var row = table.rows[0];
                data.push({
                    items: row.map(function (value, colNum) { return ({
                        type: columns[colNum].roles['Html'] ? { html: {} } : { text: {} },
                        name: columns[colNum].displayName,
                        value: value
                    }); })
                });
            });
        }
        return data;
    };
    /**
     * Represents the capabilities for this visual
     */
    DocumentViewerVisual.capabilities = {
        dataRoles: [{
                name: "Text",
                displayName: "Text Fields",
                kind: VisualDataRoleKind.Grouping
            }, {
                name: "Html",
                displayName: "HTML Fields",
                kind: VisualDataRoleKind.Grouping
            }],
        dataViewMappings: [{
                table: {
                    rows: {
                        select: [
                            { bind: { to: 'Text' } },
                            { bind: { to: 'Html' } },
                        ]
                    },
                    rowCount: 1
                }
            }],
        objects: {}
    };
    DocumentViewerVisual = __decorate([
        Utils_1.Visual(JSON.parse(require("./build.json")).output.PowerBI)
    ], DocumentViewerVisual);
    return DocumentViewerVisual;
}(VisualBase_1.VisualBase));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentViewerVisual;
