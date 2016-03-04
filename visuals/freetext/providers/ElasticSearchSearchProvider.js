/**
 * Represents an elastic search provider
 */
var ElasticSearchSearchProvider = (function () {
    /**
     * Constructor for the search provider
     */
    function ElasticSearchSearchProvider(params) {
        /**
         * The name of the search provider
         */
        this.name = "ElasticSearch";
        this.params = params;
    }
    Object.defineProperty(ElasticSearchSearchProvider.prototype, "params", {
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
    ElasticSearchSearchProvider.prototype.query = function (options) {
        var _this = this;
        if (this.checkRequiredParams()) {
            var idField = this.getParamValue(ElasticSearchSearchProvider.ID_FIELD_PARAM);
            return $.ajax({
                dataType: "json",
                url: this.buildQueryUrl(options),
                method: "GET",
                crossDomain: true /*,
                beforeSend: (request) => {
                    request.withCredentials = true;
                    request.setRequestHeader("Api-Key", this.getParamValue(ElasticSearchSearchProvider.API_KEY_PARAM));
                }*/
            }).then(function (results) {
                var hits = results.hits.hits;
                return {
                    results: (hits || []).map(function (hit) {
                        var r = hit._source;
                        var prop = (_this.getParamValue(ElasticSearchSearchProvider.SEARCH_FIELDS) || "body").split(',')[0];
                        return {
                            id: r[idField],
                            textualMatch: r[prop] || "",
                            rawData: r
                        };
                    }),
                    total: results.hits.total,
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
    ElasticSearchSearchProvider.prototype.checkRequiredParams = function () {
        if (this.params && this.params.length) {
            var required = ElasticSearchSearchProvider.supportedParameters.filter(function (p) { return p.required; }).map(function (p) { return p.name; });
            var toCheck = this.params.map(function (p) { return p.name; });
            // Make sure that we have all the required params
            return required.filter(function (p) { return toCheck.indexOf(p) >= 0; }).length === required.length;
        }
        return false;
    };
    /**
     * Gets the parameter value by name
     */
    ElasticSearchSearchProvider.prototype.getParamValue = function (name) {
        return this.params.filter(function (p) { return p.name === name; }).map(function (p) { return p.value; })[0];
    };
    /**
     * Builds a query url from query options
     */
    ElasticSearchSearchProvider.prototype.buildQueryUrl = function (options) {
        var baseUrl = this.getParamValue(ElasticSearchSearchProvider.URL_PARAM);
        var urlParams = [];
        if (options.offset >= 0) {
            urlParams.push({ key: "from", value: options.offset });
        }
        if (options.count >= 0) {
            urlParams.push({ key: "size", value: options.count });
        }
        var searchFields = [this.getParamValue(ElasticSearchSearchProvider.SEARCH_FIELDS)] || [];
        var eq = options.query && options.query.where && options.query.where.eq;
        if (eq) {
            var searchColumns = Object.keys(eq);
            var cleared = false;
            // This will allow for overriding of column based searches, so `title:Haha`, if * is used, then all columns in the search fields parameters is used
            var search = searchColumns.map(function (c) {
                if (c !== '*') {
                    if (!cleared) {
                        cleared = true;
                        searchFields.length = 0;
                    }
                    searchFields.push(c);
                }
                return searchFields.map(function (n) { return n + ":" + "*" + eq[c] + "*"; }).join("OR");
            }).join(" ");
            urlParams.push({ key: "q", value: search || '*' });
        }
        // if (searchFields && searchFields.length) {
        //     urlParams.push({ key: "fields", value: searchFields.concat([this.getParamValue(ElasticSearchSearchProvider.ID_FIELD_PARAM)]).join(",") });
        // }
        return baseUrl + "?" + urlParams.map(function (p) { return p.key + "=" + p.value; }).join("&");
    };
    // /**
    //  * The API Key param
    //  */
    // public static API_KEY_PARAM = "API Key";
    /**
     * The field that uniquely identifies a given result
     */
    ElasticSearchSearchProvider.ID_FIELD_PARAM = "ID Field";
    /**
     * The URL param
     */
    ElasticSearchSearchProvider.URL_PARAM = "URL";
    /**
     * The fields to search when performing a text search
     */
    ElasticSearchSearchProvider.SEARCH_FIELDS = "Search Fields";
    /**
     * The parameters to call this service
     * for example - API Key, URL
     */
    ElasticSearchSearchProvider.supportedParameters = [{
            name: ElasticSearchSearchProvider.URL_PARAM,
            description: "The URL to the ElasticSearch Instance",
            value: undefined,
            required: true
        } /*, {
            name: ElasticSearchSearchProvider.API_KEY_PARAM,
            description: "The API Key",
            value: undefined,
            required: true
        }*/,
        {
            name: ElasticSearchSearchProvider.ID_FIELD_PARAM,
            description: "The field that uniquely identifies a given result",
            value: "emailid",
            required: true
        }, {
            name: ElasticSearchSearchProvider.SEARCH_FIELDS,
            description: "The fields to search when running a query (comma delimited)",
            value: "body",
            required: false
        }];
    return ElasticSearchSearchProvider;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ElasticSearchSearchProvider;
