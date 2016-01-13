var AdvancedSlicer = require("../dist/advancedslicer/component/advancedslicer").AdvancedSlicer;
$(function() {

    function loadSlicer() {
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
    loadSlicer();
});
