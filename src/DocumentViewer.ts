const DOMPurify = require("./purify");
const $ = require("jquery");

/**
 * A simple document viewer which maps field names to values
 */
export class DocumentViewer {

    /**
     * Our table element
     */
    private tableElement: JQuery;

    /**
     * The element
     */
    private element; JQuery;

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
     * Constructor for the DocumentViewer
     */
    constructor(parentElement: JQuery) {
        this.element = $(DocumentViewer.template);
        this.tableElement = this.element.find(".table");
        parentElement.append(this.element);
    }

    /**
     * Sets the data o
     */
    public set data(data: IDocumentViewerDocument[]) {
        this.tableElement.empty();

        var error;
        if (data.length === 1) {
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
        } else if (data.length > 1) {
            error = "Too many documents, please limit the number of documents to a single document.";
        } else {
            error = "No Results";
        }
        this.tableElement.toggle(!error);
        this.element.find(".error").text(error || "").toggle(!!error);
    }
}

/**
 * The document
 */
export interface IDocumentViewerDocument {

    /**
     * The items of the document
     */
    items: IDocumentViewerData[]
}

/**
 * Represents the data for the document viewer to display
 */
export interface IDocumentViewerData {

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