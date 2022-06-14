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
import {
	VisualBuilderBase,
	renderTimeout,
} from 'powerbi-visuals-utils-testutils'
import powerbi from 'powerbi-visuals-api'
import DataView = powerbi.DataView

import VisualUpdateType = powerbi.VisualUpdateType
import * as $ from 'jquery'

import { Visual as VisualClass } from '../visual'

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions

export class VisualBuilder extends VisualBuilderBase<VisualClass> {
	constructor(width: number, height: number) {
		super(width, height)
	}

	public update(
		dataView: DataView[] | DataView,
		updateType?: VisualUpdateType,
	): void {
		this.visual.update({
			dataViews: Array.isArray(dataView) ? dataView : [dataView],
			viewport: this.viewport,
			type: updateType,
		})
	}

	public get instance(): VisualClass {
		return this.visual
	}

	public updateRenderTimeout(
		dataViews: DataView[] | DataView,
		fn: Function,
		updateType?: VisualUpdateType,
		timeout?: number,
	): number {
		this.update(dataViews, updateType)
		return renderTimeout(fn, timeout)
	}

	protected build(options: VisualConstructorOptions) {
		return new VisualClass(options)
	}

	public get mainElement() {
		return $(this.element).find('.networkNavigator')
	}

	public get nodes() {
		return $(this.element).find('.node')
	}

	// public getNodes(dataView: powerbi.DataView) {
	// 	const nn = this.build({ element: this.element, host: this.visualHost })
	//     nn.networkNavigator = this.update

	// 		.networkNavigator.data.nodes
	// 	// return $($(this.element).children('svg.networkNavigator')[0]).children(
	// 	// 	'.nodes',
	// 	// )
	// }
}
