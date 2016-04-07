var myGlobal;
if (typeof window === 'undefined' || typeof document === 'undefined') {
    var jsdom = require("jsdom").jsdom;
    var myDoc = jsdom('<html></html>', {});
    global['window'] = myDoc.defaultView;
    global['document'] = myDoc;
    myGlobal = global;
} else {
    myGlobal = window;
}

// Some typical deps
myGlobal['$'] = require("jquery");
myGlobal['d3'] = require("d3");
myGlobal['_'] = require("underscore");