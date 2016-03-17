require("ts-node/register");
module.exports = {
    TimeBrush: require('./visuals/timebrush/TimeBrush').TimeBrush,
    LineUp: require('./visuals/lineup/LineUp').LineUp,
    ForceGraph: require('./visuals/forcegraph/ForceGraph').ForceGraph,
    DocumentViewer: require('./visuals/documentviewer/DocumentViewer').DocumentViewer,
    AdvancedSlicer: require('./visuals/advancedslicer/AdvancedSlicer').AdvancedSlicer
};