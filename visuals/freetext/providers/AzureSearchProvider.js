"use strict";
/**
 * Represents an azure search provider
 */
var AzureSearchProvider = (function () {
    /**
     * Constructor for the search provider
     */
    function AzureSearchProvider(params) {
        /**
         * The name of the search provider
         */
        this.name = "Azure";
        this.params = params;
    }
    Object.defineProperty(AzureSearchProvider.prototype, "params", {
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
    AzureSearchProvider.prototype.query = function (options) {
        var _this = this;
        if (this.checkRequiredParams()) {
            var idField_1 = this.getParamValue(AzureSearchProvider.ID_FIELD_PARAM);
            return $.ajax({
                dataType: "json",
                url: this.buildQueryUrl(options),
                method: "GET",
                crossDomain: true,
                beforeSend: function (request) {
                    request.withCredentials = true;
                    request.setRequestHeader("Api-Key", _this.getParamValue(AzureSearchProvider.API_KEY_PARAM));
                }
            }).then(function (results) {
                return {
                    results: results.value.map(function (r) {
                        var prop = (_this.getParamValue(AzureSearchProvider.SEARCH_FIELDS) || "body").split(',')[0];
                        return {
                            id: r[idField_1],
                            textualMatch: r[prop] || "",
                            rawData: r.value
                        };
                    }),
                    total: results["@odata.count"],
                    offset: options.offset
                };
            });
        }
        else {
            throw new Error("Some Required Parameters Missing");
        }
    };
    /**
     * Checks the list of require params
     */
    AzureSearchProvider.prototype.checkRequiredParams = function () {
        if (this.params && this.params.length) {
            var required = AzureSearchProvider.supportedParameters.filter(function (p) { return p.required; }).map(function (p) { return p.name; });
            var toCheck = this.params.map(function (p) { return p.name; });
            // Make sure that we have all the required params
            return required.filter(function (p) { return toCheck.indexOf(p) >= 0; }).length === required.length;
        }
        return false;
    };
    /**
     * Gets the parameter value by name
     */
    AzureSearchProvider.prototype.getParamValue = function (name) {
        return this.params.filter(function (p) { return p.name === name; }).map(function (p) { return p.value; })[0];
    };
    /**
     * Builds a query url from query options
     */
    AzureSearchProvider.prototype.buildQueryUrl = function (options) {
        var baseUrl = this.getParamValue(AzureSearchProvider.URL_PARAM);
        var urlParams = [
            { key: "api-version", value: "2015-02-28" },
            { key: "$count", value: true } // Returns the total number of results
        ];
        if (options.offset >= 0) {
            urlParams.push({ key: "$skip", value: options.offset });
        }
        if (options.count >= 0) {
            urlParams.push({ key: "$top", value: options.count });
        }
        var searchFields = this.getParamValue(AzureSearchProvider.SEARCH_FIELDS) || [];
        var eq = options.query && options.query.where && options.query.where.eq;
        if (eq) {
            var searchColumns = Object.keys(eq);
            var cleared_1 = false;
            // This will allow for overriding of column based searches, so `title:Haha`, if * is used, then all columns in the search fields parameters is used
            var search = searchColumns.map(function (c) {
                if (c !== '*') {
                    if (!cleared_1) {
                        cleared_1 = true;
                        searchFields.length = 0;
                    }
                    searchFields.push(c);
                }
                return eq[c];
            }).join(" ");
            urlParams.push({ key: "search", value: search || '*' });
        }
        else {
            urlParams.push({ key: "search", value: '*' });
        }
        if (searchFields && searchFields.length) {
            urlParams.push({ key: "searchFields", value: searchFields });
        }
        return baseUrl + "?" + urlParams.map(function (p) { return p.key + "=" + p.value; }).join("&");
    };
    /**
     * The API Key param
     */
    AzureSearchProvider.API_KEY_PARAM = "API Key";
    /**
     * The field that uniquely identifies a given result
     */
    AzureSearchProvider.ID_FIELD_PARAM = "ID Field";
    /**
     * The URL param
     */
    AzureSearchProvider.URL_PARAM = "URL";
    /**
     * The fields to search when performing a text search
     */
    AzureSearchProvider.SEARCH_FIELDS = "Search Fields";
    /**
     * The parameters to call this service
     * for example - API Key, URL
     */
    AzureSearchProvider.supportedParameters = [{
            name: AzureSearchProvider.URL_PARAM,
            description: "The URL to the Azure Search Instance",
            value: undefined,
            required: true
        }, {
            name: AzureSearchProvider.API_KEY_PARAM,
            description: "The API Key",
            value: undefined,
            required: true
        }, {
            name: AzureSearchProvider.ID_FIELD_PARAM,
            description: "The field that uniquely identifies a given result",
            value: "emailid",
            required: true
        }, {
            name: AzureSearchProvider.SEARCH_FIELDS,
            description: "The fields to search when running a query (comma delimited)",
            value: "body",
            required: false
        }];
    return AzureSearchProvider;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AzureSearchProvider;
