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
            </div>
        `;

        /**
         * The template used to render list items
         */
        private listItemTemplate = `<div style="white-space:nowrap" class="item"><label style="cursor:pointer"><input style="vertical-align:middle;cursor:pointer" type="checkbox"><span style="margin-left: 5px;vertical-align:middle" class="value"></span></label></div>`;

        /**
         * The list container
         */
        private listContainer: JQuery;

        /**
         * The actual list element
         */
        private listEle : JQuery;

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
         * A boolean indicating whether or not the list is loading more data
         */
        private loadingMoreData = false;

        /**
         * The current set of data
         */
        private _data : any[];

        /**
         * The selection manager
         */
        private selectionManager : utility.SelectionManager;

        /**
         * The set of capabilities for the visual
         */
        public static capabilities: VisualCapabilities = {
            dataRoles: [{
                name: 'Values',
                kind: VisualDataRoleKind.Grouping
            }],
            dataViewMappings: [{
                table: {
                    rows: {
                        for: { in: 'Values' },
                        dataReductionAlgorithm: { window: { count: 100 } }
                    },
                    rowCount: { preferred: { min: 1 } }
                },
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
                valueName: ['value'],
                item: this.listItemTemplate,
                page: 20000 // Hack
            });
            this.host = options.host;
            this.attachEvents();
            this.selectionManager = new visuals.utility.SelectionManager({ hostServices: this.host });
        }

        /**
         * Called when the visual is being updated
         */
        public update(options: powerbi.VisualUpdateOptions) {
            super.update(options);

            this.listEle.css({ width: options.viewport.width - 10, height: options.viewport.height - 45 });

            this.dataView = options.dataViews && options.dataViews[0];
            if (this.dataView) {
                var selectedIds = this.selectionManager.getSelectionIds() || [];
                var newData = this.dataView.table.rows.map((row, i) => {
                   var id = SelectionId.createWithId(this.dataView.table.identity[i]);
                   return {
                        value: row[0],
                        identity: id,
                        selected: !!_.find(selectedIds, (oId) => oId.equals(id))
                   };
                });

                Utils.listDiff<ListItem>(this._data, newData, {
                    // BUG: below should work, but once it passes 100, its busted
                //    equals: (one, two) => one.identity.equals(two.identity),
                   equals: (one, two) => one.value === two.value,
                   onAdd: (item) => {
                       this.myList.add(item);
                       this.element.find(".item").last().find("input").prop('checked', item.selected);
                   },
                   onRemove: (item) => this.myList.remove("value", item.value),
                   onUpdate: (existing, newItem) => {
                       $.extend(existing, newItem);
                       var item = this.myList.get("value", existing.value)[0];
                       item.values({ selected: existing.selected });
                       $(item.elm).find("input").prop('checked', existing.selected);
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
                this.myList.sort('value', { order: 'asc' });
            }

            this.loadingMoreData = false;
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
        value: any;
    }
}
