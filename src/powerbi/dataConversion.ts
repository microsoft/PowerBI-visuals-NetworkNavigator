import { INetworkNavigatorData, INetworkNavigatorLink, INetworkNavigatorConfiguration } from "../models";
import { INetworkNavigatorSelectableNode } from "./models";
import { DATA_ROLES } from "./constants";

import DataView = powerbi.DataView;
import SelectionId = powerbi.visuals.SelectionId;

/**
 * Converts the powerbi data view into an internal data structure
 */
export function converter(
    dataView: DataView,
    settings: INetworkNavigatorConfiguration): INetworkNavigatorData<INetworkNavigatorSelectableNode> {
    "use strict";
    let nodeList: INetworkNavigatorSelectableNode[] = [];
    let nodeMap: { [name: string] : INetworkNavigatorSelectableNode } = {};
    let linkList: INetworkNavigatorLink[] = [];
    let table = dataView.table;

    // The map of dataRoles to an index
    let colMap = {};

    // Maps all of the DATA_ROLES to an index into the data
    table.columns.forEach((c, i) => {
        Object.keys(c.roles).forEach(role => {
            colMap[role] = i;
        });
    });

    // group defines the bundle basically
    // name, user friendly name,
    // num, size of circle, probably meant to be the number of matches
    // source - array index into nodes
    // target - array index into node
    // value - The number of times that the link has been made, ie, I emailed bob@gmail.com 10 times, so value would be 10

    let roles = DATA_ROLES;
    let sourceIdx = colMap[roles.source.name];
    let sourceColorIdx = colMap[roles.sourceColor.name];
    let sourceLabelColorIdx = colMap[roles.sourceLabelColor.name];
    // let sourceGroup = colMap[roles.sourceGroup.name];
    // let targetGroupIdx = colMap[roles.targetGroup.name];
    let targetColorIdx = colMap[roles.targetColor.name];
    let targetLabelColorIdx = colMap[roles.targetLabelColor.name];
    let targetIdx = colMap[roles.target.name];
    const edgeValueIdx = colMap[roles.edgeValue.name];
    const sourceNodeWeightIdx = colMap[roles.sourceNodeWeight.name];
    const targetNodeWeightIdx = colMap[roles.targetNodeWeight.name];

    let sourceField = table.identityFields[sourceIdx];
    let targetField = table.identityFields[targetIdx];

    /**
     * Creates a node with the given value if the node has not already been seen/created
     */
    function getNode(
        id: string,
        identity: powerbi.DataViewScopeIdentity,
        isSource: boolean,
        nodeWeight: number,
        color: string = "gray",
        labelColor: string,
        group: number = 0): INetworkNavigatorSelectableNode {
        const field = (isSource ? sourceField : targetField);
        let node = nodeMap[id];
        let expr = powerbi.data.SQExprBuilder.equal(field as powerbi.data.SQExpr, powerbi.data.SQExprBuilder.text(id));

        if (!nodeMap[id]) {
            node = nodeMap[id] = {
                name: id,
                color: color || "gray",
                labelColor: labelColor,
                index: nodeList.length,
                filterExpr: expr,
                value: nodeWeight,
                neighbors: 1,
                selected: false,
                identity: SelectionId.createWithId(powerbi.data.createDataViewScopeIdentity(expr)),
            };
            nodeList.push(node);
        }
        return node;
    }

    // The minimum necessary is a source node and a target node, otherwise we'll just have a bunch of disconnected nodes
    if (sourceField && targetField) {

        // Iterate through each row and create a connection between the source node and the target node
        table.rows.forEach((row, idx) => {
            let identity = table.identity[idx];
            if (row[sourceIdx] && row[targetIdx]) {
                /** These need to be strings to work properly */
                let sourceId = row[sourceIdx] + "";
                let targetId = row[targetIdx] + "";
                let edge = {
                    source:
                        getNode(sourceId,
                                identity,
                                true,
                                row[sourceNodeWeightIdx],
                                row[sourceColorIdx],
                                row[sourceLabelColorIdx]/*,
                                row[sourceGroup]*/).index,
                    target:
                        getNode(targetId,
                                identity,
                                false,
                                row[targetNodeWeightIdx],
                                row[targetColorIdx],
                                row[targetLabelColorIdx]/*, 
                                row[targetGroupIdx]*/).index,
                    value: row[edgeValueIdx],
                };
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
