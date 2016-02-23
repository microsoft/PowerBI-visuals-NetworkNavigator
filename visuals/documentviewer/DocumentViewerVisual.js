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
})(VisualBase_1.VisualBase);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentViewerVisual;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9jdW1lbnRWaWV3ZXJWaXN1YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEb2N1bWVudFZpZXdlclZpc3VhbC50cyJdLCJuYW1lcyI6WyJEb2N1bWVudFZpZXdlclZpc3VhbCIsIkRvY3VtZW50Vmlld2VyVmlzdWFsLmNvbnN0cnVjdG9yIiwiRG9jdW1lbnRWaWV3ZXJWaXN1YWwuaW5pdCIsIkRvY3VtZW50Vmlld2VyVmlzdWFsLnVwZGF0ZSIsIkRvY3VtZW50Vmlld2VyVmlzdWFsLmdldENzcyIsIkRvY3VtZW50Vmlld2VyVmlzdWFsLmNvbnZlcnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBeUM7QUFDekMsMkJBQWdELHVCQUF1QixDQUFDLENBQUE7QUFDeEUsc0JBQXVCLGtCQUFrQixDQUFDLENBQUE7QUFDMUMsK0JBQTZFLGtCQUFrQixDQUFDLENBQUE7QUFPaEcsSUFBTyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUM7QUFFdkQ7SUFDa0RBLHdDQUFVQTtJQUQ1REE7UUFDa0RDLDhCQUFVQTtJQW9GNURBLENBQUNBO0lBbERHRDs7OztVQUlNQTtJQUNDQSxtQ0FBSUEsR0FBWEEsVUFBWUEsT0FBMEJBO1FBQ2xDRSxnQkFBS0EsQ0FBQ0EsSUFBSUEsWUFBQ0EsT0FBT0EsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsK0JBQWNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0lBQzdEQSxDQUFDQTtJQUVERjs7T0FFR0E7SUFDSUEscUNBQU1BLEdBQWJBLFVBQWNBLE9BQTRCQTtRQUN0Q0csZ0JBQUtBLENBQUNBLE1BQU1BLFlBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3RCQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxJQUFJQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxD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