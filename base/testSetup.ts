import { jsdom } from "jsdom";
var document = jsdom('<html></html>', {});
global['window'] = document.defaultView;
global['document'] = document;