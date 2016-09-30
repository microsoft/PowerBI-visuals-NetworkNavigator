import "../../base/testSetup";

/* tslint:disable */
global["powerbi"] = {
    visuals: {
        utility: {
            SelectionManager: function () { 

            }
        }
    },
    VisualDataRoleKind: {
        
    }
};
/* tslint:enable */

import NetworkNavigatorVisual from "./NetworkNavigatorVisual";
import { expect } from "chai";
import * as $ from "jquery";

describe("NetworkNavigatorVisual", () => {
    let parentEle: JQuery;
    beforeEach(() => {
        parentEle = $("<div></div>");
    });

    afterEach(() => {
        if (parentEle) {
            parentEle.remove();
        }
        parentEle = undefined;
    });

    const createInstance = () => {
        const instance = new NetworkNavigatorVisual(true);
        const element = $("<div>");
        instance.init(<any>{
            element: element,
            host: {},
            viewport: {
                width: 100,
                height: 100,
            },
        });
        return {
            instance,
            element,
        };
    };
    it("should load", () => {
        expect(createInstance().instance).to.not.be.undefined;
    });
});
