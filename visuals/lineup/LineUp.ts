import { default as EventEmitter } from "../../base/EventEmitter";
import { default as Utils } from "../../base/Utils";
import * as _  from "lodash";
const $ = require("jquery");
const LineUpLib = require("./lib/lineup");

/**
 * Thin wrapper around the lineup library
 */
export class LineUp {
    /**
     * The default count amount
     */
    private static DEFAULT_COUNT = 100;

    /**
     * My lineup instance
     */
    public lineupImpl: any;

    /**
     * The list of events that we expose
     */
    public static EVENTS = {
        SORT_CHANGED: "sortChanged",
        FILTER_CHANGED: "filterChanged",
        CONFIG_CHANGED: "configurationChanged",
        SELECTION_CHANGED: "selectionChanged",
        LOAD_MORE_DATA: "loadMoreData",
        CLEAR_SELECTION: "clearSelection"
    };

    /**
     * The set of options used to query for new data
     */
    private queryOptions : IQueryOptions = {
        offset: 0,
        count: LineUp.DEFAULT_COUNT
    };

    /**
     * Simple tracker for the total number of results
     */
    private total: number;

    /**
     * My element
     */
    private element: JQuery;

    /**
     * THe current set of data in this lineup
     */
    private _data: ILineUpRow[];

    /**
     * The list of columns
     */
    private columns: ILineUpColumn[];

    /**
     * The current configuration of the LineUp instance
     */
    private _configuration: ILineUpConfiguration;

    /**
     * The list of rows
     */
    private rows: ILineUpRow[];

    /**
     * Whether or not we are currently saving the configuration
     */
    private savingConfiguration: boolean;

    /**
     * True if we are currently sorting lineup per the grid
     */
    private sortingFromConfig: boolean;

    /**
     * Represents the settings
     */
    public static DEFAULT_SETTINGS: ILineUpSettings = {
        selection: {
            singleSelect: false,
            multiSelect: true
        },
        sorting: {
            external: false
        },
        filtering: {
            external: false
        },
        presentation: {
            stacked: true,
            values: false,
            histograms: true,
            animation: true
        }
    };

    /**
     * The template for the grid
     */
    private template: string = `
        <div class="lineup-component">
            <div class="nav">
                <ul>
                    <li class="clear-selection" title="Clear Selection">
                        <a>
                            <span class="fa-stack">
                                <i class="fa fa-check fa-stack-1x"></i>
                                <i class="fa fa-ban fa-stack-2x"></i>
                            </span>
                        </a>
                    </li>
                    <li class="add-column" title="Add Column">
                        <a>
                            <span class="fa-stack">
                                <i class="fa fa-columns fa-stack-2x"></i>
                                <i class="fa fa-plus-circle fa-stack-1x"></i>
                            </span>
                        </a>
                    </li>
                    <li class="add-stacked-column" title="Add Stacked Column">
                        <a>
                            <span class="fa-stack">
                                <i class="fa fa-bars fa-stack-2x"></i>
                                <i class="fa fa-plus-circle fa-stack-1x"></i>
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
            <hr/>
            <div class="grid"></div>
        </div>
    `.trim();

    /**
     * A boolean indicating whehter or not we are currently loading more data
     */
    private loadingData = false;

    private _selectedRows: ILineUpRow[] = [];
    private _selectionEnabled: boolean = true;
    private _isMultiSelect: boolean = true;
    private _eventEmitter: EventEmitter;
    private _settings: ILineUpSettings = $.extend(true, {}, LineUp.DEFAULT_SETTINGS);

    /**
     * The configuration for the lineup viewer
     */
    private lineUpConfig : ILineUpSettings = <any>{
        svgLayout: {
            mode: 'separate'
        },
        interaction: {
            multiselect: () => this.isMultiSelect
        },
        sorting: {
            external: false
        },
        filtering: {
            external: false
        },
        histograms: {
            generator: (columnImpl, callback) => {
                var column = this.getColumnByName(columnImpl.column.id);
                var data : any = this._data;
                if (column && column.histogram) {
                    var perc = 1 / column.histogram.values.length;
                    var values = column.histogram.values.map((v, i) => ({
                        x: perc * i,
                        y: v,
                        dx: perc
                    }));
                    callback(values);
                } else {
                    var histgenerator = d3.layout.histogram();
                    histgenerator.range(columnImpl.scale.range());
                    histgenerator.value(function (row) { return columnImpl.getValue(row) ;});

                    //remove all the direct values to save space
                    var hist = histgenerator(data).map(function (bin) {
                        return {
                            x : bin.x,
                            dx : bin.dx,
                            y: bin.y
                        };
                    });
                    var max = d3.max(hist, function(d) { return d.y; });
                    hist.forEach(function (d) {
                        if (max > 0) {
                            d.y /= max;
                        } else {
                            d.y = 0;
                        }
                    });
                    callback(hist);
                }
            }
        }
    };

