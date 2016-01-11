/// <reference path="./references.d.ts"/>
import { ExternalCssResource, VisualBase } from "../../base/VisualBase";
import { Visual } from "../../base/Utils";
const DOMPurify = require("./purify");

import IVisual = powerbi.IVisual;
import DataView = powerbi.DataView;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;

@Visual(JSON.parse(require("./visualconfig.json")))
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
     * The html string template for this visual
     */
    private static template = `
        <div>
            <div class="table"></div>
            <div class="error"></div>
        </div>
    `.trim();

    /**
     * Our table element
     */
    private tableElement: JQuery;

    /**
     * Initializes an instance of the IVisual.
     *
        * @param options Initialization options for the visual.
        */
    public init(options: VisualInitOptions) {
        super.init(options, DocumentViewerVisual.template);
        this.tableElement = this.element.find(".table");
    }

    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        var error;
        if (options.dataViews && options.dataViews.length > 0) {
            var table = options.dataViews[0].table;
            if (table.rows.length === 1) {
                var data = DocumentViewerVisual.converter(options.dataViews[0]);
                this.tableElement.empty();
                this.tableElement.css({ height: options.viewport.height - 10 });

                var eles = data.map((doc) => {
                    var docEle = $(`
                        <div class="document">
                        </div>
                    `.trim());

                    docEle.append(
                        doc.items.map((item) => {
                            var newEle = $(`
                                <div>
                                    <div class="column-label">${item.name}:&nbsp;</div>
                                    <div class="contents ${item.type.html ? "html" : "text"}"></div>
                                </div>
                            `);

                            var contents = newEle.find('.contents');
                            if (item.type.html) {
                                contents.append(`<div>${DOMPurify.sanitize(item.value, { SAFE_FOR_JQUERY: true })}</div>`);
                            } else {
                                contents.text(item.value);
                            }
                            return newEle;
                        })
                    );

                    return docEle;
                });
                this.tableElement.append(eles);
            } else if (table.rows.length > 1) {
                error = "Too many documents, please select a filter to limit the number of documents to a single document.";
            } else {
                error = "No Results";
            }
        }
        this.tableElement.toggle(!error);
        this.element.find(".error").text(error || "").toggle(!!error);
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
        if (dataView && dataView.table && /*dataView.table.rows.length > 0 */ dataView.table.rows.length === 1) {
            var table = dataView.table;
            var columns = table.columns;
            // table.rows.forEach((row, i) => {
                var row = table.rows[0];
                data.push({
                    items: row.map((value, colNum) => ({
                        type: columns[colNum].roles['Html'] ? { html: {} } : { text: {} },
                        name: columns[colNum].displayName,
                        value: value
                    }))
                });
            // });
        }
        return data;
    }
}

/**
 * The document
 */
interface IDocumentViewerDocument {

    /**
     * The items of the document
     */
    items: IDocumentViewerData[]
}

/**
 * Represents the data for the document viewer to display
 */
interface IDocumentViewerData {

    /**
     * The name of the piece of data
     */
    name: string;

    /**
     * Represents the data type of the given field
     */
    type?: { text?: {}; html?: {} };

    /**
     * The actual value of the data field
     */
    value: string;
}