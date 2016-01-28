import { ISearchProvider, ISearchProviderParams, IQueryOptions, IQueryResult, IQueryResultItem } from "./ISearchProvider";

/**
 * Represents an azure search provider
 */
export default class AzureSearchProvider implements ISearchProvider {
    /**
     * The API Key param
     */
    public static API_KEY_PARAM = "API Key";

    /**
     * The field that uniquely identifies a given result
     */
    public static ID_FIELD_PARAM = "ID Field";

    /**
     * The URL param
     */
    public static URL_PARAM = "URL";

    /**
     * The fields to search when performing a text search
     */
    public static SEARCH_FIELDS = "Search Fields";

    /**
     * The parameters to call this service
     * for example - API Key, URL
     */
    public static supportedParameters: ISearchProviderParams[] = [{
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

    /**
     * The name of the search provider
     */
    public name: string = "Azure";

    /**
     * Constructor for the search provider
     */
    constructor(params?: ISearchProviderParams[]) {
        this.params = params;
    }

    /**
     * The parameters used to call the service
     */
    private _params: ISearchProviderParams[];
    public get params(): ISearchProviderParams[] {
        return this._params;
    }

    /**
     * Sets the params of the search provider
     */
    public set params(params: ISearchProviderParams[]) {
        this._params = params;
    }


    /**
     * Runs a query against the given search provider
     */
    public query(options: IQueryOptions): PromiseLike<IQueryResult> {
        if (this.checkRequiredParams()) {
            let idField = this.getParamValue(AzureSearchProvider.ID_FIELD_PARAM);
            return $.ajax({
                dataType: "json",
                url: this.buildQueryUrl(options),
                method: "GET",
                crossDomain: true,
                beforeSend: (request) => {
                    request.withCredentials = true;
                    request.setRequestHeader("Api-Key", this.getParamValue(AzureSearchProvider.API_KEY_PARAM));
                }
            }).then((results) => {
                return <IQueryResult>{
                    results: results.value.map((r) => {
                        var prop = (this.getParamValue(AzureSearchProvider.SEARCH_FIELDS) || "body").split(',')[0];
                        return <IQueryResultItem> {
                            id: r[idField],
                            textualMatch: r[prop] || "",
                            rawData: r.value
                        };
                    }),
                    total: results["@odata.count"],
                    offset: options.offset
                };
            });
        } else {
            throw new Error("Some Required Parameters Missing");
        }
    }

    /**
     * Checks the list of require params
     */
    public checkRequiredParams(): boolean {
        if (this.params && this.params.length) {
            var required = AzureSearchProvider.supportedParameters.filter(p => p.required).map((p) => p.name);
            var toCheck = this.params.map((p) => p.name);
            // Make sure that we have all the required params
            return required.filter((p) => toCheck.indexOf(p) >= 0).length === required.length;
        }
        return false;
    }

    /**
     * Gets the parameter value by name
     */
    public getParamValue(name: string): any {
        return this.params.filter(p => p.name === name).map(p => p.value)[0];
    }

    /**
     * Builds a query url from query options
     */
    public buildQueryUrl(options: IQueryOptions): string {
        let baseUrl = this.getParamValue(AzureSearchProvider.URL_PARAM);
        let urlParams: { key: string; value: any; }[] = [
            { key: "api-version", value: "2015-02-28" },
            { key: "$count", value: true } // Returns the total number of results
        ];

        if (options.offset >= 0) {
            urlParams.push({ key: "$skip", value: options.offset });
        }

        if (options.count >= 0) {
            urlParams.push({ key: "$top", value: options.count });
        }

        let searchFields = this.getParamValue(AzureSearchProvider.SEARCH_FIELDS) || [];
        let eq = options.query && options.query.where && options.query.where.eq;
        if (eq) {
            let searchColumns = Object.keys(eq);
            let cleared = false;
            // This will allow for overriding of column based searches, so `title:Haha`, if * is used, then all columns in the search fields parameters is used
            let search = searchColumns.map((c) => {
                if (c !== '*') {
                    if (!cleared) {
                        cleared = true;
                        searchFields.length = 0;
                    }
                    searchFields.push(c);
                }
                return eq[c];
            }).join(" ");
            urlParams.push({ key: "search", value: search || '*' });
        } else {
            urlParams.push({ key: "search", value: '*' });
        }

        if (searchFields && searchFields.length) {
            urlParams.push({ key: "searchFields", value: searchFields });
        }

        return baseUrl + "?" + urlParams.map(p => p.key + "=" + p.value).join("&");
    }
}