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

import type { INetworkNavigatorConfiguration } from './interfaces'

/**
 * The default node size in px
 */
export const DEFAULT_NODE_SIZE = 10

/**
 * The default size of edges in px
 */
export const DEFAULT_EDGE_SIZE = 1

export const DEFAULT_ZOOM_SCALE = 1

export const DEFAULT_ZOOM_TRANSLATE: [number, number] = [0, 0]

/**
 * The default configuration used with network navigator
 */
export const DEFAULT_CONFIGURATION: INetworkNavigatorConfiguration = {
	animate: true,
	linkDistance: 10,
	linkStrength: 2,
	charge: -120,
	gravity: 0.1,
	labels: false,
	minZoom: 0.1,
	maxZoom: 100,
	caseInsensitive: true,
	maxNodeCount: 1000,
	defaultLabelColor: '#0078d4',
	fontSizePT: 8,
	maxNodeSize: 500,
	minNodeSize: 1,
	edgeStartColor: '#FDFEFE',
	edgeEndColor: '#273746',
	edgeMinWidth: 1,
	edgeMaxWidth: 5,
}

/**
 * Defines the minimum, maximum, and default values for link distance
 */
export const linkDistance = {
	min: 1,
	max: 30,
	default: DEFAULT_CONFIGURATION.linkDistance,
}
/**
 * Defines the minimum, maximum, and default values for node count
 */
export const nodeCount = {
	min: 0,
	max: 30000,
	default: DEFAULT_CONFIGURATION.maxNodeCount,
}

/**
 * Defines the minimum, maximum, and default values for link strength
 */
export const linkStrength = {
	min: 1,
	max: 20,
	default: DEFAULT_CONFIGURATION.linkStrength,
}

/**
 * Defines the minimum, maximum, and default values for gravity
 */
export const gravity = {
	min: 0.1,
	max: 10,
	default: DEFAULT_CONFIGURATION.gravity,
}

/**
 * Defines the minimum, maximum, and default values for charge
 */
export const charge = {
	min: -100000,
	max: 10,
	default: DEFAULT_CONFIGURATION.charge,
}

/**
 * Defines the minimum, maximum, and default values for the minimum zoom of the graph
 */
export const minZoom = {
	min: 0.0001,
	max: 100000,
	default: DEFAULT_CONFIGURATION.minZoom,
}

/**
 * Defines the minimum, maximum, and default values for the maximum zoom of the graph
 */
export const maxZoom = {
	min: 0.0001,
	max: 100000,
	default: DEFAULT_CONFIGURATION.maxZoom,
}

/**
 * Defines the minimum, maximum, and default values for the font size
 */
export const fontSizePT = {
	min: 6,
	max: 40,
	default: DEFAULT_CONFIGURATION.fontSizePT,
}

/**
 * The default, min, and max width for the minimum edge width
 */
export const edgeMinWidth = {
	min: 0,
	max: 15,
	default: DEFAULT_CONFIGURATION.edgeMinWidth,
}

/**
 * The default, min, and max width for the maximum edge width
 */
export const edgeMaxWidth = {
	min: 1,
	max: 15,
	default: DEFAULT_CONFIGURATION.edgeMaxWidth,
}
