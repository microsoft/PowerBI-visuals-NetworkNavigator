/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
'use strict'

import 'core-js/stable'
import './style/visual.less'
import powerbi from 'powerbi-visuals-api'
import * as $ from 'jquery'
import { pretty } from './pretty'
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions
import IVisual = powerbi.extensibility.visual.IVisual
import IVisualHost = powerbi.extensibility.visual.IVisualHost
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions
import VisualObjectInstance = powerbi.VisualObjectInstance
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject
import { DATA_ROLES } from './configs/DATA_ROLES'
import converter from './configs/converter'

import {
	INetworkNavigatorData,
	INetworkNavigatorNode,
	NetworkNavigator,
	VisualSettings,
} from '@essex/network-navigator'
import { INetworkNavigatorSelectableNode } from './configs/models'
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'

const EVENTS_TO_IGNORE =
	'mousedown mouseup click focus blur input pointerdown pointerup touchstart touchmove touchdown'

const target = '<div style="height: 100%;"></div>'
// 254 is a Misc type not documented and not explained by powerbi
const DATA_CHANGED_TYPES = [
	powerbi.VisualUpdateType.Data,
	powerbi.VisualUpdateType.All,
	254,
]

//enum 36 is not documented but is a combination of resize and resizeEnd: https://github.com/Microsoft/PowerBI-visuals-tools/issues/83
const DATA_RESIZE = [
	powerbi.VisualUpdateType.Resize,
	powerbi.VisualUpdateType.ResizeEnd,
	powerbi.VisualUpdateType.ViewMode,
	powerbi.VisualUpdateType.Resize + powerbi.VisualUpdateType.ResizeEnd,
]
export class Visual implements IVisual {
	/**
	 * The selection changed listener for NetworkNavigator
	 */
	private selectionChangedListener: { destroy: () => void }
	/**
	 * The selection manager, used to sync selection with PowerBI
	 */
	private selectionManager: powerbi.extensibility.ISelectionManager
	/**
	 * The visual's host
	 */
	private host: IVisualHost

	/**
	 * The currently loaded dataView
	 */
	private _dataView: powerbi.DataView

	private _dataViewTable: powerbi.DataViewTable

	/**
	 * My network navigator instance
	 */
	public networkNavigator: NetworkNavigator
	private target: JQuery
	private visualSettings: VisualSettings

	constructor(options: VisualConstructorOptions) {
		this.host = options.host

		if (document) {
			this.target = $(target)
			options.element.appendChild(this.target[0])
		}

		this.selectionManager = this.host.createSelectionManager()

		this.visualSettings = new VisualSettings()
		this.networkNavigator = new NetworkNavigator(
			this.target,
			this.target.width(),
			this.target.height(),
		)
		this.attachEvents()
	}

	public update(options: VisualUpdateOptions) {
		const dataView =
			options.dataViews &&
			options.dataViews.length &&
			options.dataViews[0]
		this._dataView = dataView
		const dataViewTable = dataView && dataView.table
		const dataChanged = this._dataViewTable !== dataViewTable
		this._dataViewTable = dataViewTable

		if (DATA_RESIZE.includes(options.type)) {
			const dimensions = {
				width: options.viewport.width,
				height: options.viewport.height,
			}
			this.networkNavigator.dimensions = dimensions
		} else if (DATA_CHANGED_TYPES.includes(options.type)) {
			this.visualSettings = VisualSettings.parse<VisualSettings>(dataView)
			this.networkNavigator.configuration = this.visualSettings
			if (dataChanged) {
				if (dataViewTable) {
					const filterColumn = dataView.metadata.columns.filter(
						n => n.roles[DATA_ROLES.filterField.name],
					)[0]

					const newData = converter(
						dataView,
						this.visualSettings,
						filterColumn,
						() => this.host.createSelectionIdBuilder(),
					)

					this.networkNavigator.data = newData
				} else {
					this.networkNavigator.data = {
						links: [],
						nodes: [],
					}
				}
			}
		}

		//reset the zoom if leaving focus mode
		if (
			options.type === powerbi.VisualUpdateType.ViewMode &&
			!options.isInFocus
		) {
			this.networkNavigator.resetZoom()
		}

		// Load the settings after we have loaded the nodes, cause otherwise
		this.loadSelectionFromPowerBI(dataChanged)
		this.networkNavigator.redrawLabels()
	}

