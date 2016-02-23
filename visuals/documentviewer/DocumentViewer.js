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
})();
exports.DocumentViewer = DocumentViewer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9jdW1lbnRWaWV3ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEb2N1bWVudFZpZXdlci50cyJdLCJuYW1lcyI6WyJEb2N1bWVudFZpZXdlciIsIkRvY3VtZW50Vmlld2VyLmNvbnN0cnVjdG9yIiwiRG9jdW1lbnRWaWV3ZXIuZGF0YSJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU1Qjs7R0FFRztBQUNIO0lBc0JJQTs7T0FFR0E7SUFDSEEsd0JBQVlBLGFBQXFCQTtRQUM3QkMsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ2hEQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUFLREQsc0JBQVdBLGdDQUFJQTtRQUhmQTs7V0FFR0E7YUFDSEEsVUFBZ0JBLElBQStCQTtZQUMzQ0UsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7WUFFMUJBLElBQUlBLEtBQUtBLENBQUNBO1lBQ1ZBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNwQkEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQ0EsR0FBR0E7b0JBQ3BCQSxJQUFJQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSw4RkFHZEEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBRVZBLE1BQU1BLENBQUNBLE1BQU1BLENBQ1RBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLFVBQUNBLElBQUlBO3dCQUNmQSxJQUFJQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxzR0FFcUJBLElBQUlBLENBQUNBLElBQUlBLDhFQUNkQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxNQUFNQSxHQUFHQSxNQUFNQSw2RUFFOURBLENBQUNBLENBQUNBO3dCQUVIQSxJQUFJQSxRQUFRQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTt3QkFDeENBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNqQkEsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBUUEsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsZUFBZUEsRUFBRUEsSUFBSUEsRUFBRUEsQ0FBQ0EsV0FBUUEsQ0FBQ0EsQ0FBQ0E7d0JBQy9GQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ0pBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO3dCQUM5QkEsQ0FBQ0E7d0JBQ0RBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO29CQUNsQkEsQ0FBQ0EsQ0FBQ0EsQ0FDTEEsQ0FBQ0E7b0JBRUZBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO2dCQUNsQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ0hBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ25DQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekJBLEtBQUtBLEdBQUdBLGdGQUFnRkEsQ0FBQ0E7WUFDN0ZBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNKQSxLQUFLQSxHQUFHQSxZQUFZQSxDQUFDQTtZQUN6QkEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xFQSxDQUFDQTs7O09BQUFGO0lBOUREQTs7T0FFR0E7SUFDWUEsdUJBQVFBLEdBQUdBLHlIQUt6QkEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7SUF1RGJBLHFCQUFDQTtBQUFEQSxDQUFDQSxBQTNFRCxJQTJFQztBQTNFWSxzQkFBYyxpQkEyRTFCLENBQUEifQ==