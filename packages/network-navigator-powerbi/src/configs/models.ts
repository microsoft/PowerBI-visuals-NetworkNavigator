/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { INetworkNavigatorNode } from '@essex/network-navigator'
import * as models from 'powerbi-models'
import powerbi from 'powerbi-visuals-api'

/**
 * A selectable node within network navigator
 */
export interface INetworkNavigatorSelectableNode extends INetworkNavigatorNode {
	/**
	 * The nodes index into the node list
	 */
	index: number

	/**
	 * The number of neighbor nodes to this node
	 */
	neighbors: number

	/**
	 * The unique filter for this node
	 */
	filter: models.IFilter

	/**
	 * The identity of the node
	 */
	identity: powerbi.visuals.ISelectionId
}
