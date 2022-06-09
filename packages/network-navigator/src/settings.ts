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

import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils'
import { DEFAULT_CONFIGURATION } from './defaults'
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser

// Webpack defines this
// declare var BUILD_VERSION: string;
class GeneralSettings {
	public version: string = '01'
}
class SearchSettings {
	public caseInsensitive: boolean = DEFAULT_CONFIGURATION.caseInsensitive
}

class LayoutSettings {
	public animate: boolean = DEFAULT_CONFIGURATION.animate
	public maxNodeCount?: number = DEFAULT_CONFIGURATION.maxNodeCount
	public maxNodeSize?: number = DEFAULT_CONFIGURATION.maxNodeSize
	public minNodeSize: number = DEFAULT_CONFIGURATION.minNodeSize
	public linkDistance: number = DEFAULT_CONFIGURATION.linkDistance
	public linkStrength: number = DEFAULT_CONFIGURATION.linkStrength
	public gravity: number = DEFAULT_CONFIGURATION.gravity
	public charge: number = DEFAULT_CONFIGURATION.charge
	public labels: boolean = DEFAULT_CONFIGURATION.labels
	public minZoom: number = DEFAULT_CONFIGURATION.minZoom
	public maxZoom: number = DEFAULT_CONFIGURATION.maxZoom
	public defaultLabelColor: string = DEFAULT_CONFIGURATION.defaultLabelColor
	public fontSizePT: number = DEFAULT_CONFIGURATION.fontSizePT
	public minEdgeWeight?: number = null
	public maxEdgeWeight?: number = null
	public minEdgeColorWeight?: number = null
	public maxEdgeColorWeight?: number = null
	public edgeMinWidth: number = DEFAULT_CONFIGURATION.edgeMinWidth
	public edgeMaxWidth: number = DEFAULT_CONFIGURATION.edgeMaxWidth
	public edgeStartColor: string = DEFAULT_CONFIGURATION.edgeStartColor
	public edgeEndColor: string = DEFAULT_CONFIGURATION.edgeEndColor
}

export class VisualSettings extends DataViewObjectsParser {
	public general: GeneralSettings = new GeneralSettings()
	public search: SearchSettings = new SearchSettings()
	public layout: LayoutSettings = new LayoutSettings()
}