    /**
     * Constructor for the lineups
     */
    constructor(element: JQuery) {
        this.element = $(this.template);
        this.element.find('.clear-selection').on('click', () => {
            this.lineupImpl.clearSelection();
            this.raiseClearSelection();
        });
        this.element.find('.add-column').on('click', () => {
            this.lineupImpl.addNewSingleColumnDialog();
        });
        this.element.find('.add-stacked-column').on('click', () => {
            this.lineupImpl.addNewStackedColumnDialog();
        });
        this._eventEmitter = new EventEmitter();
        element.append(this.element);
    }

    /**
     * The number of the results to return
     */
    public get count(): number { return this.queryOptions.count || LineUp.DEFAULT_COUNT };
    public set count(value: number) {
        this.queryOptions.count = value || LineUp.DEFAULT_COUNT;
    }

    /**
     * Gets the data provider
     */
    private _dataProvider : IDataProvider;
    public get dataProvider() {
        return this._dataProvider;
    }

    /**
     * Sets the data provider to use
     */
    public set dataProvider(dataProvider: IDataProvider) {
        // Reset query vars
        this.queryOptions.offset = 0;

        this._dataProvider = dataProvider;
        if (this._dataProvider) {
            this.runQuery(true);
        }
    }

    /**
     * Gets the events object
     */
    public get events() {
        return this._eventEmitter;
    }

    /**
     * Gets the settings
     */
    public get settings() {
        return this._settings;
    }

    /**
     * Gets the current selection
     */
    public get selection() {
        return this._selectedRows;
    }

    /**
     * Sets the selection of lineup
     */
    public set selection(value: ILineUpRow[]) {
        this._selectedRows = this.updateRowSelection(value);
        this.lineupImpl.select(value);
    }

    /**
     * Sets the settings
     */
    public set settings(value: ILineUpSettings) {
        var newSettings: ILineUpSettings = $.extend(true, {}, LineUp.DEFAULT_SETTINGS, value);

        var singleSelect = newSettings.selection.singleSelect;
        var multiSelect = newSettings.selection.multiSelect;
        this.selectionEnabled = singleSelect || multiSelect;
        this.isMultiSelect = multiSelect;

        /** Apply the settings to lineup */
        let externalSort = !!value && !!value.sorting && !!value.sorting.external;
        let externalFilter = !!value && !!value.filtering && !!value.filtering.external;
        let histgenerator = !!value && !!value.histograms && value.histograms.generator;
        if (this.lineupImpl) {
            this.attachSelectionEvents();

            var presProps = newSettings.presentation;
            for (var key in presProps) {
                if (presProps.hasOwnProperty(key)) {
                    this.lineupImpl.changeRenderingOption(key, presProps[key]);
                }
            }
            this.lineupImpl.config.sorting = { external: externalSort };
            this.lineupImpl.config.filtering = { external: externalFilter };
            this.lineupImpl.config.histograms = { generator: histgenerator };
        }
        this.lineUpConfig.sorting.external = externalSort;
        this.lineUpConfig.filtering.external = externalFilter;
        this.lineUpConfig.histograms.generator = histgenerator;

        this._settings = newSettings;
    }

    /**
     * Gets this configuration
     */
    public get configuration(): ILineUpConfiguration {
        return this._configuration;
    }

    /**
     * Sets the column configuration that is used
     */
    public set configuration(value: ILineUpConfiguration) {
        this._configuration = value;

        this.applyConfigurationToLineup();
    }

    /**
     * Getter for selection enabled
     */
    public get selectionEnabled() {
        return this._selectionEnabled;
    }

