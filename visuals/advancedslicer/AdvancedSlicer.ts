import { List } from './List';
import EventEmitter from '../../base/EventEmitter';
import Utils from '../../base/Utils';

/**
 * Represents an advanced slicer to help slice through data
 */
export default class AdvancedSlicer {

    /**
     * The template for this visual
     */
    private static template = `
        <div id='slicer-list'>
            <div class="slicer-options">
                <input class="search" placeholder="Search" />
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
                        <span class="category"></span>
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
        this.listEle.scroll(() => this.onListScroll());
        this.myList = new List(this.listContainer[0], {
            valueName: ['category'],
            item: AdvancedSlicer.listItemTemplate,
            page: 20000 // Hack
        });
        this.checkAllButton = element.find(".check-all").on("click", () => this.toggleSelectAll());
        this.attachEvents();

        // These two are here because the devtools call init more than once
        this.loadingMoreData = true;
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
        if (newData && newData.length) {
            Utils.listDiff<SlicerItem>(this._data, newData, {
                // BUG: below should work, but once it passes 100, its busted
                //    equals: (one, two) => one.identity.equals(two.identity),
                equals: (one, two) => one.category === two.category,
                onAdd: (item) => {
                    this.myList.add(item);
                    var ele = this.element.find(".item").last();
                    var renderedValue = item.renderedValue;
                    if (renderedValue) {
                        ele.find(".value-display").css({ width: (renderedValue + "%") });
                    }
                    ele.find("input").prop('checked', item.selected);
                    ele.data("item", item);
                },
                onRemove: (item) => this.myList.remove("category", item.category),
                onUpdate: (existing, newItem) => {
                    $.extend(existing, newItem);
                    var item = this.myList.get("category", existing.category)[0];
                    var ele = $(item.elm);
                    item.values({ selected: existing.selected });
                    var renderedValue = existing.renderedValue;
                    if (renderedValue) {
                        ele.find(".value-display").css({ width: (renderedValue + "%") });
                    }
                    ele.find("input").prop('checked', existing.selected);
                    ele.data("item", existing);
                }
            });

            this._data = newData;

            this.updateSelectAllButtonState();

            var searchString = this.element.find(".search").val();
            if (searchString) {
                this.myList.search(searchString);

                // If we have a search, then load more data as necessary
                setTimeout(() => this.loadMoreDataBasedOnSearch(true), 10);
            } else {
                this.loadingMoreData = false;
            }
        } else {
            this.loadingMoreData = false;
        }
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
    private get loadingMoreData() {
        return this._loadingMoreData;
    }

    /**
     * Setter for loadingMoreData
     */
    private set loadingMoreData(value: boolean) {
        this._loadingMoreData = value;
        this.element.toggleClass("loading", value);
    }

    /**
     * Listener for the list scrolling
     */
    private onListScroll() {
        if (this.raiseCanLoadMoreData() && !this.loadingMoreData) {
            var scrollElement = this.listEle[0];
            var scrollHeight = scrollElement.scrollHeight;
            var top = scrollElement.scrollTop;
            if (scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200) {
                this.raiseLoadMoreData();
            }
        }
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
        this.myList.on("searchComplete", () => {
            setTimeout(() => this.loadMoreDataBasedOnSearch(), 10);
        });
        this.listEle.on("click", (evt) => {
            var target = $(evt.target);
            var ele = $((<HTMLElement>evt.target)).parents(".item");
            if (ele.length > 0 && target.attr("type") === "checkbox") {
                let oldSelectedItems = this.selectedItems.slice(0);
                let item : any = ele.data("item");
                this.selectedItems.push(item);
                this.raiseSelectionChanged(this.selectedItems, oldSelectedItems);

                this.updateSelectAllButtonState();
            }
            evt.stopImmediatePropagation();
            evt.stopPropagation();
        });
    }

    /**
     * Loads more data based on search
     * @param force Force the loading of new data, if it can
     */
    private loadMoreDataBasedOnSearch (force: boolean = false) {
        var scrollElement = this.listEle[0];
        var scrollHeight = scrollElement.scrollHeight;
        // Only need to load if:
        // 1. There is more data. 2. There is not too much stuff on the screen (not causing a scroll)
        if (this.raiseCanLoadMoreData() && scrollHeight <= scrollElement.clientHeight) {
            // If we aren't already attempting to load more data, then do it
            if (!this.loadingMoreData || force) {
                this.raiseLoadMoreData();
            }
        } else {
            // No need to load more data
            this.loadingMoreData = false;
        }
    }

    /**
     * Raises the event to load more data
     */
    private raiseLoadMoreData() {
        var item = {
            result: false
        };
        this.events.raiseEvent("loadMoreData", item);
        this.loadingMoreData = item.result;
    }

    /**
     * Raises the event 'canLoadMoreData'
     */
    private raiseCanLoadMoreData() : boolean {
        var item = {
            result: false
        };
        this.events.raiseEvent('canLoadMoreData', item);
        return item.result;
    }

    /**
     * Raises the selectionChanged event
     */
    private raiseSelectionChanged(newItems: SlicerItem[], oldItems: SlicerItem[]) {
        this.events.raiseEvent('selectionChanged', newItems, oldItems);
    }
}

/**
 * Represents an item in the slicer
 */
export interface SlicerItem {
    category: any;
    value: any;
    selected: boolean;

    /**
     * The value that should be displayed
     * TODO: Better name, basically it is the value that should be displayed in the histogram
     */
    renderedValue: number;
}