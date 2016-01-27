import { ISearchProvider, IQuery, IQueryResult } from "./providers/ISearchProvider";
import { AdvancedSlicer, SlicerItem } from "../advancedslicer/AdvancedSlicer";

/**
 * Implements a free text search
 */
export class FreeTextSearch extends AdvancedSlicer {
    /**
     * The default skip amount for free text search
     */
    public static DEFAULT_SKIP_AMOUNT = 20;

    /**
     * A static list of providers
     */
    public static DEFAULT_PROVIDERS = require('./providers');

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
                this.offset = undefined;
                this.total = undefined;
            }
            item.result = this.loadData((this.offset || 0) + this.skip);
        });
        this.searchProvider = provider;
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
            this.raiseLoadMoreData(true);
        }
    }

    /**
     * Loads the data from the services
     */
    public loadData(offset: number) : PromiseLike<SlicerItem[]> {
        this.offset = undefined;
        this.total = undefined;

        return this.searchProvider.query({
            offset: offset || 0,
            query: this.buildQuery(this.searchString)
        }).then((results) => {
            this.offset = results.offset;
            this.total = results.total;
            return results.data.map((d) => {
                return <SlicerItem>{
                    category: d.body.substring(0, 20),
                    value: 0,
                    renderedValue: 0
                };
            });
        });
    }

    /**
     * Builds the query
     */
    private buildQuery(text: string) : IQuery {
        return {
            where: {
                eq: {
                    '*': text || '*'
                }
            }
        };
    }
}