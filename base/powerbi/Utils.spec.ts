import { default as Utils, UpdateType } from "./Utils";
import { VisualBase } from "./VisualBase";
import { expect } from "chai";

describe("Utils", () => {
    describe("updateTypeGetter", () => {

        /**
         * Runs a update test that validates that the given update options returns the given update type
         */
        const runUpdateTest = (options: powerbi.VisualUpdateOptions, updateType: UpdateType, directCompare = false) => {
            const fakeVisual = {
                update: () => 0
            } as any as VisualBase;
            const getter = Utils.updateTypeGetter(fakeVisual);
            fakeVisual.update(options);
            let expected = getter();
            if (!directCompare) {
                expected &= updateType;
            }
            expect(expected).to.eq(updateType);
        };
        const runMultipleUpdateTests = (
            o1: powerbi.VisualUpdateOptions,
            o2: powerbi.VisualUpdateOptions,
            updateType: UpdateType, directCompare = false) => {
            const fakeVisual = {
                update: () => 0
            } as any as VisualBase;
            const getter = Utils.updateTypeGetter(fakeVisual);
            fakeVisual.update(o1);
            fakeVisual.update(o2);
            let expected = getter();
            if (!directCompare) {
                expected &= updateType;
            }
            expect(expected).to.eq(updateType);
        };

        const resizeAndDataUpdateOptions = {
            dataViews: [{}],
            resizeMode: 1
        } as any as powerbi.VisualUpdateOptions;

        const simpleSettingsUpdateOptions = {
            dataViews: [{
                metadata: {
                    objects: {
                        whatever: "whatever"
                    }
                }
            }, ]
        } as any as powerbi.VisualUpdateOptions;

        it("should return Unknown when not doing any known update type, intially", () => runUpdateTest(<any>{}, UpdateType.Unknown));
        it("should NOT return Resize when NOT resizing", () => runUpdateTest(<any>{}, UpdateType.Unknown, true));
        it("should return Resize when resizing", () => runUpdateTest(<any>{ resizeMode: 1 }, UpdateType.Resize));
        it("should return Resize when resizing and data has changed initially",
            () => runUpdateTest(resizeAndDataUpdateOptions, UpdateType.Resize));
        it("should return Data when resizing and data has changed initially",
             () => runUpdateTest(resizeAndDataUpdateOptions, UpdateType.Data));
        it("should return Settings when settings have changed intially",
            () => runUpdateTest(simpleSettingsUpdateOptions, UpdateType.Settings));
        it("should return Settings when settings have changed and data has changed intially", () => {
            runUpdateTest(simpleSettingsUpdateOptions, UpdateType.Data);
        });
        it("should return Settings when settings have changed", () => {
            runMultipleUpdateTests({
                dataViews: [{
                    metadata: {
                        objects: {
                            whatever: "whatever"
                        }
                    }
                }, ]
            } as any, {
                dataViews: [{
                    metadata: {
                        objects: {
                            whatever: "whatever2"
                        }
                    }
                }, ]
            } as any,
            UpdateType.Settings);
        });
        it("should NOT return Settings when settings have NOT changed", () => {
            runMultipleUpdateTests(simpleSettingsUpdateOptions, simpleSettingsUpdateOptions, UpdateType.Unknown, true);
        });
        it("should return Settings when settings have changed twice and data has changed initially", () => {
            runUpdateTest(simpleSettingsUpdateOptions, UpdateType.Data);
        });
        it ("should return Data when the number of categories changed", () => {
            runMultipleUpdateTests({
                dataViews: [{}]
            } as any, {
                dataViews: [{
                    categorical: {
                        categories: [{}]
                    }
                }, ]
            } as any,
            UpdateType.Data);
        });
        it ("should NOT return Data when the number of categories has not changed", () => {
            runMultipleUpdateTests({
                dataViews: [{
                    categorical: {
                        categories: [{
                            identity: [{
                                key: "KEY1"
                            }, ]
                        }, ]
                    }
                }, ]
            } as any, {
                dataViews: [{
                    categorical: {
                        categories: [{
                            identity: [{
                                key: "KEY1"
                            }, ]
                        }, ]
                    }
                }, ]
            } as any,
            UpdateType.Unknown);
        });
        it ("should return Data when the number of categories has not changed, but the underlying data has", () => {
            runMultipleUpdateTests({
                dataViews: [{
                    categorical: {
                        categories: [{
                            identity: [{
                                key: "KEY1"
                            }, ]
                        }, ]
                    }
                }, ]
            } as any, {
                dataViews: [{
                    categorical: {
                        categories: [{
                            identity: [{
                                key: "DIFFERENT"
                            }, ]
                        }, ]
                    }
                }, ]
            } as any,
            UpdateType.Data);
        });
        it ("should return Data when the number of categories has changed, and the underlying data has changed", () => {
            runMultipleUpdateTests({
                dataViews: [{
                    categorical: {
                        categories: [{
                            identity: [{
                                key: "KEY1"
                            }, ]
                        }, ]
                    }
                }, ]
            } as any, {
                dataViews: [{
                    categorical: {
                        categories: [{
                            identity: [{
                                key: "DIFFERENT"
                            }, {
                                key: "DIFFERENT2"
                            }, ]
                        }, ]
                    }
                }, ]
            } as any,
            UpdateType.Data);
        });
    });
});
