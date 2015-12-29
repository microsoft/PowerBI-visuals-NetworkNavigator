/// <reference path="../../base/references.d.ts"/>
/// <reference path="./List.ts"/>

module powerbi.visuals {
    export class AdvancedSlicerVisual extends VisualBase implements IVisual {
        /**
         * The template for this visual
         */
        private template = `
            <div id='slicer-list'>
              <input class="search" placeholder="Search" />
              <div class="list" style="margin-top:5px;overflow:hidden;overflow-y:auto"></div>
              <div class='load-spinner' style='transform:scale(0.6);'><div>
            </div>
        `.trim().replace(/\n/g, '');

        /**
         * The template used to render list items
         */
        private listItemTemplate =
        `<div style="white-space:nowrap" class="item">
                <label style="cursor:pointer">
                    <input style="vertical-align:middle;cursor:pointer" type="checkbox">
                    <span style="margin-left: 5px;vertical-align:middle" class="display-container">
                        <span style="display:inline-block;width:50%;overflow:hidden" class="category-container">
                            <span class="category"></span>
                        </span>
                        <span style="display:inline-block;width:50%" class="value-container">
                            <span style="display:inline-block;background-color:blue;width:0px" class="value-display">&nbsp;</span>
                        </span>
                    </span>
                </label>
            </div>`.trim().replace(/\n/g, '');

        /**
         * The list container
         */
        private listContainer: JQuery;

        /**
         * The actual list element
         */
        private listEle: JQuery;

        /**
         * The reference to the list.js instance
         */
        private myList: any;

        /**
         * The current dataView
         */
        private dataView: DataView;

        /**
         * The host of the visual
         */
        private host: IVisualHostServices;

        /**
         * A reference to the loading element
         */
        private loadingElement : JQuery;

        /**
         * The current set of data
         */
        private _data: any[];

        /**
         * The selection manager
         */
        private selectionManager: utility.SelectionManager;

