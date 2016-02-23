/**
 * Represents an elastic search provider
 */
var JSONSearchProvider = (function () {
    /**
     * Constructor for the search provider
     */
    function JSONSearchProvider(params, data) {
        /**
         * The name of the search provider
         */
        this.name = "JSON";
        this.params = params;
        this.data = data;
    }
    Object.defineProperty(JSONSearchProvider.prototype, "params", {
        get: function () {
            return this._params;
        },
        /**
         * Sets the params of the search provider
         */
        set: function (params) {
            this._params = params;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Runs a query against the given search provider
     */
    JSONSearchProvider.prototype.query = function (options) {
        var _this = this;
        if (this.checkRequiredParams()) {
            var idField = this.getParamValue(JSONSearchProvider.ID_FIELD_PARAM);
            var final = this.data.slice(0);
            var eq = options.query && options.query.where && options.query.where.eq;
            if (eq) {
                var searchColumns = Object.keys(eq);
                var cleared = false;
                // This will allow for overriding of column based searches, so `title:Haha`, if * is used, then all columns in the search fields parameters is used
                var searchFilters = searchColumns.forEach(function (c) {
                    var searchValue = eq[c];
                    if (c !== '*') {
                        final = final.filter(function (item) { return item[c].indexOf(searchValue) >= 0; });
                    }
                    else {
                        if (searchValue !== "*") {
                            final = final.filter(function (item) {
                                return Object.keys(item).filter(function (column) {
                                    var result = item[column];
                                    if (result && result.indexOf) {
                                        return result.indexOf(searchValue) >= 0;
                                    }
                                }).length > 0;
                            });
                        }
                    }
                });
            }
            var filteredCount = final.length;
            if (options.offset) {
                final = final.slice(options.offset);
            }
            if (options.count) {
                final = final.slice(0, options.count);
            }
            return new Promise(function (resolve) {
                setTimeout(function () { return resolve({
                    results: final.map(function (r) {
                        var prop = (_this.getParamValue(JSONSearchProvider.SEARCH_FIELDS) || "body").split(',')[0];
                        return {
                            id: r[idField],
                            textualMatch: r[prop] || "",
                            rawData: r
                        };
                    }),
                    total: filteredCount,
                    offset: options.offset
                }); }, 5000);
            });
        }
        else {
            throw new Error("Some Required Parameters Missing");
        }
    };
    /**
     * Checks the list of require params
     */
    JSONSearchProvider.prototype.checkRequiredParams = function () {
        if (this.params && this.params.length) {
            var required = JSONSearchProvider.supportedParameters.filter(function (p) { return p.required; }).map(function (p) { return p.name; });
            var toCheck = this.params.map(function (p) { return p.name; });
            // Make sure that we have all the required params
            return required.filter(function (p) { return toCheck.indexOf(p) >= 0; }).length === required.length;
        }
        return false;
    };
    /**
     * Gets the parameter value by name
     */
    JSONSearchProvider.prototype.getParamValue = function (name) {
        return this.params.filter(function (p) { return p.name === name; }).map(function (p) { return p.value; })[0];
    };
    // /**
    //  * The API Key param
    //  */
    // public static API_KEY_PARAM = "API Key";
    /**
     * The field that uniquely identifies a given result
     */
    JSONSearchProvider.ID_FIELD_PARAM = "ID Field";
    /**
     * The URL param
     */
    JSONSearchProvider.URL_PARAM = "URL";
    /**
     * The fields to search when performing a text search
     */
    JSONSearchProvider.SEARCH_FIELDS = "Search Fields";
    /**
     * The parameters to call this service
     * for example - API Key, URL
     */
    JSONSearchProvider.supportedParameters = [
         /*, {
            name: JSONSearchProvider.API_KEY_PARAM,
            description: "The API Key",
            value: undefined,
            required: true
        }*/,
        {
            name: JSONSearchProvider.ID_FIELD_PARAM,
            description: "The field that uniquely identifies a given result",
            value: "emailid",
            required: true
        }, {
            name: JSONSearchProvider.SEARCH_FIELDS,
            description: "The fields to search when running a query (comma delimited)",
            value: "body",
            required: false
        }];
    return JSONSearchProvider;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JSONSearchProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSlNPTlNlYXJjaFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSlNPTlNlYXJjaFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbIkpTT05TZWFyY2hQcm92aWRlciIsIkpTT05TZWFyY2hQcm92aWRlci5jb25zdHJ1Y3RvciIsIkpTT05TZWFyY2hQcm92aWRlci5wYXJhbXMiLCJKU09OU2VhcmNoUHJvdmlkZXIucXVlcnkiLCJKU09OU2VhcmNoUHJvdmlkZXIuY2hlY2tSZXF1aXJlZFBhcmFtcyIsIkpTT05TZWFyY2hQcm92aWRlci5nZXRQYXJhbVZhbHVlIl0sIm1hcHBpbmdzIjoiQUFFQTs7R0FFRztBQUNIO0lBb0RJQTs7T0FFR0E7SUFDSEEsNEJBQVlBLE1BQStCQSxFQUFFQSxJQUFXQTtRQWJ4REM7O1dBRUdBO1FBQ0lBLFNBQUlBLEdBQVdBLE1BQU1BLENBQUNBO1FBV3pCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDckJBLENBQUNBO0lBTURELHNCQUFXQSxzQ0FBTUE7YUFBakJBO1lBQ0lFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUVERjs7V0FFR0E7YUFDSEEsVUFBa0JBLE1BQStCQTtZQUM3Q0UsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDMUJBLENBQUNBOzs7T0FQQUY7SUFVREE7O09BRUdBO0lBQ0lBLGtDQUFLQSxHQUFaQSxVQUFhQSxPQUFzQkE7UUFBbkNHLGlCQW1EQ0E7UUFsREdBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLG1CQUFtQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7WUFD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