	/**
	 * Destroys the visual
	 */
	public destroy() {
		this.target.empty()
	}

	/**
	 * Loads the selection state from powerbi
	 */
	private loadSelectionFromPowerBI(forceReload: boolean) {
		const data = this.networkNavigator.data
		const nodes = data && data.nodes

		// For each of the nodes, check to see if their ids are in the selection manager, and
		// mark them as selected
		if (nodes && nodes.length) {
			const filterValues = getFilterValues(
				this._dataView,
				'general.filter',
			)
			const valueMap = (filterValues || []).reduce((acc, cur) => {
				acc[cur] = 1
				return acc
			}, {})

			let selectedNode: INetworkNavigatorSelectableNode

			nodes.forEach((n: INetworkNavigatorSelectableNode) => {
				const isSelected = !!valueMap[pretty(n.name)]
				n.selected = isSelected

				// Just select the last one for now
				if (isSelected) {
					selectedNode = n
				}
			})

			if (!this.networkNavigator.selectedNode || forceReload) {
				this.networkNavigator.selectedNode = selectedNode
			}
		}
	}
	/**
	 * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
	 * objects and properties you want to expose to the users in the property pane.
	 *
	 */
	public enumerateObjectInstances(
		options: EnumerateVisualObjectInstancesOptions,
	): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
		return VisualSettings.enumerateObjectInstances(
			this.visualSettings || VisualSettings.getDefault(),
			options,
		)
	}

	/**
	 * Persists the given node as the seelcted node
	 */
	protected persistNodeSelection(node: INetworkNavigatorSelectableNode) {
		const filterToApply = node && node.filter
		let hasConditions = false
		if (filterToApply && filterToApply['values']) {
			hasConditions = filterToApply['values'].length > 0
		} else if (filterToApply && filterToApply['conditions']) {
			hasConditions = filterToApply['conditions'].length > 0
		}
		const action = hasConditions
			? powerbi.FilterAction.merge
			: powerbi.FilterAction.remove

		this.host.applyJsonFilter(filterToApply, 'general', 'filter', action)
	}

	/**
	 * A debounced event listener for when a node is selected through NetworkNavigator
	 */
	private onNodeSelected = debounce(
		(node: INetworkNavigatorSelectableNode) => {
			this.persistNodeSelection(node)
		},
		100,
	)

	/**
	 * Attaches the event listeners to the network navigator
	 */
	private attachEvents() {
		if (this.networkNavigator) {
			// Cleans up events
			if (this.selectionChangedListener) {
				this.selectionChangedListener.destroy()
			}
			const dispatcher = this.networkNavigator.events
			this.selectionChangedListener = dispatcher.on(
				'selectionChanged',
				(node: INetworkNavigatorSelectableNode) =>
					this.onNodeSelected(node),
			)

			dispatcher.on(
				'visualSettingsChanged',
				(settings: VisualSettings) => (this.visualSettings = settings),
			)

			// PowerBI will eat some events, so use this to prevent powerbi from eating them
			this.target
				.find('.filter-box input')
				.on(EVENTS_TO_IGNORE, e => e.stopPropagation())
		}
	}
}

function getFilterValues(dv: powerbi.DataView, filterPath: string): string[] {
	const savedFilter: any = get(dv, `metadata.objects.${filterPath}`)

	if (savedFilter) {
		return savedFilter.whereItems.map((n: any) => {
			let text = pretty(get(n, 'condition.right.value'))
			// Is an array
			if (n && n.splice) {
				text = pretty(n[0].value)
				// If we have a non empty value property
			} else if (n && n.value !== undefined && n.value !== null) {
				text = pretty(n.value)
			}

			return text
		})
	}
	return []
}
