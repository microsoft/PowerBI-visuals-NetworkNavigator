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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWxhc3RpY1NlYXJjaFNlYXJjaFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRWxhc3RpY1NlYXJjaFNlYXJjaFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbIkVsYXN0aWNTZWFyY2hTZWFyY2hQcm92aWRlciIsIkVsYXN0aWNTZWFyY2hTZWFyY2hQcm92aWRlci5jb25zdHJ1Y3RvciIsIkVsYXN0aWNTZWFyY2hTZWFyY2hQcm92aWRlci5wYXJhbXMiLCJFbGFzdGljU2VhcmNoU2VhcmNoUHJvdmlkZXIucXVlcnkiLCJFbGFzdGljU2VhcmNoU2VhcmNoUHJvdmlkZXIuY2hlY2tSZXF1aXJlZFBhcmFtcyIsIkVsYXN0aWNTZWFyY2hTZWFyY2hQcm92aWRlci5nZXRQYXJhbVZhbHVlIiwiRWxhc3RpY1NlYXJjaFNlYXJjaFByb3ZpZGVyLmJ1aWxkUXVlcnlVcmwiXSwibWFwcGluZ3MiOiJBQUVBOztHQUVHO0FBQ0g7SUFvRElBOztPQUVHQTtJQUNIQSxxQ0FBWUEsTUFBZ0NBO1FBUjVDQzs7V0FFR0E7UUFDSUEsU0FBSUEsR0FBV0EsZUFBZUEsQ0FBQ0E7UUFNbENBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO0lBQ3pCQSxDQUFDQTtJQU1ERCxzQkFBV0EsK0NBQU1BO2FBQWpCQTtZQUNJRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFFREY7O1dBRUdBO2FBQ0hBLFVBQWtCQSxNQUErQkE7WUFDN0NFLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBO1FBQzFCQSxDQUFDQTs7O09BUEFGO0lBVURBOztPQUVHQTtJQUNJQSwyQ0FBS0EsR0FBWkEsVUFBYUEsT0FBc0JBO1FBQW5DRyxpQkErQkNBO1FBOUJHQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxtQkFBbUJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxJQUFJQSxPQUFPQSxHQUFH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