import powerbi from 'powerbi-visuals-api'
import DataView = powerbi.DataView

import { testDataViewBuilder } from 'powerbi-visuals-utils-testutils'

import simpleSourceTarget from './test_cases/simpleSourceTarget.json'

import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder

export class SampleBarChartDataBuilder extends TestDataViewBuilder {
	public getDataView(columnNames?: string[]): DataView {
		return simpleSourceTarget.dataViews[0] as DataView
	}
}