    /**
     * Setter for selectionEnabled
     */
    public set selectionEnabled(value: boolean) {
        this._selectionEnabled = value;
        this.attachSelectionEvents();
    }


    /**
     * Getter for isMultiSelect
     */
    public get isMultiSelect() {
        return this._isMultiSelect;
    }

    /**
     * Setter for isMultiSelect
     */
    public set isMultiSelect(value: boolean) {
        this._isMultiSelect = value;
        this.attachSelectionEvents();
    }

    /**
     * Derives the desciption for the given column
     */
    public static createConfigurationFromData(data: ILineUpRow[]): ILineUpConfiguration {
        interface IMinMax {
            min?: number;
            max?: number;
        }

        const EXCLUDED_DATA_COLS = {
            selected: true,
            equals: true,
        };

        function getDataColumnNames(): string[] {
            if (data && data.length) {
                return Object.keys(data[0]).filter((k) => !EXCLUDED_DATA_COLS[k]);
            }
            return [];
        }

        function updateMinMax(minMax: IMinMax, value: number) {
            if (+value > minMax.max) {
                minMax.max = value;
            } else if (+value < minMax.min) {
                minMax.min = +value;
            }
        }

        function isNumeric(v) {
            // Assume that if null or undefined, it is numeric
            return v === 0 || v === null || v === undefined || LineUp.isNumeric(v);
        }

        function analyzeColumn(columnName: string) {
            const minMax: IMinMax = { min: Number.MAX_VALUE, max: 0 };
            const allNumeric = data.every((row) => isNumeric(row[columnName]));
            if (allNumeric) {
                data.forEach((row) => updateMinMax(minMax, row[columnName]));
            }
            return {allNumeric, minMax};
        }

        function createLineUpColumn(colName: string): ILineUpColumn {
            const result: ILineUpColumn = { column: colName, type: 'string' };
            let { allNumeric, minMax } = analyzeColumn(colName);

            if (allNumeric) {
                result.type = 'number';
                result.domain = [minMax.min, minMax.max];
            }

            // If is a string, try to see if it is a category
            if (result.type === 'string') {
                var sset = d3.set(data.map((row) => row[colName]));
                if (sset.size() <= Math.max(20, data.length * 0.2)) { //at most 20 percent unique values
                    result.type = 'categorical';
                    result.categories = sset.values().sort();
                }
            }
            return result;
        }

        const dataColNames = getDataColumnNames();
        const columns: ILineUpColumn[] = getDataColumnNames().map(createLineUpColumn);
        return {
            primaryKey: dataColNames[0],
            columns
        };
    }

    /**
     * Gets the sort from lineup
     */
    public getSortFromLineUp() : ILineUpSort {
        if (this.lineupImpl && this.lineupImpl.storage) {
            var primary = this.lineupImpl.storage.config.columnBundles.primary;
            var col = primary.sortedColumn;
            if (col) {
                if (col.column) {
                    return {
                        column: col.column.column,
                        asc: primary.sortingOrderAsc
                    };
                }
                return {
                    stack: col.label,
                    asc: primary.sortingOrderAsc
                };
            }
        }
    }

