import { default as EventEmitter } from "../../base/EventEmitter";
import { default as Utils } from "../../base/Utils";
const LineUpLib = require("./lib/lineup");

/**
 * Thin wrapper around the lineup library
 */
export class LineUp {

    /**
     * My lineup instance
     */
    public lineupImpl : any;

    /**
     * The list of events that we expose
     */
    public static EVENTS = {
        SORT_CHANGED: "sortChanged",
        FILTER_CHANGED: "filterChanged",
        CONFIG_CHANGED: "configurationChanged",
        SELECTION_CHANGED: "selectionChanged",
        LOAD_MORE_DATA: "loadMoreData",
        CAN_LOAD_MORE_DATA: "canLoadMoreData"
    };

    /**
     * My element
     */
    private element: JQuery;

    /**
     * THe current set of data in this lineup
     */
    private _data : ILineUpRow[];

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
    private savingConfiguration : boolean;

    /**
     * True if we are currently sorting lineup per the grid
     */
    private sortingFromConfig: boolean;

    /**
     * Represents the settings
     */
    public static DEFAULT_SETTINGS : ILineUpSettings = {
        selection: {
            singleSelect: false,
            multiSelect: true
        },
        sorting: {
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
        <div>
            <div class="grid"></div>
        </div>
    `.trim();

    /**
     * A boolean indicating whehter or not we are currently loading more data
     */
    private loadingMoreData = false;

    private _selectedRows : ILineUpRow[] = [];
    private _selectionEnabled: boolean = true;
    private _isMultiSelect: boolean = true;
    private _eventEmitter: EventEmitter;
    private _settings : ILineUpSettings = $.extend(true, {}, LineUp.DEFAULT_SETTINGS);

    /**
     * The configuration for the lineup viewer
     */
    private lineUpConfig = {
        svgLayout: {
            mode: 'separate',
            addPlusSigns: true,
            plusSigns: {
                addStackedColumn: {
                    name: "Add a new Stacked Column",
                    action: "addNewEmptyStackedColumn",
                    x: 0, y: 2,
                    w: 21, h: 21 // LineUpGlobal.htmlLayout.headerHeight/2-4
                },

                addColumn: {
                    title: "Add a Column",
                    action: () => this.lineupImpl.addNewSingleColumnDialog(),
                    x: 0, y: 2,
                    w: 21, h: 21 // LineUpGlobal.htmlLayout.headerHeight/2-4
                }
            }
        },
        interaction: {
            multiselect: () => this.isMultiSelect
        },
        sorting: {
            external: true
        }
    };

    /**
     * Constructor for the lineups
     */
    constructor(element: JQuery) {
        this.element = $(this.template);
        this._eventEmitter = new EventEmitter();
        element.append(this.element);
    }

    /**
     * Gets the data contained in lineup
     */
    public getData() {
        return this._data;
    }

    /**
     * Loads the data into the lineup view
     */
    public setData(rows: ILineUpRow[]) {
        this._data = rows;

        //derive a description file
        var desc = this.configuration || LineUp.createConfigurationFromData(rows);
        var spec: any = {};
        // spec.name = name;
        spec.dataspec = desc;
        delete spec.dataspec.file;
        delete spec.dataspec.separator;
        spec.dataspec.data = rows;
        spec.storage = LineUpLib.createLocalStorage(rows, desc.columns, desc.layout, desc.primaryKey);

        if (this.lineupImpl) {
            this.lineupImpl.changeDataStorage(spec);
        } else {
            var finalOptions = $.extend(true, this.lineUpConfig, { renderingOptions: $.extend(true, {}, this.settings.presentation) });
            this.lineupImpl = LineUpLib.create(spec, d3.select(this.element.find('.grid')[0]), finalOptions);
            this.lineupImpl.listeners.on('change-sortcriteria.lineup', (ele, column, asc) => {
                // This only works for single columns and not grouped columns
                this.onLineUpSorted(column && column.column && column.column.id, asc);
            });
            this.lineupImpl.listeners.on('change-filter.lineup', (x, column) => this.onLineUpFiltered(column));
            var scrolled = this.lineupImpl.scrolled;
            var me = this;

            // The use of `function` here is intentional, we need to pass along the correct scope
            this.lineupImpl.scrolled = function(...args) {
                me.onLineUpScrolled.apply(me, args);
                return scrolled.apply(this, args);
            };
        }

        this.selection = rows.filter((n) => n.selected);

        this.applyConfigurationToLineup();

        // Store the configuration after it was possibly changed by load data
        this.saveConfiguration();

        this.loadingMoreData = false;
    }

    /**
     * Appends data to the end
     */
    public appendData(rows: ILineUpRow[]) {
        // Hack for now
        this.setData((this._data || []).concat(rows))
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
        var newSettings : ILineUpSettings = $.extend(true, {}, LineUp.DEFAULT_SETTINGS, value);

        var singleSelect = newSettings.selection.singleSelect;
        var multiSelect = newSettings.selection.multiSelect;
        this.selectionEnabled = singleSelect || multiSelect;
        this.isMultiSelect = multiSelect;

        /** Apply the settings to lineup */
        if (this.lineupImpl) {
            this.attachSelectionEvents();

            var presProps = newSettings.presentation;
            for (var key in presProps) {
                if (presProps.hasOwnProperty(key)) {
                    this.lineupImpl.changeRenderingOption(key, presProps[key]);
                }
            }
            this.lineupImpl.config.sorting = { external: !!value && !!value.sorting && !!value.sorting.external };
        }
        this._settings = newSettings;
    }

    /**
     * Gets this configuration
     */
    public get configuration() : ILineUpConfiguration {
        return this._configuration;
    }

    /**
     * Sets the column configuration that is used
     */
    public set configuration (value: ILineUpConfiguration) {
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
    public static createConfigurationFromData(data: ILineUpRow[]) : ILineUpConfiguration {
        let dataCols : string[] = [];
        if (data && data.length) {
            for (var key in data[0]) {
                dataCols.push(key);
            }
        }
        var cols = dataCols.map((col) => {
            var r: ILineUpColumn = {
                column: col,
                type: 'string'
            };
            // if (this.settings.data.inferColumnTypes) {
                var allNumeric = true;
                var minMax = { min: Number.MAX_VALUE, max: 0 };
                for (var i = 0; i < data.length; i++) {
                    var value = data[i][r.column];
                    if (value !== 0 && !!value && !LineUp.isNumeric(value)) {
                        allNumeric = false;
                        break;
                    } else {
                        if (+value > minMax.max) {
                            minMax.max = value;
                        } else if (+value < minMax.min) {
                            minMax.min = +value;
                        }
                    }
                }
                if (allNumeric) {
                    r.type = 'number';
                    r.domain = [minMax.min, minMax.max];
                }
            // }
            /*else {
                if (col.type.numeric) {
                    r.type = 'number';
                    r.domain = d3.extent(data, (row) => row[col.label] && row[col.label].length === 0 ? undefined : +(row[col.label]));
                }
            }*/

            // If is a string, try to see if it is a category
            if (r.type === 'string') {
                var sset = d3.set(data.map((row) => row[col]));
                if (sset.size() <= Math.max(20, data.length * 0.2)) { //at most 20 percent unique values
                    r.type = 'categorical';
                    r.categories = sset.values().sort();
                }
            }
            return r;
        });
        return {
            primaryKey: dataCols[0],
            columns: cols
        };
    }

    /**
     * Gets the sort from lineup
     */
    public getSortFromLineUp() {
        if (this.lineupImpl && this.lineupImpl.storage) {
            var primary = this.lineupImpl.storage.config.columnBundles.primary;
            var col = primary.sortedColumn;
            if (col) {
                if (col.column) {
                    return {
                        column: col.column.column,
                        asc: primary.sortingOrderAsc
                    };
                } else {
                    // Stacked
                }
            }
        }
    }

    /**
     * Updates the selected state of each row, and returns all the selected rows
     */
    private updateRowSelection(sels : ILineUpRow[]) {
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
            var s : ILineUpConfiguration = $.extend({}, {}, this.lineupImpl.spec.dataspec);
            //create current layout
            var descs = this.lineupImpl.storage.getColumnLayout()
            .map(((d) => d.description()));
            s.layout = _.groupBy(descs, (d) => d.columnBundle || "primary");
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
                this.lineupImpl.sortBy(this.configuration.sort.column, this.configuration.sort.asc);
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
     * Listener for when the lineup viewer is scrolled
     */
    private onLineUpScrolled() {
        // truthy this.dataView.metadata.segment means there is more data to be loaded
        if (!this.loadingMoreData && this.raiseCanLoadMoreData()) {
            var scrollElement = $(this.lineupImpl.$container.node()).find('div.lu-wrapper')[0];
            var scrollHeight = scrollElement.scrollHeight;
            var top = scrollElement.scrollTop;
            if (scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200) {
                this.loadingMoreData = true;
                this.raiseLoadMoreData();
            }
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
     * Listener for line up being sorted
     */
    private onLineUpSorted(column : string, asc : boolean) {
        if (!this.sortingFromConfig) {
            this.saveConfiguration();
            this.raiseSortChanged(column, asc);
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
     * Raises the can load more data event
     */
    private raiseCanLoadMoreData(): boolean {
        var result = {
            result: false
        };
        this.events.raiseEvent(LineUp.EVENTS.CAN_LOAD_MORE_DATA, result);
        return result.result;
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
     * The domain of the column, only for number based columns
     */
    domain?: [number, number]
}

interface ILineUpLayoutColumn {
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
    sort? : {
        column: string;
        asc: boolean;
    }
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
    presentation?: {
        values?: boolean;
        stacked?: boolean;
        histograms?: boolean;
        animation?: boolean;
    };
}