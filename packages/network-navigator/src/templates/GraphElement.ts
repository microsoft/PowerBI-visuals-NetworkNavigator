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

/**
 * The template for the network navigator
 */
import * as $ from 'jquery'

export class GraphElement {
	private element: JQuery
	constructor() {
		this.element = $(this.template())
	}

	public get graphTemplate(): JQuery {
		return this.element
	}
	public get svgContainer(): JQuery {
		return this.element.find('.svg-container')
	}
	public get clearSelection(): JQuery {
		return this.element.find('#clear-selection')
	}

	public get filterBox() {
		return this.element.find('#search-filter-box')
	}
	public get singleValueMessage() {
		return this.element.find('#single-value-message')
	}

	public get textFilter(): string {
		return <string>this.filterBox.val()
	}
	private template(): string {
		return `
        <div class="graph-container">
            <div class="button-bar">
                <div class="input-box">
                    <input type="text" autocomplete="off" placeholder="Enter text filter" id="search-filter-box"/>
                    <a id="clear-selection">
                        <span class="clear-selection-button"></span>
                    </a>
                </div>
            </div>
            <div class="svg-container">
                <h3 id="single-value-message">Make a selection to view the graph</h3>
            </div>
        </div>
    `
			.trim()
			.replace(/[\r\n]/g, '')
	}
}
