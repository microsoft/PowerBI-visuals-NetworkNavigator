import { ISearchProvider, ISearchProviderParams, IQueryOptions, IQueryResult, IQueryResultItem } from "./ISearchProvider";

/**
 * Represents an elastic search provider
 */
export default class JSONSearchProvider implements ISearchProvider {
    // /**
    //  * The API Key param
    //  */
    // public static API_KEY_PARAM = "API Key";

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
    public static supportedParameters: ISearchProviderParams[] = [/*, {
        name: JSONSearchProvider.API_KEY_PARAM,
        description: "The API Key",
        value: undefined,
        required: true
    }*/, {
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

    /**
     * The name of the search provider
     */
    public name: string = "JSON";

    /**
     * The data behind this provider
     */
    private data: any[];

    /**
     * Constructor for the search provider
     */
    constructor(params: ISearchProviderParams[], data: any[]) {
        this.params = params;
        this.data = data;
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
            let idField = this.getParamValue(JSONSearchProvider.ID_FIELD_PARAM);
            let final = this.data.slice(0);
            let eq = options.query && options.query.where && options.query.where.eq;
            if (eq) {
                let searchColumns = Object.keys(eq);
                let cleared = false;
                // This will allow for overriding of column based searches, so `title:Haha`, if * is used, then all columns in the search fields parameters is used
                let searchFilters = searchColumns.forEach((c) => {
                    let searchValue = eq[c];
                    if (c !== '*') {
                        final = final.filter(item => item[c].indexOf(searchValue) >= 0);
                    } else {
                        if (searchValue !== "*") {
                            final = final.filter(item => {
                                return Object.keys(item).filter(column => {
                                    let result = item[column];
                                    if (result && result.indexOf) {
                                        return result.indexOf(searchValue) >= 0;
                                    }
                                }).length > 0;
                            });
                        }
                    }
                });
            }
            let filteredCount = final.length;
            if (options.offset) {
                final = final.slice(options.offset);
            }
            if (options.count) {
                final = final.slice(0, options.count);
            }
            return new Promise((resolve) => {
               setTimeout(() => resolve({
                    results: final.map((r) => {
                        var prop = (this.getParamValue(JSONSearchProvider.SEARCH_FIELDS) || "body").split(',')[0];
                        return <IQueryResultItem> {
                            id: r[idField],
                            textualMatch: r[prop] || "",
                            rawData: r
                        };
                    }),
                    total: filteredCount,
                    offset: options.offset
                }), 5000);
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
            var required = JSONSearchProvider.supportedParameters.filter(p => p.required).map((p) => p.name);
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
}