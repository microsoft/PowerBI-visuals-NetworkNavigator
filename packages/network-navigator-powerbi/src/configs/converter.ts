/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import powerbi from 'powerbi-visuals-api'

import {
	INetworkNavigatorData,
	INetworkNavigatorLink,
	VisualSettings,
} from '@essex/network-navigator'
import * as models from 'powerbi-models'
import { DATA_ROLES } from './DATA_ROLES'
import { INetworkNavigatorSelectableNode } from './models'

import DataView = powerbi.DataView
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder

/**
 * Converts the powerbi data view into an internal data structure
 */
//tslint:disable
function converter(
	dataView: DataView,
	settings: VisualSettings,
	nod: () => void,
	columnToFilter?: powerbi.DataViewMetadataColumn,
	createIdBuilder?: () => ISelectionIdBuilder,
): INetworkNavigatorData<INetworkNavigatorSelectableNode> {
	'use strict'
	let nodeList: INetworkNavigatorSelectableNode[] = []
	const nodeMap: { [name: string]: INetworkNavigatorSelectableNode } = {}
	let linkList: INetworkNavigatorLink[] = []
	const table = dataView.table

	// The map of dataRoles to an index
	const colMap = {}
	const metadataColMap = {}

	// Maps all of the DATA_ROLES to an index into the data
	table.columns.forEach((c, i) => {
		Object.keys(c.roles).forEach(role => {
			colMap[role] = i
			metadataColMap[role] = c
		})
	})

	// group defines the bundle basically
	// name, user friendly name,
	// num, size of circle, probably meant to be the number of matches
	// source - array index into nodes
	// target - array index into node
	// value - The number of times that the link has been made, ie, I emailed bob@gmail.com 10 times, so value would be 10
	const roles = DATA_ROLES
	const sourceIdx = colMap[roles.source.name]
	const sourceColorIdx = colMap[roles.sourceColor.name]
	const sourceLabelColorIdx = colMap[roles.sourceLabelColor.name]
	const targetColorIdx = colMap[roles.targetColor.name]
	const targetLabelColorIdx = colMap[roles.targetLabelColor.name]
	const targetIdx = colMap[roles.target.name]
	const edgeValueIdx = colMap[roles.edgeValue.name]
	const edgeColorValueIdx = colMap[roles.edgeColorValue.name]
	const sourceNodeWeightIdx = colMap[roles.sourceNodeWeight.name]
	const targetNodeWeightIdx = colMap[roles.targetNodeWeight.name]
	const nodeFilterIdx = colMap[roles.singleValueColumn.name]

	/**
	 * Creates a node with the given value if the node has not already been seen/created
	 */
	function getNode(
		id: string,
		dvIdentity: powerbi.visuals.CustomVisualOpaqueIdentity,
		isSource: boolean,
		nodeWeight: number,
		color: string = 'gray',
		labelColor: string,
	): INetworkNavigatorSelectableNode {
		const column = table.columns[isSource ? sourceIdx : targetIdx]
		let node = nodeMap[id]
		if (!nodeMap[id]) {
			const builder = createIdBuilder()
			const identityColumn = dataView.metadata.columns.filter(
				n => n.queryName === column.queryName,
			)[0]
			const filterTargetColumn = columnToFilter || identityColumn
			const target: models.IFilterColumnTarget = {
				table: filterTargetColumn.queryName.substring(
					0,
					filterTargetColumn.queryName.indexOf('.'),
				),
				column: filterTargetColumn.displayName,
			}
			const filter = <models.IAdvancedFilter>(
				(<any>new models.AdvancedFilter(target, 'And', {
					operator: 'Is',
					value: id,
				}))
			)

			node = nodeMap[id] = {
				name: id,
				color: color || 'gray',
				labelColor,
				index: nodeList.length,
				filter,
				value: nodeWeight,
				neighbors: 1,
				selected: false,
				identity: builder
					? builder
							.withCategory(
								{
									// https://community.powerbi.com/t5/Developer/Creating-Selection-manager-for-Custom-Table-visuals/m-p/218391/highlight/true#M6869
									source: identityColumn,
									values: <any>null,
									identity: [dvIdentity],
								},
								0,
							)
							.createSelectionId()
					: <any>-1,
			}
			nodeList.push(node)
		}
		return node
	}

	// The minimum necessary is a source node and a target node, otherwise we'll just have a bunch of disconnected nodes
	if (sourceIdx !== undefined && targetIdx !== undefined) {
		// Iterate through each row and create a connection between the source node and the target node
		table.rows.forEach((row, idx) => {
			const identity = table.identity[idx]
			if (row[sourceIdx] && row[targetIdx]) {
				//These need to be strings to work properly
				const sourceId = row[sourceIdx] + ''
				const targetId = row[targetIdx] + ''
				const edge = <INetworkNavigatorLink>{
					source: getNode(
						sourceId,
						identity,
						true,
						<number>row[sourceNodeWeightIdx],
						<string>row[sourceColorIdx],
						<string>row[sourceLabelColorIdx],
					).index,
					target: getNode(
						targetId,
						identity,
						false,
						<number>row[targetNodeWeightIdx],
						<string>row[targetColorIdx],
						<string>row[targetLabelColorIdx],
					).index,
					value: row[edgeValueIdx],
					colorValue: row[edgeColorValueIdx],
				}
				nodeList[edge.source].neighbors += 1
				nodeList[edge.target].neighbors += 1
				linkList.push(edge)
			}
		})

		// If we are limiting the number of nodes, then trim the final list
		const maxNodes = settings.layout.maxNodeCount
		if (typeof maxNodes === 'number' && maxNodes > 0) {
			nodeList = nodeList.slice(0, maxNodes)
			linkList = linkList.filter(
				n => n.source < maxNodes && n.target < maxNodes,
			)
		}
	}

	if (
		nodeFilterIdx !== undefined &&
		new Set(linkList.flatMap(x => x.source)).size > 1
	) {
		nod()
		return {
			nodes: [],
			links: [],
		}
	}

	return {
		nodes: nodeList,
		links: linkList,
	}
}
//tslint:enable
export default converter
