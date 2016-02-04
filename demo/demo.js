$(function() {

    function loadSlicer() {
        try {
            var slicerEle = $('#advanced-slicer');
            var slicer = new AdvancedSlicer(slicerEle);
            slicer.serverSideSearch = false;
            slicer.events.on('canLoadMoreData', function() { return false; });
            slicer.dimensions = { height: slicerEle.height(), width: slicerEle.width() };
            $.getJSON('slicerdata.json', function(data) {
                slicer.data = data;
            });
        } catch (e) {
            console.error(e);
        }
    }

    function loadTimescale() {
        try {
            var timescaleEle = $('#time-scale');
            var timeScale = new TimeScale(timescaleEle, { height: timescaleEle.height(), width: timescaleEle.width() });
            $.getJSON('timescaledata.json', function(data) {
                data.forEach(function(item) {
                    item.date = new Date(item.date);
                });
                timeScale.data = data;
            });
            timeScale.events.on("rangeSelected", function(dates) {
                timescaleEle.find("#selected-range").text(dates[0] + " -> " + dates[1]);
            });
        } catch (e) {
            console.error(e);
        }
    }

    function loadDocumentViewer() {
        try {
            var documentViewerEle = $('#document-viewer');
            documentViewerEle.css({ width: 500, height: 200 });
            var documentviewer = new DocumentViewer(documentViewerEle);
            documentviewer.data = [{
                items: [{
                    name: "From",
                    type: { text: {} },
                    value: "bill@microsoft.com"
                }, {
                        name: "To",
                        type: { text: {} },
                        value: "steve.jobs@apple.com"
                    }, {
                        name: "Body",
                        type: { html: {} },
                        value: "I am <strong>Super</strong> excited about owning an <a target=\"_blank\" href=\"http://www.apple.com/iphone/\">Apple IPhone 5</a>"
                    }]
            }];
        } catch (e) {
            console.error(e);
        }
    }

    function loadForceGraph() {
        try {
            var forceGraphEle = $('#force-graph');
            var forcegraph = new ForceGraph(forceGraphEle, forceGraphEle.width(), forceGraphEle.height());
            $.getJSON('forcegraphdata.json', function(data) {
                forcegraph.data = data;
            });
            var selectedNodeEle = $('#selected-node');
            forcegraph.events.on("selectionChanged", function(node) {
                selectedNodeEle.text(node ? node.name : "");
            });
        } catch (e) {
            console.error(e);
        }
    }

    function loadLineUp() {
        try {
            var lineUpEle = $('#line-up');
            var lineup = new LineUp(lineUpEle);
            $.getJSON('lineupdata.json', function(data) {
                // var columns = [];
                // for (var col in data[0]) {
                //     columns.push({
                //         displayName: col,
                //         type: {
                //             numeric: $.isNumeric(data[0][col]),
                //             text: true
                //         }
                //     })
                // }
                data = data.map(function(item) {
                    item.equals = function(otherItem) {
                        return item.schoolname === otherItem.schoolname;
                    };
                    item.selected = false;
                    return item;
                });
                var cols = Object.keys(data[0]).map(function(colName) {
                    var col = {
                        label: colName,
                        column: colName,
                        type: "number"
                    };
                    if (colName === 'overall') {
                        var hist = [];
                        for (var i = 0; i <= 50; i++) {
                            hist.unshift(i / 50);
                        }
                        col.histogram = {
                            min: 0,
                            max: 1,
                            values: hist
                        };
                    } else if (colName === "international") {
                        var hist = [];
                        for (var i = 0; i <= 50; i++) {
                            hist.push(i / 50);
                        }
                        col.histogram = {
                            min: 0,
                            max: 1,
                            values: hist
                        };
                    } else if (colName === 'schoolname') {
                        col.type = "string";
                    }
                    return col;
                });
                lineup.count = 2;
                lineup.settings = {
                    sorting: {
                        external: true
                    },
                    filtering: {
                        external: true
                    }
                };
                lineup.configuration = {
                    primaryKey: "schoolname",
                    columns: cols
                };
                lineup.dataProvider = new LineUp.PROVIDERS.JSON(data);
            });
        } catch (e) {
            console.error(e);
        }
    }

    function loadFreeText() {
        function loadAzure() {
            var ProviderConst = FreeTextSearch.DEFAULT_PROVIDERS.AzureSearchProvider;
            var provider = new ProviderConst([{
                name: ProviderConst.API_KEY_PARAM,
                value: "D435209835B1F7131400F302936A4CCA"
            }, {
                name: ProviderConst.URL_PARAM,
                value: "https://essex.search.windows.net/indexes/jebsmall/docs"
            }]);
            return provider;
        }

        function loadElastic() {
            var ProviderConst = FreeTextSearch.DEFAULT_PROVIDERS.ElasticSearchSearchProvider;
            var provider = new ProviderConst([{
                name: ProviderConst.URL_PARAM,
                value: "http://localhost:32774/bank/account/_search"
            }, {
                name: ProviderConst.ID_FIELD_PARAM,
                value: "email"
            }, {
                name: ProviderConst.SEARCH_FIELDS,
                value: "email"
            }]);
            return provider;
        }

        try {
            var freeTextEle = $('#free-text');
            var provider = loadElastic();
            var fts = new FreeTextSearch(freeTextEle, provider);
            fts.dimensions = { height: freeTextEle.height(), width: freeTextEle.width() };
        } catch (e) {
            console.error(e);
        }
    }

    loadSlicer();
    loadTimescale();
    loadDocumentViewer();
    loadForceGraph();
    loadLineUp();
    loadFreeText();
});