    /**
     * Runs the current query against the data provider
     */
    private runQuery(newQuery: boolean) {
        if (newQuery) {
            this.queryOptions.offset = 0;
            this.total = undefined;
        }
        if (!this.dataProvider) {
            return;
        }

        // Let everyone know we are loading more data
        this.raiseLoadMoreData();

        // We should only attempt to load more data, if we don't already have data loaded, or there is more to be loaded
        if (this.total === undefined || this.queryOptions.offset < this.total) {
            this.dataProvider.canQuery(this.queryOptions).then((value) => {
                this.loadingData = true;
                if (value) {
                    return this.dataProvider.query(this.queryOptions).then(r => {
                        this._data = this._data || [];
                        this._data = newQuery ? r.results : this._data.concat(r.results);

                        // We've moved the offset
                        this.queryOptions.offset += r.count;
                        this.total = r.total;

                        //derive a description file
                        var desc = this.configuration || LineUp.createConfigurationFromData(this._data);
                        var spec: any = {};
                        // spec.name = name;
                        spec.dataspec = desc;
                        delete spec.dataspec.file;
                        delete spec.dataspec.separator;
                        spec.dataspec.data = this._data;
                        spec.storage = LineUpLib.createLocalStorage(this._data, desc.columns, desc.layout, desc.primaryKey);

                        if (this.lineupImpl) {
                            this.lineupImpl.changeDataStorage(spec);
                        } else {
                            var finalOptions = $.extend(true, this.lineUpConfig, { renderingOptions: $.extend(true, {}, this.settings.presentation) });
                            this.lineupImpl = LineUpLib.create(spec, d3.select(this.element.find('.grid')[0]), finalOptions);
                            this.lineupImpl.listeners.on('change-sortcriteria.lineup', (ele, column, asc) => {
                                // This only works for single columns and not grouped columns
                                this.onLineUpSorted(column && column.column && column.column.id, asc);
                            });


                            this.lineupImpl.listeners.on('columns-changed.lineup', () => this.onLineUpColumnsChanged());
                            this.lineupImpl.listeners.on('change-filter.lineup', (x, column) => this.onLineUpFiltered(column));
                            var scrolled = this.lineupImpl.scrolled;
                            var me = this;

                            // The use of `function` here is intentional, we need to pass along the correct scope
                            this.lineupImpl.scrolled = function(...args) {
                                me.checkLoadMoreData.apply(me, args);
                                return scrolled.apply(this, args);
                            };

                            this.settings = this.settings;
                        }

                        this.selection = this._data.filter((n) => n.selected);

                        this.applyConfigurationToLineup();

                        // Store the configuration after it was possibly changed by load data
                        this.saveConfiguration();

                        this.loadingData = false;

                        setTimeout(() => this.checkLoadMoreData(), 10);
                    });
                }
            });
        }
    }

    /**
     * Retrieves our columns by name
     */
    private getColumnByName(colName: string) {
        return this.configuration && this.configuration.columns && this.configuration.columns.filter(c => c.column === colName)[0];
    }

    /**
     * Updates the selected state of each row, and returns all the selected rows
     */
    private updateRowSelection(sels: ILineUpRow[]) {
        this._data.forEach((d) => d.selected = false);
        return sels && sels.length ? sels.filter((d) => d.selected = true) : [];
    }

    /**
     * Saves the current layout
     */
    private saveConfiguration() {
        if (!this.savingConfiguration) {
            this.savingConfiguration = true;
            //full spec
            var s: ILineUpConfiguration = $.extend({}, {}, this.lineupImpl.spec.dataspec);
            //create current layout
            var descs = this.lineupImpl.storage.getColumnLayout()
                .map(((d) => d.description()));
            s.layout = _.groupBy(descs, (d: any) => d.columnBundle || "primary");
            s.sort = this.getSortFromLineUp();
            this.configuration = s;
            delete s['data'];
            this.raiseConfigurationChanged(this.configuration);
            this.savingConfiguration = false;
        }
    }

    /**
     * Applies our external config to lineup
     */
    private applyConfigurationToLineup() {
        if (this.lineupImpl) {
            var currentSort = this.getSortFromLineUp();
            if (this.configuration && this.configuration.sort && (!currentSort || !_.isEqual(currentSort, this.configuration.sort))) {
                this.sortingFromConfig = true;
                let sort = this.configuration.sort;
                this.lineupImpl.sortBy(sort.stack || sort.column, sort.asc);
                this.sortingFromConfig = false;
            }
            this.attachSelectionEvents();
        }
    }

    /**
     * Returns true if the given object is numeric
     */
    private static isNumeric = (obj) => (obj - parseFloat(obj) + 1) >= 0;

    /**
     * Checks to see if more data should be loaded based on the viewport
     */
    protected checkLoadMoreData() {
        // truthy this.dataView.metadata.segment means there is more data to be loaded
        var scrollElement = $(this.lineupImpl.$container.node()).find('div.lu-wrapper')[0];
        var scrollHeight = scrollElement.scrollHeight;
        var top = scrollElement.scrollTop;
        var shouldScrollLoad = scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200;
        if (shouldScrollLoad && !this.loadingData) {
            this.runQuery(false);
        }
    }


