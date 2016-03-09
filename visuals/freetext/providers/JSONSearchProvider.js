"use strict";
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
            var idField_1 = this.getParamValue(JSONSearchProvider.ID_FIELD_PARAM);
            var final_1 = this.data.slice(0);
            var eq_1 = options.query && options.query.where && options.query.where.eq;
            if (eq_1) {
                var searchColumns = Object.keys(eq_1);
                var cleared = false;
                // This will allow for overriding of column based searches, so `title:Haha`, if * is used, then all columns in the search fields parameters is used
                var searchFilters = searchColumns.forEach(function (c) {
                    var searchValue = eq_1[c];
                    if (c !== '*') {
                        final_1 = final_1.filter(function (item) { return item[c].indexOf(searchValue) >= 0; });
                    }
                    else {
                        if (searchValue !== "*") {
                            final_1 = final_1.filter(function (item) {
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
            var filteredCount_1 = final_1.length;
            if (options.offset) {
                final_1 = final_1.slice(options.offset);
            }
            if (options.count) {
                final_1 = final_1.slice(0, options.count);
            }
            return new Promise(function (resolve) {
                setTimeout(function () { return resolve({
                    results: final_1.map(function (r) {
                        var prop = (_this.getParamValue(JSONSearchProvider.SEARCH_FIELDS) || "body").split(',')[0];
                        return {
                            id: r[idField_1],
                            textualMatch: r[prop] || "",
                            rawData: r
                        };
                    }),
                    total: filteredCount_1,
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JSONSearchProvider;
