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

import "powerbi-visuals-tools/templates/visuals/.api/v1.7.0/PowerBI-visuals";
import { INetworkNavigatorData, INetworkNavigatorLink, INetworkNavigatorConfiguration } from "@essex/network-navigator";
import { INetworkNavigatorSelectableNode } from "./models";
import { DATA_ROLES } from "./constants";
import * as models from "powerbi-models";


import DataView = powerbi.DataView;
import SelectionId = powerbi.visuals.ISelectionId;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;

/**
 * Converts the powerbi data view into an internal data structure
 */
export function converter(
    dataView: DataView,
    settings: INetworkNavigatorConfiguration,
    columnToFilter?: powerbi.DataViewMetadataColumn,
    createIdBuilder?: () => ISelectionIdBuilder): INetworkNavigatorData<INetworkNavigatorSelectableNode> {
    "use strict";
    let nodeList: INetworkNavigatorSelectableNode[] = [];
    const nodeMap: { [name: string]: INetworkNavigatorSelectableNode } = {};
    let linkList: INetworkNavigatorLink[] = [];
    const table = dataView.table;

    // The map of dataRoles to an index
    const colMap = {};
    const metadataColMap = {};

    // Maps all of the DATA_ROLES to an index into the data
    table.columns.forEach((c, i) => {
        Object.keys(c.roles).forEach(role => {
            colMap[role] = i;
            metadataColMap[role] = c;
        });
    });

    // group defines the bundle basically
    // name, user friendly name,
    // num, size of circle, probably meant to be the number of matches
    // source - array index into nodes
    // target - array index into node
    // value - The number of times that the link has been made, ie, I emailed bob@gmail.com 10 times, so value would be 10

    const roles = DATA_ROLES;
    const sourceIdx = colMap[roles.source.name];
    const sourceColorIdx = colMap[roles.sourceColor.name];
    const sourceLabelColorIdx = colMap[roles.sourceLabelColor.name];
    // let sourceGroup = colMap[roles.sourceGroup.name];
    // let targetGroupIdx = colMap[roles.targetGroup.name];
    const targetColorIdx = colMap[roles.targetColor.name];
    const targetLabelColorIdx = colMap[roles.targetLabelColor.name];
    const targetIdx = colMap[roles.target.name];
    const edgeValueIdx = colMap[roles.edgeValue.name];
    const edgeColorValueIdx = colMap[roles.edgeColorValue.name];
    const sourceNodeWeightIdx = colMap[roles.sourceNodeWeight.name];
    const targetNodeWeightIdx = colMap[roles.targetNodeWeight.name];

    /**
     * Creates a node with the given value if the node has not already been seen/created
     */
    function getNode(
        id: string,
        dvIdentity: powerbi.DataViewScopeIdentity,
        isSource: boolean,
        nodeWeight: number,
        color: string = "gray",
        labelColor: string,
        group: number = 0): INetworkNavigatorSelectableNode {
        const column = table.columns[isSource ? sourceIdx : targetIdx];
        let node = nodeMap[id];
        if (!nodeMap[id]) {
            const builder = createIdBuilder();
            const identityColumn = dataView.metadata.columns.filter(n => n.queryName === column.queryName)[0];
            const filterTargetColumn = columnToFilter || identityColumn;
            const target: models.IFilterColumnTarget = {
                table: filterTargetColumn.queryName.substr(0, filterTargetColumn.queryName.indexOf(".")),
                column: filterTargetColumn.displayName,
            };
            const filter = <models.IAdvancedFilter><any>new models.AdvancedFilter(target, "And", {
                operator: "Is",
                value: id,
            });
            node = nodeMap[id] = {
                name: id,
                color: color || "gray",
                labelColor,
                index: nodeList.length,
                filter,
                value: nodeWeight,
                neighbors: 1,
                selected: false,
                identity: builder ? builder
                    .withCategory({
                        // https://community.powerbi.com/t5/Developer/Creating-Selection-manager-for-Custom-Table-visuals/m-p/218391/highlight/true#M6869
                        source: identityColumn,
                        values: <any>null,
                        identity: [dvIdentity],
                    }, 0)
                    .createSelectionId() : <any>-1,
            };
            nodeList.push(node);
        }
        return node;
    }

    // The minimum necessary is a source node and a target node, otherwise we'll just have a bunch of disconnected nodes
    if (sourceIdx !== undefined && targetIdx !== undefined) {

        // Iterate through each row and create a connection between the source node and the target node
        table.rows.forEach((row, idx) => {
            const identity = table.identity[idx];
            if (row[sourceIdx] && row[targetIdx]) {
                /** These need to be strings to work properly */
                const sourceId = row[sourceIdx] + "";
                const targetId = row[targetIdx] + "";
                const edge = {
                    source:
                        getNode(sourceId,
                                identity,
                                true,
                                row[sourceNodeWeightIdx] as number,
                                row[sourceColorIdx] as string,
                                row[sourceLabelColorIdx] as string).index,
                    target:
                        getNode(targetId,
                                identity,
                                false,
                                row[targetNodeWeightIdx] as number,
                                row[targetColorIdx] as string,
                                row[targetLabelColorIdx] as string).index,
                    value: row[edgeValueIdx],
                    colorValue: row[edgeColorValueIdx],
                } as INetworkNavigatorLink;
                nodeList[edge.source].neighbors += 1;
                nodeList[edge.target].neighbors += 1;
                linkList.push(edge);
            }
        });

        // If we are limiting the number of nodes, then trim the final list
        const maxNodes = settings.maxNodeCount;
        if (typeof maxNodes === "number" && maxNodes > 0) {
            nodeList = nodeList.slice(0, maxNodes);
            linkList = linkList.filter(n => n.source < maxNodes && n.target < maxNodes);
        }
    }

    return {
        nodes: nodeList,
        links: linkList,
    };
}

export default converter;
