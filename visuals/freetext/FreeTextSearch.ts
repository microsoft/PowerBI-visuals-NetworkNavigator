import { ISearchProvider, ISearchProviderStatic, IQuery, IQueryResult } from "./providers/ISearchProvider";
import { AdvancedSlicer, SlicerItem } from "../advancedslicer/AdvancedSlicer";

/**
 * Implements a free text search
 */
export class FreeTextSearch extends AdvancedSlicer {
    /**
     * The default skip amount for free text search
     */
    public static DEFAULT_SKIP_AMOUNT = 100;

    /**
     * A static list of providers
     */
    public static DEFAULT_PROVIDERS = <ISearchProviderStatic[]>require('./providers');

    /**
     * The skip amount
     */
    private skip : number = FreeTextSearch.DEFAULT_SKIP_AMOUNT;

    /**
     * Last result offset
     */
    private offset : number;

    /**
     * The total number of results
     */
    private total: number;

    /**
     * Constructor for the free text search
     */
    constructor(element: JQuery, provider?: ISearchProvider) {
        super(element);

        this.serverSideSearch = true;
        this.events.on("canLoadMoreData", (item, isSearch) => {
            item.result = isSearch || (typeof this.offset === 'undefined' || typeof this.total === 'undefined' || this.offset < this.total);
        });
        this.events.on("loadMoreData", (item, isNewSearch) => {
            if (isNewSearch) { // We're starting all over
                this.offset = this.skip * -1; // Negate this so we don't add it, and start over
                this.total = undefined;
            }
            item.result = this.loadData((this.offset || 0) + this.skip);
        });
        this.searchProvider = provider;
        this.showHighlight = true;
    }

    /**
     * Gets the search provider
     */
    private _searchProvider : ISearchProvider;
    public get searchProvider() : ISearchProvider {
        return this._searchProvider;
    }

    /**
     * Setter for the search provider
     */
    public set searchProvider (provider: ISearchProvider) {
        this._searchProvider = provider;

        this.offset = undefined;
        this.total = undefined;
        this.data = [];

        if (provider) {
            this.loadingMoreData = true;
            this.loadData(0).then(n => {
                this.data = n;
                this.loadingMoreData = false;
                setTimeout(() => this.checkLoadMoreData(), 10);
            });
        }
    }

    /**
     * Loads the data from the services
     */
    public loadData(offset: number) : PromiseLike<SlicerItemWithId[]> {
        this.offset = undefined;
        this.total = undefined;

        let query = this.buildQuery(this.searchString);
        return this.searchProvider.query({
            offset: offset || 0,
            count: this.skip,
            query: query
        }).then((results) => {
            this.offset = results.offset;
            this.total = results.total;
            return results.results.map((d) => {
                var textResult = d.textualMatch;
                let searchString = this.searchString;
                if (this.searchString) {
                    var cols = Object.keys(query.where.eq);
                    searchString = query.where.eq[cols[0]];
                }
                searchString = searchString.replace(/\"/g, "");
                var idx = textResult.search(new RegExp(searchString, "i"));
                var match = textResult;
                var prefix = "";
                var suffix = "";
                if (searchString && idx >= 0) {
                    var firstIdx = Math.max(0, idx - Math.ceil(searchString.length / 2));
                    prefix = match.substring(firstIdx, idx);
                    suffix = match.substring(idx + searchString.length , idx + searchString.length + Math.ceil(searchString.length / 2));
                    match = match.substring(idx, idx + searchString.length);
                } else {
                    suffix = match.substring(0, 30);
                    match = "";
                }
                var item : SlicerItemWithId = {
                    id: d.id,
                    match: match,
                    matchPrefix: prefix,
                    matchSuffix: suffix,
                    selected: false,
                    value: 0,
                    renderedValue: undefined
                };

                return item;
            });
        });
    }

    /**
     * Builds the query
     */
    private buildQuery(searchText: string) : IQuery {
        let column = "*";

        // If searchString looks like "emailId::5432", then use everything before it as a column search
        if (searchText) {
            let parts = searchText.split("::");
            if (parts.length === 2) {
                column = parts[0];
                searchText = parts[1];
            }
        }
        searchText = searchText || "*";
        return {
            where: {
                eq: {
                    [column]: searchText
                }
            }
        };
    }
}


/**
 * A slicer item that has an id
 */
export interface SlicerItemWithId extends SlicerItem {
    /**
     * The unique identifier for this item
     */
    id: any;
}