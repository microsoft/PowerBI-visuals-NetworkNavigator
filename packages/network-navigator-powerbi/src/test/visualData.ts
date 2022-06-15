import powerbi from 'powerbi-visuals-api'
import DataView = powerbi.DataView

import { testDataViewBuilder } from 'powerbi-visuals-utils-testutils'

import * as simpleSourceTarget from './test_cases/simpleSourceTarget.json'
import * as allFields from './test_cases/allFields.json'
import * as complexDataWithLabelColor from './test_cases/complexDataWithLabelColor.json'
import * as complexDataWithLabels from './test_cases/complexDataWithLabels.json'
import * as complexDataWithSettingsChanged from './test_cases/complexDataWithSettingsChanged.json'

import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder

export class VisualData extends TestDataViewBuilder {
	public getDataView(): DataView {
		return simpleSourceTarget.dataViews as unknown as DataView
	}

	public getAllFieldsDataView(): DataView {
		return allFields.dataViews as unknown as DataView
	}
	public getComplexDataWithSettingsChangedDataView(): DataView {
		return complexDataWithSettingsChanged.dataViews as unknown as DataView
	}
	public getComplexDataWithLabelColorDataView(): DataView {
		return complexDataWithLabelColor.dataViews as unknown as DataView
	}
	public getComplexDataWithLabelsDataView(): DataView {
		return complexDataWithLabels.dataViews as unknown as DataView
	}
}
