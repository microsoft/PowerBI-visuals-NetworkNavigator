import EventEmitter from '../../base/EventEmitter';
import Utils from '../../base/Utils';
const List = require('./List');

/**
 * Represents an advanced slicer to help slice through data
 */
export class AdvancedSlicer {

    /**
     * The number of milliseconds before running the search, after a user stops typing.
     */
    private static SEARCH_DEBOUNCE = 500;

    /**
     * The template for this visual
     */
    private static template = `
        <div id='slicer-list'>
            <div class="slicer-options">
                <input class="searchbox" placeholder="Search" />
                <div style="margin:0;padding:0;margin-top:5px;">
                <label style="vertical-align:middle"><input class="check-all" type="checkbox" style="margin-right:5px;vertical-align:middle"/>&nbsp;Select All</label>
                </div>
                <hr/>
            </div>
            <div class="list" style="overflow:hidden;overflow-y:auto"></div>
            <div class='load-spinner' style='transform:scale(0.6);'><div>
        </div>
    `.trim().replace(/\n/g, '');

    /**
     * The template used to render list items
     */
    private static listItemTemplate = `
        <div style="white-space:nowrap" class="item">
            <label style="cursor:pointer">
                <input style="vertical-align:middle;cursor:pointer" type="checkbox">
                <span style="margin-left: 5px;vertical-align:middle" class="display-container">
                    <span style="display:inline-block;overflow:hidden" class="category-container">
                        <span class="matchPrefix"></span>
                        <span class="match" style="background-color: yellow"></span>
                        <span class="matchSuffix"></span>
                    </span>
                    <span style="display:inline-block" class="value-container">
                        <span style="display:inline-block;background-color:blue;width:0px" class="value-display">&nbsp;</span>
                    </span>
                </span>
            </label>
        </div>
    `.trim().replace(/\n/g, '');

    /**
     * The reference to the list.js instance
     */
    private myList: any;

    /**
     * The list container
     */
    private listContainer: JQuery;

    /**
     * The actual list element
     */
    private listEle: JQuery;

    /**
     * The check all button
     */
    private checkAllButton: JQuery;

    /**
     * Our container element
     */
    private element: JQuery;

    /**
     * The list of selected items
     */
    private selectedItems : SlicerItem[] = [];

    /**
     * The data contained in this slicer
     */
    private _data : SlicerItem[] = [];

    /**
     * Our event emitter
     */
    private _eventEmitter : EventEmitter = new EventEmitter();

    /**
     * Constructor for the advanced slicer
     */
    constructor(element: JQuery) {
        this.element = element;
        this.listContainer = element.append($(AdvancedSlicer.template)).find("#slicer-list");
        this.listEle = this.listContainer.find(".list");
        this.listEle.scroll(() => this.checkLoadMoreData());
        this.myList = new List(this.listContainer[0], {
            valueName: ['match', 'matchPrefix', 'matchSuffix'],
            item: AdvancedSlicer.listItemTemplate,
            page: 20000 // Hack
        });
        this.checkAllButton = element.find(".check-all").on("click", () => this.toggleSelectAll());
        this.attachEvents();

        // These two are here because the devtools call init more than once
        this.loadingMoreData = true;
    }

    /**
     * Setter for server side search
     */
    private _serverSideSearch = true;
    public set serverSideSearch(value: boolean) {
        this._serverSideSearch = value;
    }

    /**
     * Getter for server side search
     */
    public get serverSideSearch() {
        return this._serverSideSearch;
    }

    /**
     * Gets our event emitter
     */
    public get events() {
        return this._eventEmitter;
    }

    /**
     * Sets the dimension of the slicer
     */
    public set dimensions(dims: { width: number; height: number }) {
        this.listEle.find(".display-container").css({ width: "100%" });
        this.listEle.css({ width: "100%", height: dims.height - this.element.find(".slicer-options").height()- 10 });
    }

    /**
     * Gets the data behind the slicer
     */
    public get data() {
        return this._data;
    }

    /**
     * Sets the slicer data
     */
    public set data(newData: SlicerItem[]) {
        this.myList.clear();

        // If some one sets the data, then clearly we are no longer loading data
        this.loadingMoreData = false;

        if (newData && newData.length) {
            newData.forEach((item) => {
                this.myList.add(item);
                var ele = this.element.find(".item").last();
                var renderedValue = item.renderedValue;
                if (renderedValue) {
                    ele.find(".value-display").css({ width: (renderedValue + "%") });
                }
                ele.find("input").prop('checked', item.selected);
                ele.data("item", item);
            })

            this._data = newData;

            this.updateSelectAllButtonState();
        }
    }

    /**
     * Gets the current serch value
     */
    public get searchString() {
        return this.element.find(".searchbox").val();
    }

    /**
     * Setter for showing the values column
     */
    public set showValues(show: boolean) {
        this.element.toggleClass("has-values", show);
    }

    /**
     * Sorts the slicer
     */
    public sort(toSort: string, desc?: boolean) {
        this.myList.sort(toSort, {
            order: desc ? "desc" : "asc"
        });
    }

