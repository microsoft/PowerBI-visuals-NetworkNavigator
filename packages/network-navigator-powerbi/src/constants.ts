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

/**
 * The data roles used by network navigator
 */
export const DATA_ROLES = {
    /**
     * The source node
     */
    source: {
        displayName: "Source Node",
        name: "SOURCE_NODE",
    },

    /**
     * The target node
     */
    target: {
        displayName: "Target Node",
        name: "TARGET_NODE",
    },

    /**
     * The edge weight
     */
    edgeValue: {
        displayName: "Edge Weight",
        name: "EDGE_VALUE",
    },

    /**
     * The edge weight
     */
    edgeColorValue: {
        displayName: "Edge Color Weight",
        name: "EDGE_COLOR_VALUE",
    },

    /**
     * The source node weight
     */
    sourceNodeWeight: {
        displayName: "Source Node Weight",
        name: "SOURCE_NODE_WEIGHT",
    }/*,
    sourceGroup: {
        displayName: "Source Node Group",
        name: "SOURCE_GROUP"
    }*/,

    /**
     * The source node color
     */
    sourceColor: {
        displayName: "Source Node Color",
        name: "SOURCE_NODE_COLOR",
    },

    /**
     * The source label color
     */
    sourceLabelColor: {
        displayName: "Source Node Label Color",
        name: "SOURCE_LABEL_COLOR",
    }/*,
    targetGroup: {
        displayName: "Target Node Group",
        name: "TARGET_GROUP"
    }*/,

    /**
     * The target node weight
     */
    targetNodeWeight: {
        displayName: "Target Node Weight",
        name: "TARGET_NODE_WEIGHT",
    },

    /**
     * The target node color
     */
    targetColor: {
        displayName: "Target Node Color",
        name: "TARGET_NODE_COLOR",
    },

    /**
     * The target label color
     */
    targetLabelColor: {
        displayName: "Target Node Label Color",
        name: "TARGET_LABEL_COLOR",
    },
};
