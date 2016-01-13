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

    loadSlicer();
    loadTimescale();
});
