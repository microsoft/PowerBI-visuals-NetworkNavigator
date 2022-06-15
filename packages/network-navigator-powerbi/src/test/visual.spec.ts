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

import powerbi from 'powerbi-visuals-api'
import { expect } from 'chai'

import { VisualBuilder } from './visualBuilder'
import { VisualData } from './visualData'

const DefaultWaitForRender: number = 300
describe('NetworkNavigatorVisual', () => {
	let visualBuilder: VisualBuilder
	let dataBuilder: VisualData
	let dataView: powerbi.DataView
	beforeEach(() => {
		visualBuilder = new VisualBuilder(500, 500)
		dataBuilder = new VisualData()
	})

	it('should load the nodes for a simple source/target dataset on update', (done: DoneFn) => {
		dataView = dataBuilder.getDataView()
		const expectedNames = [
			'*Staples* Highlighting Markers',
			'Aaron Bergman',
			'Aaron Hawkins',
			'Accessory34',
			'Acme® Preferred Stainless Steel Scissors',
			'Avery 49',
			'Canon S750 Color Inkjet Printer',
			'DAX Two-Tone Rosewood/Black Document Frame, Desktop, 5 x 7',
			'SANFORD Liquid Accent™ Tank-Style Highlighters',
			'V70',
			'Xerox 194',
			'Xerox 1968',
		]

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				const resultNodeNames =
					visualBuilder.instance.networkNavigator.data.nodes
						.map(n => n.name)
						.sort()

				expect(resultNodeNames).to.be.deep.equal(expectedNames)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it('should load the links for a simple source/target dataset on update', (done: DoneFn) => {
		dataView = dataBuilder.getDataView()

		const expectedLinks = [
			'Aaron Bergman->Acme® Preferred Stainless Steel Scissors',
			'Aaron Bergman->Avery 49',
			'Aaron Bergman->Canon S750 Color Inkjet Printer',
			'Aaron Bergman->SANFORD Liquid Accent™ Tank-Style Highlighters',
			'Aaron Bergman->V70',
			'Aaron Bergman->Xerox 194',
			'Aaron Bergman->Xerox 1968',
			'Aaron Hawkins->*Staples* Highlighting Markers',
			'Aaron Hawkins->Accessory34',
			'Aaron Hawkins->DAX Two-Tone Rosewood/Black Document Frame, Desktop, 5 x 7',
		]

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				const data = visualBuilder.instance.networkNavigator.data
				const resultLinks = data.links
					.map(n => {
						return (
							data.nodes[n.source].name +
							'->' +
							data.nodes[n.target].name
						)
					})
					.sort()

				expect(data).to.be.ok
				expect(data.links).to.be.ok
				expect(resultLinks).to.be.deep.equal(expectedLinks)

				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it('should load the node colors correctly', (done: DoneFn) => {
		dataView = dataBuilder.getAllFieldsDataView()
		const expected = [
			'rgb(13,15,94)',
			'rgb(38,81,84)',
			'rgb(5,39,75)',
			'rgb(61,21,25)',
			'rgb(61,55,47)',
			'rgb(66,48,54)',
			'rgb(8,99,96)',
			'rgb(80,77,44)',
			'rgb(85,65,64)',
			'rgb(91,33,90)',
		]

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				const result =
					visualBuilder.instance.networkNavigator.data.nodes
						.map(n => n.color)
						.sort()
				expect(result).to.be.deep.equal(expected)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it('should load the node weights correctly', (done: DoneFn) => {
		dataView = dataBuilder.getAllFieldsDataView()
		const expected = [
			1.5845627058297396, 42.687111441046, 46.30725539755076,
			57.73851005360484, 64.91994569078088, 65.97267149481922,
			66.24268551822752, 68.77162831369787, 72.27307700086385,
			8.245853101834655,
		]

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				const result =
					visualBuilder.instance.networkNavigator.data.nodes
						.map(n => n.value)
						.sort()

				expect(result).to.be.deep.equal(expected)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it('should load the node label colors correctly', (done: DoneFn) => {
		dataView = dataBuilder.getAllFieldsDataView()
		const expected = [
			'rgb(11,43,50)',
			'rgb(13,23,82)',
			'rgb(15,81,13)',
			'rgb(2,66,74)',
			'rgb(36,0,49)',
			'rgb(46,28,54)',
			'rgb(51,79,8)',
			'rgb(83,16,32)',
			'rgb(83,4,36)',
			'rgb(88,31,55)',
		]
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				const result =
					visualBuilder.instance.networkNavigator.data.nodes
						.map(n => n.labelColor)
						.sort()

				expect(result).to.be.deep.equal(expected)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it('should load the edge weights correctly', (done: DoneFn) => {
		dataView = dataBuilder.getAllFieldsDataView()
		const expected = [
			18.8387431204319, 27.632435807026923, 28.00233552698046,
			32.912370190024376, 50.575088267214596, 64.60952623747289,
			68.25033030472696, 77.2871546447277, 89.9409633828327,
			90.69174295291305,
		]

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				const result =
					visualBuilder.instance.networkNavigator.data.links
						.map(n => n.value)
						.sort()

				expect(result).to.be.deep.equal(expected)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'animate' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.animate,
				).to.be.false
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'maxNodeCount' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()

		// Max node count in the settings is 1
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.data.nodes.length,
				).to.be.equal(1)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'linkDistance' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.linkDistance,
				).to.be.equal(20)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'linkStrength' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.linkStrength,
				).to.be.equal(1)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'gravity' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()

		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.gravity,
				).to.be.equal(0.5)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'charge' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.charge,
				).to.be.equal(-10)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'labels' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.labels,
				).to.be.true
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'minZoom' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.minZoom,
				).to.be.equal(0.12)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'maxZoom' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.layout
						.maxZoom,
				).to.be.equal(1000)
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	it("should update the 'caseInsensitive' property when it changes in power bi", (done: DoneFn) => {
		dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()
		visualBuilder.updateRenderTimeout(
			dataView,
			() => {
				expect(
					visualBuilder.instance.networkNavigator.configuration.search
						.caseInsensitive,
				).to.be.false
				done()
			},
			2,
			DefaultWaitForRender,
		)
	})

	describe('defaultLabelColor', () => {
		it("should update the 'defaultLabelColor' property when it changes in power bi", (done: DoneFn) => {
			dataView = dataBuilder.getComplexDataWithSettingsChangedDataView()
			const expectedColor = '#374649' // #374649 is pulled from the test case

			visualBuilder.updateRenderTimeout(
				dataView,
				() => {
					expect(
						visualBuilder.instance.networkNavigator.configuration
							.layout.defaultLabelColor,
					).to.be.equal(expectedColor)
					done()
				},
				2,
				DefaultWaitForRender,
			)
		})

		it("should rerender the graph when the 'defaultLabelColor' setting changes", (done: DoneFn) => {
			const initialDataView =
				dataBuilder.getComplexDataWithLabelsDataView()
			const updatedDataView =
				dataBuilder.getComplexDataWithLabelColorDataView()
			const defaultColor = '#0078d4'
			const expectedColor = '#374649' // #374649 is pulled from the test case

			visualBuilder.updateRenderTimeout(
				initialDataView,
				() => {
					const labels = visualBuilder.mainElement.find('.node-label')
					labels.each((_, ele) => {
						expect(ele.getAttribute('fill')).to.equal(defaultColor)
					})

					visualBuilder.updateRenderTimeout(
						updatedDataView,
						() => {
							const labels =
								visualBuilder.mainElement.find('.node-label')
							labels.each((_, ele) => {
								expect(ele.getAttribute('fill')).to.equal(
									expectedColor,
								)
							})
							done()
						},
						2,
						DefaultWaitForRender,
					)
				},
				2,
				DefaultWaitForRender,
			)
		})
	})
})
