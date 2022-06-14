/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
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

	public get textFilter(): string {
		return this.filterBox.val().toString()
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
            </div>
        </div>
    `
			.trim()
			.replace(/[\r\n]/g, '')
	}
}
