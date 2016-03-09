"use strict";
var DOMPurify = require("./purify");
var $ = require("jquery");
/**
 * A simple document viewer which maps field names to values
 */
var DocumentViewer = (function () {
    /**
     * Constructor for the DocumentViewer
     */
    function DocumentViewer(parentElement) {
        this.element = $(DocumentViewer.template);
        this.tableElement = this.element.find(".table");
        parentElement.append(this.element);
    }
    Object.defineProperty(DocumentViewer.prototype, "data", {
        /**
         * Sets the data o
         */
        set: function (data) {
            this.tableElement.empty();
            var error;
            if (data.length === 1) {
                var eles = data.map(function (doc) {
                    var docEle = $("\n                    <div class=\"document\">\n                    </div>\n                ".trim());
                    docEle.append(doc.items.map(function (item) {
                        var newEle = $("\n                            <div>\n                                <div class=\"column-label\">" + item.name + ":&nbsp;</div>\n                                <div class=\"contents " + (item.type.html ? "html" : "text") + "\"></div>\n                            </div>\n                        ");
                        var contents = newEle.find('.contents');
                        if (item.type.html) {
                            contents.append("<div>" + DOMPurify.sanitize(item.value, { SAFE_FOR_JQUERY: true }) + "</div>");
                        }
                        else {
                            contents.text(item.value);
                        }
                        return newEle;
                    }));
                    return docEle;
                });
                this.tableElement.append(eles);
            }
            else if (data.length > 1) {
                error = "Too many documents, please limit the number of documents to a single document.";
            }
            else {
                error = "No Results";
            }
            this.tableElement.toggle(!error);
            this.element.find(".error").text(error || "").toggle(!!error);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The html string template for this visual
     */
    DocumentViewer.template = "\n        <div>\n            <div class=\"table\"></div>\n            <div class=\"error\"></div>\n        </div>\n    ".trim();
    return DocumentViewer;
}());
exports.DocumentViewer = DocumentViewer;
