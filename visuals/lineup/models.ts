/**
 * The line up row
 */
export interface ILineUpRow {

    /**
     * Data for each column in the row
     */
    [columnName: string]: any;

    /**
     * Whether or not this row is selected
     */
    selected: boolean;

    /**
     * Returns true if this lineup row equals another
     */
    equals(b: ILineUpRow): boolean;
}

export interface ILineUpSort {
    /**
     * The column that was sorted
     */
    column?: string;

    /**
     * The stack that was sorted
     */
    stack?: string;

    /**
     * If the sort was ascending
     */
    asc: boolean;
}

/**
 * Rerepents a column in lineup
 */
export interface ILineUpColumn {
    /**
     * The field name of the column
     */
    column: string;

    /**
     * The displayName for the column
     */
    label?: string;

    /**
     * The type of column it is
     * values: string|number
     */
    type: string;

    /**
     * The categories of this column
     */
    categories?: string[];

    /**
     * The histogram of the column
     */
    histogram?: {
        min?: number;
        max?: number;
        values: number[];
    };

    /**
     * The domain of the column, only for number based columns
     */
    domain?: [number, number]
}

/**
 * Represents the configuration of a lineup instance
 */
export interface ILineUpConfiguration {
    /**
     * The primary key of the layout
     */
    primaryKey: string;

    /**
     * The list of columns for lineup
     */
    columns: ILineUpColumn[];

    /**
     * The layout of the columns
     */
    layout?: any;

    /**
     * The sort of the lineup
     */
    sort?: ILineUpSort;
}

/**
 * Represents settings in lineup
 */
export interface ILineUpSettings {
    selection?: {
        singleSelect?: boolean;
        multiSelect?: boolean;
    };
    presentation?: {
        values?: boolean;
        stacked?: boolean;
        histograms?: boolean;
        animation?: boolean;
    };
}

/**
 * Provides the data provider interface for lineup
 */
export interface IDataProvider {

    /**
     * Returns true if the data provider can be queried with the given set of options, this allows for data sources which don't know their total counts to query
     */
    canQuery(options: IQueryOptions) : PromiseLike<boolean>;

    /**
     * Asks the data provider to load more data
     */
    query(options: IQueryOptions): PromiseLike<IQueryResult>;

    /**
     * Generates a histogram for the values, each value must be between 0-1
     */
    generateHistogram(column: ILineUpColumn, options: IQueryOptions) : PromiseLike<number[]>;

    /**
     * Called when the data should be sorted
     */
    sort?: (sort: ILineUpSort) => void;

    /**
     * Called when the data is filtered
     */
    filter?: (filter: IFilter) => void;
}

/**
 * Represents a filter
 */
export interface IFilter {
    column: string;
    value: string | {
        domain: [number, number];
        range: [number, number];
    };
}

export interface IQueryOptions {

    /**
     * The offset into the dataset to retrieve
     */
    offset: number;

    /**
     * The number of objects to return
     */
    count: number;

    /**
     * The query to run
     */
    query?: IFilter[];

    /**
     * The current sort
     */
    sort?: ILineUpSort[];
}

/**
 * The query result interface
 */
export interface IQueryResult {
    /**
     * The number of returned results
     */
    count: number;

    /**
     * The matching results
     */
    results: ILineUpRow[];
}