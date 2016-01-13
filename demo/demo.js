$(function() {

    function loadSlicer() {
        var AdvancedSlicer = require("../dist/advancedslicer/component/advancedslicer").AdvancedSlicer;
        var slicerEle = $('#advanced-slicer');
        var slicer = new AdvancedSlicer(slicerEle);
        slicer.events.on('canLoadMoreData', function() { return false; });
        // slicer.on('loadMoreData', function() {

        // });
        slicer.dimensions = { height: slicerEle.height(), width: slicerEle.width() };
        $.getJSON('slicerdata.json', function(data) {
            slicer.data = data;
        });
    }

    function loadTimescale() {
        var timescaleEle = $('#time-scale');
        var TimeScale = require("../dist/timescale/component/timescale").TimeScale;
        var timeScale = new TimeScale(timescaleEle, { height: timescaleEle.height(), width: timescaleEle.width() });
        $.getJSON('timescaledata.json', function(data) {
            data.forEach(function (item) {
               item.date = new Date(item.date);
            });
            timeScale.data = data;
        });
        timeScale.events.on("rangeSelected", function (dates) {
            timescaleEle.find("#selected-range").text(dates[0] + " -> " + dates[1]);
        });
    }

    function loadDocumentViewer() {
        var documentViewerEle = $('#document-viewer');
        var DocumentViewer = require("../dist/documentviewer/component/documentviewer").DocumentViewer;
        var documentviewer = new DocumentViewer(documentViewerEle, { height: documentViewerEle.height(), width: documentViewerEle.width() });
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
    }

    function loadForceGraph() {
        var forceGraphEle = $('#force-graph');
        var ForceGraph = require("../dist/forcegraph/component/forcegraph").ForceGraph;
        var forcegraph = new ForceGraph(forceGraphEle, forceGraphEle.width(), forceGraphEle.height());
        $.getJSON('forcegraphdata.json', function(data) {
            forcegraph.data = data;
        });
        var selectedNodeEle = $('#selected-node');
        forcegraph.events.on("nodeClicked", function (node) {
            node.selected = !node.selected;
            var selectedNodes = forcegraph.data.nodes.filter(function (eNode) {
                 return !!eNode.selected;
            }).map(function (eNode) { return eNode.name; });
            selectedNodeEle.text(selectedNodes.join(", "));
            forcegraph.redrawSelection();
        });
    }

    function loadLineUp() {
        var lineUpEle = $('#line-up');
        var LineUp = require("../dist/lineup/component/lineup").LineUp;
        var lineup = new LineUp(lineUpEle);
        $.getJSON('lineupdata.json', function(data) {
            var columns = [];
            for (var col in data[0]) {
                columns.push({
                    displayName: col,
                    type: {
                        numeric: $.isNumeric(data[0][col]),
                        text: true
                    }
                })
            }
            lineup.loadData(columns, data);
        });
    }

    loadSlicer();
    loadTimescale();
    loadDocumentViewer();
    loadForceGraph();
    loadLineUp();
});
