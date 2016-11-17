/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { DATA_ROLES } from "./constants";
import VisualCapabilities = powerbi.VisualCapabilities;
import DataViewMapping = powerbi.DataViewMapping;
import NetworkNavigatorState from "./state";

/**
 * Defines the capabilities for this visual for PowerBI
 */

export const capabilities: VisualCapabilities = {
    dataRoles: Object.keys(DATA_ROLES).map(n => ({
        name: DATA_ROLES[n].name,
        displayName: DATA_ROLES[n].displayName,
        kind: powerbi.VisualDataRoleKind.GroupingOrMeasure,
    })),
    dataViewMappings: [{
        /**
         * This visual supports the table dataview
         */
        table: {
            rows: {
                select: Object.keys(DATA_ROLES).map(n => ({ bind: { to: DATA_ROLES[n].name }}))
            },
        },

        /**
         * Defines the conditions for each of the data roles
         */
        conditions: <any>[Object.keys(DATA_ROLES).reduce((a, b) => {
            a[DATA_ROLES[b].name] = { min: 0, max: 1 };
            return a;
        }, {}), ],
    }, ] as DataViewMapping[],
    /**
     * Indicates that this visual's dataViews can be sorted
     */
    sorting: {
        default: {}
    },
    objects: $.extend({}, {
        general: {
            displayName: "General",
            properties: {
                filter: {
                    type: { filter: {} },
                    rule: {
                        output: {
                            property: "selected",
                            selector: ["Values"],
                        },
                    },
                },
            },
        },
    }, NetworkNavigatorState.buildCapabilitiesObjects()),
};

export default capabilities;
