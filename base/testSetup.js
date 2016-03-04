var jsdom_1 = require("jsdom");
var document = jsdom_1.jsdom('<html></html>', {});
global['window'] = document.defaultView;
global['document'] = document;
