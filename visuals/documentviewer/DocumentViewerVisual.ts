/// <reference path="./references.d.ts"/>
import { ExternalCssResource, VisualBase } from "../../base/VisualBase";
import { Visual } from "../../base/Utils";
import { DocumentViewer, IDocumentViewerData, IDocumentViewerDocument } from "./DocumentViewer";

import IVisual = powerbi.IVisual;
import DataView = powerbi.DataView;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;

@Visual(JSON.parse(require("./build.json")).output.PowerBI)
export default class DocumentViewerVisual extends VisualBase implements IVisual {

    /**
     * Represents the capabilities for this visual
     */
    public static capabilities: VisualCapabilities = {
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

    /**
     * My Document Viewer
     */
    private myDocumentViewer : DocumentViewer;

    /**
     * Initializes an instance of the IVisual.
     *
        * @param options Initialization options for the visual.
        */
    public init(options: VisualInitOptions) {
        super.init(options, '<div></div>');
        this.myDocumentViewer = new DocumentViewer(this.element);
    }

    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    public update(options: VisualUpdateOptions) {
        super.update(options);
        if (options.dataViews && options.dataViews.length > 0) {
            var table = options.dataViews[0].table;
            var data = DocumentViewerVisual.converter(options.dataViews[0]);
            this.myDocumentViewer.data = data;
        }
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss() : string[] {
        return super.getCss().concat([require("!css!sass!./css/DocumentViewer.scss")]);
    }

    /**
     * Converts the dataview into our own model
     */
    public static converter(dataView: DataView): IDocumentViewerDocument[] {
        var data: IDocumentViewerDocument[] = [];
        if (dataView && dataView.table && dataView.table.rows.length > 0) {
            var table = dataView.table;
            var columns = table.columns;
            table.rows.forEach((row, i) => {
                var row = table.rows[0];
                data.push({
                    items: row.map((value, colNum) => ({
                        type: columns[colNum].roles['Html'] ? { html: {} } : { text: {} },
                        name: columns[colNum].displayName,
                        value: value
                    }))
                });
            });
        }
        return data;
    }
}