    /**
     * Attaches the line up events to lineup
     */
    private attachSelectionEvents() {
        if (this.lineupImpl) {
            // Cleans up events
            this.lineupImpl.listeners.on("multiselected.lineup", null);
            this.lineupImpl.listeners.on("selected.lineup", null);

            if (this.selectionEnabled) {
                if (this.isMultiSelect) {
                    this.lineupImpl.listeners.on("multiselected.lineup", (rows: ILineUpRow[]) => {
                        this._selectedRows = this.updateRowSelection(rows);
                        this.raiseSelectionChanged(rows);
                    });
                } else {
                    this.lineupImpl.listeners.on("selected.lineup", (row: ILineUpRow) => {
                        this._selectedRows = this.updateRowSelection(row ? [row] : []);
                        this.raiseSelectionChanged(this.selection)
                    });
                }
            }
        }
    }

    /**
     * Listener for when the lineup columns are changed.
     */
    private onLineUpColumnsChanged() {
        this.saveConfiguration();
    }

    /**
     * Listener for line up being sorted
     */
    private onLineUpSorted(column: string, asc: boolean) {
        if (!this.sortingFromConfig) {
            this.saveConfiguration();

            this.raiseSortChanged(column, asc);

            if (this.settings.sorting.external) {
                let newSort = this.getSortFromLineUp();

                // Set the new sort value
                this.queryOptions.sort = newSort ? [newSort] : undefined;

                // We are starting over since we sorted
                this.runQuery(true);
            }
        }
    }

    /**
     * Listener for lineup being filtered
     */
    private onLineUpFiltered(column) {
        var colName = column.getLabel();
        var ourColumn = this.configuration.columns.filter(n => n.column === colName)[0];
        var filter;
        if (ourColumn.type === "number") {
            filter = {
                column: colName,
                value: {
                    domain: column.scale.domain(),
                    range: column.scale.range()
                }
            };
        } else {
            filter = {
                column: colName,
                value: column.filter
            };
        }
        this.saveConfiguration();
        this.raiseFilterChanged(filter);

        if (this.settings.filtering.external) {
            // Set the new filter value
            console.error("This should support multiple filters");
            this.queryOptions.query = filter ? [filter] : undefined;

            // We are starting over since we filtered
            this.runQuery(true);
        }
    }

    /**
     * Raises the configuration changed event
     */
    private raiseConfigurationChanged(configuration: ILineUpConfiguration) {
        this.events.raiseEvent(LineUp.EVENTS.CONFIG_CHANGED, configuration);
    }

    /**
     * Raises the filter changed event
     */
    private raiseSortChanged(column: string, asc: boolean) {
        this.events.raiseEvent(LineUp.EVENTS.SORT_CHANGED, column, asc);
    }

    /**
     * Raises the filter changed event
     */
    private raiseFilterChanged(filter: any) {
        this.events.raiseEvent(LineUp.EVENTS.FILTER_CHANGED, filter);
    }

    /**
     * Raises the selection changed event
     */
    private raiseSelectionChanged(rows: ILineUpRow[]) {
        this.events.raiseEvent(LineUp.EVENTS.SELECTION_CHANGED, rows);
    }

    /**
     * Raises the load more data event
     */
    private raiseLoadMoreData() {
        this.events.raiseEvent(LineUp.EVENTS.LOAD_MORE_DATA);
    }

    /**
     * Raises the load more data event
     */
    private raiseClearSelection() {
        this.events.raiseEvent(LineUp.EVENTS.CLEAR_SELECTION);
    }
}

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

export interface ILineUpLayoutColumn {
    width: number;
    column: string;
    type: string;
    filter?: string; // The filter applied to string based columns
    range?: [number, number]; // The range applied to number based columns
    weight?: number;
    label?: string;
    sort?: boolean; // If defined, sorted. True asc, false desc
    children?: ILineUpLayoutColumn[]
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
    layout?: {
        /**
         * The layout name
         */
        [name: string]: ILineUpLayoutColumn[]
    }

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
    sorting?: {
        external?: boolean;
    };
    filtering?: {
        external?: boolean;
    };
    histograms?: {
        generator?: (column, callback) => any;
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
    query?: {
        column: string;
        value: string | {
            domain: number;
            range: number;
        };
    }[];

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
     * The total number of results
     */
    total?: number;

    /**
     * The number of returned results
     */
    count: number;

    /**
     * The matching results
     */
    results: ILineUpRow[];
}