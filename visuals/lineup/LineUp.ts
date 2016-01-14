import { default as EventEmitter } from "../../base/EventEmitter";
import { default as Utils } from "../../base/Utils";
const LineUpLib = require("./lib/lineup");

/**
 * Thin wrapper around the lineup library
 */
export class LineUp {
    private element: JQuery;

    /**
     * My lineup instance
     */
    private lineup : any;

    /**
     * The list of columns
     */
    private columns: ILineUpColumn[];

    /**
     * The list of rows
     */
    private rows: ILineUpRow[];

    /**
     * Represents the settings
     */
    public static DEFAULT_SETTINGS : ILineUpSettings = {
        selection: {
            singleSelect: true,
            multiSelect: true
        },
        data: {
            inferColumnTypes: false
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

    private _selectionEnabled: boolean;
    private _isMultiSelect: boolean;
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
                    action: () => this.lineup.addNewSingleColumnDialog(),
                    x: 0, y: 2,
                    w: 21, h: 21 // LineUpGlobal.htmlLayout.headerHeight/2-4
                }
            }
        },
        interaction: {
            multiselect: () => this.isMultiSelect
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
     * Loads the data into the lineup view
     */
    public loadData(columns: ILineUpColumn[], rows: ILineUpRow[], force: boolean = false) {
        //derive a description file
        var desc = this.deriveDesc(columns, rows);
        var name = 'data';
        this.loadDataImpl(name, desc, rows, force);
        this.loadingMoreData = false;
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
     * Sets the settings
     */
    public set settings(value: ILineUpSettings) {
        var newSettings : ILineUpSettings = $.extend(true, {}, LineUp.DEFAULT_SETTINGS, value);

        var singleSelect = newSettings.selection.singleSelect;
        var multiSelect = newSettings.selection.multiSelect;
        this.selectionEnabled = singleSelect || multiSelect;
        this.isMultiSelect = multiSelect;

        var loadData = newSettings.data.inferColumnTypes !== this.settings.data.inferColumnTypes;
        this._settings = newSettings;
        if (loadData && this.rows && this.rows.length) {
            this.loadData(this.columns, this.rows, true);
        }
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
        this.attachEvents();
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
        this.attachEvents();
    }

    /**
     * Loads the data into the lineup view
     */
    private loadDataImpl(name: string, desc, _data: ILineUpRow[], force: boolean = false) {

        // Update the rendering options
        if (this.lineup) {
            var presProps = this.settings.presentation;
            for (var key in presProps) {
                if (presProps.hasOwnProperty(key)) {
                    this.lineup.changeRenderingOption(key, presProps[key]);
                }
            }
        }

        /* Only reload lineup if we are forced to, if we haven't loaded lineup in the first place, or if the data has changed */
        if (force || !this.lineup || Utils.hasDataChanged(this.lineup.storage.getData(), _data, (a, b) => a.equals(b))) {
            var spec: any = {};
            spec.name = name;
            spec.dataspec = desc;
            delete spec.dataspec.file;
            delete spec.dataspec.separator;
            spec.dataspec.data = _data;
            spec.storage = LineUpLib.createLocalStorage(_data, desc.columns, desc.layout, desc.primaryKey);

            if (this.lineup) {
                this.lineup.changeDataStorage(spec);
            } else {
                var finalOptions = $.extend(true, this.lineUpConfig, { renderingOptions: this.settings.presentation });
                this.lineup = LineUpLib.create(spec, d3.select(this.element.find('.grid')[0]), finalOptions);
                var scrolled = this.lineup.scrolled;
                var me = this;

                // The use of `function` is intentional here, we need to pass along the correct scope
                this.lineup.scrolled = function(...args) {
                    me.onLineUpScrolled.apply(me, args);
                    return scrolled.apply(this, args);
                };
            }
        }

        this.lineup.select(_data.filter((n) => n.selected));
    }

    /**
     * Returns true if the given object is numeric
     */
    private isNumeric = (obj) => (obj - parseFloat(obj) + 1) >= 0;

    /**
     * Derives the desciption for the given column
     */
    private deriveDesc(columns: ILineUpColumn[], data: ILineUpRow[], separator?: string) {
        var cols = columns.map((col) => {
            var r: any = {
                column: col.displayName,
                type: 'string'
            };
            if (this.settings.data.inferColumnTypes) {
                var allNumeric = true;
                var minMax = { min: Number.MAX_VALUE, max: 0 };
                for (var i = 0; i < data.length; i++) {
                    var value = data[i][r.column];
                    if (value !== 0 && !!value && !this.isNumeric(value)) {
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
            } else {
                if (col.type.numeric) {
                    r.type = 'number';
                    r.domain = d3.extent(data, (row) => row[col.displayName] && row[col.displayName].length === 0 ? undefined : +(row[col.displayName]));
                }
            }

            // If is a string, try to see if it is a category
            if (r.type === 'string') {
                var sset = d3.set(data.map((row) => row[col.displayName]));
                if (sset.size() <= Math.max(20, data.length * 0.2)) { //at most 20 percent unique values
                    r.type = 'categorical';
                    r.categories = sset.values().sort();
                }
            }
            return r;
        });
        return {
            separator: separator,
            primaryKey: columns[0].displayName,
            columns: cols
        };
    }

    /**
     * Listener for when the lineup viewer is scrolled
     */
    private onLineUpScrolled() {
        // truthy this.dataView.metadata.segment means there is more data to be loaded
        if (!this.loadingMoreData && this.raiseCanLoadMoreData()) {
            var scrollElement = $(this.lineup.$container.node()).find('div.lu-wrapper')[0];
            var scrollHeight = scrollElement.scrollHeight;
            var top = scrollElement.scrollTop;
            if (scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200) {
                this.loadingMoreData = true;
                this.raiseLoadMoreData();
                // this.host.loadMoreData();
            }
        }
    }


    /**
     * Attaches the line up events to lineup
     */
    private attachEvents() {
        if (this.lineup) {
            // Cleans up events
            this.lineup.listeners.on("multiselected.lineup", null);
            this.lineup.listeners.on("selected.lineup", null);

            if (this.isMultiSelect) {
                this.lineup.listeners.on("multiselected.lineup", (rows: ILineUpRow[]) => this.raiseSelectionChanged(rows));
            } else {
                this.lineup.listeners.on("selected.lineup", (row: ILineUpRow) => this.raiseSelectionChanged(row ? [row] : []));
            }
        }
    }

    /**
     * Raises the selection changed event
     */
    private raiseSelectionChanged(rows: ILineUpRow[]) {
        this.events.raiseEvent('selectionChanged', rows);
    }

    /**
     * Raises the load more data event
     */
    private raiseLoadMoreData() {
        this.events.raiseEvent('loadMoreData');
    }

    /**
     * Raises the can load more data event
     */
    private raiseCanLoadMoreData(): boolean {
        var result = {
            result: false
        };
        this.events.raiseEvent('canLoadMoreData', result);
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
     * The displayName for the column
     */
    displayName: string;

    /**
     * The type of column it is
     */
    type: {
        numeric: boolean;
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
    data?: {
        inferColumnTypes?: boolean;
    };
    presentation?: {
        values?: boolean;
        stacked?: boolean;
        histograms?: boolean;
        animation?: boolean;
    };
}