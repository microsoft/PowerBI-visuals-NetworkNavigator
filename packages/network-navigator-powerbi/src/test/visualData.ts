import powerbi from 'powerbi-visuals-api'
import DataView = powerbi.DataView

import { testDataViewBuilder } from 'powerbi-visuals-utils-testutils'

import * as simpleSourceTarget from './test_cases/simpleSourceTarget.json'
import * as allFields from './test_cases/allFields.json'
import * as complexData from './test_cases/complexData.json'
import * as complexDataWithLabelColor from './test_cases/complexDataWithLabelColor.json'
import * as complexDataWithLabels from './test_cases/complexDataWithLabels.json'
import * as complexDataWithSettingsChanged from './test_cases/complexDataWithSettingsChanged.json'

import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder

export class VisualData extends TestDataViewBuilder {
	// public getSimpleSourceTargetView(columnNames?: string[]): DataView {
	// 	return simpleSourceTarget.dataViews[0] as DataView
	// }

	public getDataView(): DataView {
		return simpleSourceTarget.dataViews as unknown as DataView
	}
}