    /**
     * A boolean indicating whether or not the list is loading more data
     */
    private _loadingMoreData = false; // Don't use this directly
    protected get loadingMoreData() {
        return this._loadingMoreData;
    }

    /**
     * Setter for loadingMoreData
     */
    protected set loadingMoreData(value: boolean) {
        this._loadingMoreData = value;
        this.element.toggleClass("loading", value);
    }

    /**
     * Toggle the select all state
     */
    private toggleSelectAll() {
        var checked = this.checkAllButton.prop('checked');
        var oldSelection = this.selectedItems.slice(0);
        this.selectedItems.length = 0;
        // this.selectionManager.clear();
        if (!!checked) {
            // this._data.forEach((n) => {
            //     this.selectionManager.select(n.identity, true);
            // });
            this.selectedItems = this._data.slice(0);
        }
        // this.updateSelectionFilter();
        this.events.raiseEvent("selectionChanged", this.selectedItems, oldSelection);
        this.element.find(".item input").prop('checked', checked);
        this.checkAllButton.prop('indeterminate', false);
    }

    /**
     * Updates the select all button state to match the data
     */
    private updateSelectAllButtonState() {
        this.checkAllButton.prop('indeterminate', this.selectedItems.length > 0 && this._data.length !== this.selectedItems.length);
        this.checkAllButton.prop('checked', this.selectedItems.length > 0);
    }

    /**
     * Attaches all the necessary events
     */
    private attachEvents() {
        this.element.find(".searchbox").on("input", _.debounce(() => {
            if (this.serverSideSearch) {
                setTimeout(() => this.checkLoadMoreDataBasedOnSearch(), 10);
            } else {
                this.myList.search(this.searchString);
            }
        }, AdvancedSlicer.SEARCH_DEBOUNCE));

        this.listEle.on("click", (evt) => {
            var checkbox = $(evt.target);
            var ele = $((<HTMLElement>evt.target)).parents(".item");
            if (ele.length > 0 && checkbox.attr("type") === "checkbox") {
                let oldSelectedItems = this.selectedItems.slice(0);
                let item : any = ele.data("item");
                if (checkbox.prop('checked') === true) {
                    this.selectedItems.push(item);
                } else {
                    this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
                }
                this.raiseSelectionChanged(this.selectedItems, oldSelectedItems);
                this.updateSelectAllButtonState();
            }
            evt.stopImmediatePropagation();
            evt.stopPropagation();
        });
    }

    /**
     * Listener for the list scrolling
     */
    private checkLoadMoreData() {
        var scrollElement = this.listEle[0];
        var scrollHeight = scrollElement.scrollHeight;
        var top = scrollElement.scrollTop;
        var shouldScrollLoad = scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200;
        if (shouldScrollLoad && !this.loadingMoreData && this.raiseCanLoadMoreData()) {
            this.raiseLoadMoreData(false);
        }
    }

    /**
     * Loads more data based on search
     * @param force Force the loading of new data, if it can
     */
    private checkLoadMoreDataBasedOnSearch() {
        // Only need to load if:
        // 1. There is more data. 2. There is not too much stuff on the screen (not causing a scroll)
        if (!this.loadingMoreData && this.raiseCanLoadMoreData(true)) {
            this.raiseLoadMoreData(true);
        }
    }

    /**
     * Raises the event to load more data
     */
    protected raiseLoadMoreData(isNewSearch: boolean) : PromiseLike<SlicerItem[]> {
        var item : { result?: PromiseLike<SlicerItem[]> } = { };
        this.events.raiseEvent("loadMoreData", item, isNewSearch);
        if (item.result) {
            this.loadingMoreData = true;
            return item.result.then((items) => {
                this.loadingMoreData = false;
                if (isNewSearch) {
                    this.data = items;
                } else {
                    this.data = this.data.concat(items);
                }
                // Make sure we don't need to load more after this, in case it doesn't all fit on the screen
                setTimeout(() => this.checkLoadMoreData(), 10);
                return items;
            }, () => this.loadingMoreData = false);
        }
    }

    /**
     * Raises the event 'canLoadMoreData'
     */
    protected raiseCanLoadMoreData(isSearch: boolean = false) : boolean {
        var item = {
            result: false
        };
        this.events.raiseEvent('canLoadMoreData', item, isSearch);
        return item.result;
    }

    /**
     * Raises the selectionChanged event
     */
    protected raiseSelectionChanged(newItems: SlicerItem[], oldItems: SlicerItem[]) {
        this.events.raiseEvent('selectionChanged', newItems, oldItems);
    }
}

/**
 * Represents an item in the slicer
 */
export interface SlicerItem {
    /**
     * The actual match
     */
    match: any;

    matchPrefix?: any;
    matchSuffix?: any;

    value: any;
    selected: boolean;

    /**
     * The value that should be displayed
     * TODO: Better name, basically it is the value that should be displayed in the histogram
     */
    renderedValue: number;
}