/**
 * The line up row
 */
export interface ITableSorterRow {

    /**
     * Data for each column in the row
     */
    [columnName: string]: any;
    
    /**
     * Some unique ID column
     */
    id: string|number;

    /**
     * Whether or not this row is selected
     */
    selected: boolean;

    /**
     * Returns true if this table sorter row equals another
     */
    equals(b: ITableSorterRow): boolean;
}

export interface ITableSorterSort {
    /**
     * The column that was sorted
     */
    column?: string;

    /**
     * The stack that was sorted, and the column weights
     */
    stack?: {
        name: string;
        columns?: [{
            column: string;
            weight: number;
        }];
    };

    /**
     * If the sort was ascending
     */
    asc: boolean;
}

/**
 * Rerepents a column in table sorter
 */
export interface ITableSorterColumn {
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
 * Represents the configuration of a table sorter instance
 */
export interface ITableSorterConfiguration {
    /**
     * The primary key of the layout
     */
    primaryKey: string;

    /**
     * The list of columns for table sorter
     */
    columns: ITableSorterColumn[];

    /**
     * The layout of the columns
     */
    layout?: any;

    /**
     * The sort of the table sorter
     */
    sort?: ITableSorterSort;
}

/**
 * Represents settings in table sorter
 */
export interface ITableSorterSettings {
    selection?: {

        /**
         * Enables single select mode
         */
        singleSelect?: boolean;

        /**
         * Enables multiselect mode
         */
        multiSelect?: boolean;
    };
    presentation?: {
        
        /**
         * Provides a mapping from column index to colors
         */
        columnColors?: (columnIdx: number) => string;

        /**
         * Show row values
         */
        values?: boolean;

        /**
         * Is stacking supported
         */
        stacked?: boolean;

        /**
         * Should histograms be visible on the column headers
         */
        histograms?: boolean;

        /**
         * Should animation be used when transitioning states in table sorter
         */
        animation?: boolean;

        /**
         * Should tooltips be shown for each row
         */
        tooltips?: boolean;
    };
}

/**
 * Provides the data provider interface for table sorter
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
    generateHistogram(column: ITableSorterColumn, options: IQueryOptions) : PromiseLike<number[]>;

    /**
     * Called when the data should be sorted
     */
    sort?: (sort: ITableSorterSort) => void;

    /**
     * Called when the data is filtered
     */
    filter?: (filter: ITableSorterFilter) => void;
}

/**
 * Represents a filter
 */
export interface ITableSorterFilter {
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
    query?: ITableSorterFilter[];

    /**
     * The current sort
     */
    sort?: ITableSorterSort[];
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
    results: ITableSorterRow[];
}