        /**
         * The set of capabilities for the visual
         */
        public static capabilities: VisualCapabilities = {
            dataRoles: [{
                name: 'Categories',
                kind: VisualDataRoleKind.Grouping
            }, {
                    name: 'Values',
                    kind: VisualDataRoleKind.Measure
                }],
            dataViewMappings: [{
                categorical: {
                    categories: { for: { in: "Categories" } },
                    dataReductionAlgorithm: { top: {} },
                    values: {
                        select: [{ bind: { to: "Values" } }]
                    }
                }
            }],
            // Sort this crap by default
            sorting: {
                default: {}
            },
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        filter: {
                            type: { filter: {} },
                            rule: {
                                output: {
                                    property: 'selected',
                                    selector: ['Values'],
                                }
                            }
                        },
                    },
                },
            }
        };

        /**
         * Called when the visual is being initialized
         */
        public init(options: powerbi.VisualInitOptions): void {
            super.init(options);
            this.element.append($(this.template));
            this.listContainer = this.element.find("div");
            this.listEle = this.listContainer.find(".list");
            this.listEle.scroll(() => this.onListScroll());
            this.myList = new List(this.listContainer[0], {
                valueName: ['category'],
                item: this.listItemTemplate,
                page: 20000 // Hack
            });
            this.host = options.host;
            this.attachEvents();
            this.selectionManager = new visuals.utility.SelectionManager({ hostServices: this.host });

            // These two are here because the devtools call init more than once
            this.loadingMoreData = true;
            this._data = [];
        }

        /**
         * Called when the visual is being updated
         */
        public update(options: powerbi.VisualUpdateOptions) {
            super.update(options);

            this.listEle.find(".display_container").css({ width: options.viewport.width - 20 });
            this.listEle.css({ width: options.viewport.width - 10, height: options.viewport.height - 45 });

            this.dataView = options.dataViews && options.dataViews[0];
            if (this.dataView) {
                var newData = AdvancedSlicerVisual.converter(this.dataView, this.selectionManager);
                Utils.listDiff<ListItem>(this._data, newData, {
                    // BUG: below should work, but once it passes 100, its busted
                    //    equals: (one, two) => one.identity.equals(two.identity),
                    equals: (one, two) => one.category === two.category,
                    onAdd: (item) => {
                        this.myList.add(item);
                        var ele = this.element.find(".item").last();
                        var renderedValue = item.renderedValue();
                        if (renderedValue) {
                            ele.find(".value-display").css({ width: (renderedValue + "%") });
                        }
                        ele.find("input").prop('checked', item.selected);
                    },
                    onRemove: (item) => this.myList.remove("category", item.category),
                    onUpdate: (existing, newItem) => {
                        $.extend(existing, newItem);
                        var item = this.myList.get("category", existing.category)[0];
                        var ele = $(item.elm);
                        item.values({ selected: existing.selected });
                        var renderedValue = existing.renderedValue();
                        if (renderedValue) {
                            ele.find(".value-display").css({ width: (renderedValue + "%") });
                        }
                        ele.find("input").prop('checked', existing.selected);
                    }
                });

                this._data = newData;

                var searchString = this.element.find(".search").val();
                if (searchString) {
                    this.myList.search(searchString);

                    this.loadingMoreData = false;

                    // If we have a search, then load more data as necessary
                    setTimeout(() => this.loadMoreDataBasedOnSearch(), 10);
                }
                this.myList.sort('category', { order: 'asc' });
            }

            this.loadingMoreData = false;
        }

        /**
         * Converts the given dataview into a list of listitems
         */
        public static converter(dataView: DataView, selectionManager: utility.SelectionManager) : ListItem[] {
            var converted : ListItem[];
            var selectedIds = selectionManager.getSelectionIds() || [];
            var categorical = dataView && dataView.categorical;
            var values = [];
            if (categorical.values && categorical.values.length) {
                values = categorical.values[0].values;
            }
            var maxValue = 0;
            if (categorical && categorical.categories && categorical.categories.length > 0) {
                converted = categorical.categories[0].values.map((category, i) => {
                    var id = SelectionId.createWithId(categorical.categories[0].identity[i]);
                    var item = {
                        category: category,
                        identity: id,
                        selected: !!_.find(selectedIds, (oId) => oId.equals(id)),
                        value: values[i] || 0,
                        renderedValue: () => {
                            if (values[i]) {
                                return (values[i] / maxValue) * 100;
                            }
                        }
                    };
                    if (item.value > maxValue) {
                        maxValue = item.value;
                    }
                    return item;
                });
            }
            return converted;
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
                    var idx = ele.index();
                    this.selectionManager.select(this.myList.items[idx].values().identity, true);
                    this.updateSelectionFilter();
                }
                evt.stopImmediatePropagation();
                evt.stopPropagation();
            });
        }

        /**
         * Loads more data based on search
         */
        private loadMoreDataBasedOnSearch() {
            var scrollElement = this.listEle[0];
            var scrollHeight = scrollElement.scrollHeight;
            // Only need to load if:
            // 1. There is more data. 2. We are not currently loading more data. 3. There is already too much stuff on the screen (not causing a scroll)
            if (this.dataView.metadata.segment && !this.loadingMoreData && scrollHeight <= scrollElement.clientHeight) {
                this.loadingMoreData = true;
                this.host.loadMoreData();
            }
        }

        /**
         * Updates the data filter based on the selection
         */
        private updateSelectionFilter() {
            var filter;
            if (this.selectionManager.hasSelection()) {
                var selectors = this.selectionManager.getSelectionIds().map((id) => id.getSelector());
                filter = data.Selector.filterFromSelector(selectors);
            }
            var objects: VisualObjectInstancesToPersist = {
                merge: [
                    <VisualObjectInstance>{
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter
                        }
                    }
                ]
            };
            this.host.persistProperties(objects);
        }

        /**
         * Listener for the list scrolling
         */
        private onListScroll() {
            if (!this.loadingMoreData && this.dataView.metadata.segment) {
                var scrollElement = this.listEle[0];
                var scrollHeight = scrollElement.scrollHeight;
                var top = scrollElement.scrollTop;
                if (scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200) {
                    this.loadingMoreData = true;
                    this.host.loadMoreData();
                }
            }
        }
    }

    /**
     * Represents a list item
     */
    interface ListItem extends SelectableDataPoint {
        category: any;
        value: any;

        /**
         * The value that should be displayed
         * TODO: Better name, basically it is the value that should be displayed in the histogram
         */
        renderedValue: () => any;
    }
}
