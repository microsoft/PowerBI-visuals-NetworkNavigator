/**
 * Represents a search provider
 */
export interface ISearchProvider {
    // /**
    //  * Constructor for the search provider
    //  */
    // new(params: ISearchProviderParams[]) : ISearchProvider;

    /**
     * Runs a query against the given search provider
     */
    query(options: IQueryOptions) : PromiseLike<IQueryResult>;

    /**
     * The name of the search provider
     */
    name: string;

    // /**
    //  * The required parameters to call this service
    //  * for example - API Key, URL
    //  */
    // requiredParameters: ISearchProviderParams[]
    /**
     * The current set of params used
     */
    params: ISearchProviderParams[];
}

/**
 * Represents the static interface of a search provider
 */
export interface ISearchProviderStatic {
    /**
     * The supported parameters to call this service
     * for example - API Key, URL
     */
    supportedParameters: ISearchProviderParams[];

    /**
     * Constructor for the search provider
     */
    new(params?: ISearchProviderParams[]) : ISearchProvider;
}

/**
 * Represents a search provider
 */
export interface ISearchProviderParams {
    /**
     * The name of the param
     */
    name: string;

    /**
     * The description of the param
     */
    description?: string;

    /**
     * The value of the param
     */
    value?: string;

    /**
     * If the parameter is required to use the search provider
     */
    required?: boolean
}

/**
 * The query options for a search provider
 */
export interface IQueryOptions {

    /**
     * The offset into the results
     */
    offset?: number;

    /**
     * The number of results to return
     */
    count?: number;

    /**
     * The actual query
     */
    query: IQuery;
}

/**
 * Represents a query
 */
export interface IQuery {
    where: {
        eq: {
            [columnName: string] : any
        }
    }
}

/**
 * An individual item in a result
 */
export interface IQueryResultItem {

    /**
     * The unique identifier of the given result
     */
    id: any;

    /**
     * The text match of the result
     */
    textualMatch: string;

    /**
     * The raw data from the query
     */
    rawData: any;
}

export interface IQueryResult {

    // The total number of results
    total: number;

    // The offset number of the results
    offset: number;

    /**
     * The actual data
     */
    results: IQueryResultItem[];
}