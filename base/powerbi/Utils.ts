import * as _ from "lodash";
import { VisualBase } from "./VisualBase";
import VisualUpdateOptions = powerbi.VisualUpdateOptions;

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

function Mixin(ctor: any) {
    return function(me: Function) {
        applyMixins(me, ctor);
    };
}

export function pre(...conds:Function[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        const params = getParamNames(method);
        descriptor.value = function(...args: any[]) {
            const me = this;
            let failed = false;
            conds.forEach(n => {
                const condParams = getParamNames(n).map((m: any) => args[params.indexOf(m)]);
                const result = n.apply(me, condParams);
                if (!result) {
                    failed = true;
                    console.error("Failed precondition: " + n);
                }
            });

            if (!failed) {
                return method.apply(this, args);
            }
        };
    };
}

/**
 * Registers a visual in the power bi system
 */
export function Visual(config: { visualName: string; projectId: string }) {
    return function(ctor: any) {
        (function (powerbi: any) {
            let visuals: any;
            (function (visuals: any) {
                let plugins: any;
                (function (plugins: any) {
                    let name = config.visualName + config.projectId;
                    plugins[name] = {
                        name: name,
                        class: name,
                        capabilities: ctor.capabilities,
                        custom: true,
                        create: function () { return new ctor(); }
                    };
                })(plugins = visuals.plugins || (visuals.plugins = {}));
            })(visuals = powerbi.visuals || (powerbi.visuals = {}));
        })(window["powerbi"] || (window["powerbi"] = {}));
    };
}

let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
let ARGUMENT_NAMES = /([^\s,]+)/g;
const getParamNames = (func: Function) => {
  let fnStr = func.toString().replace(STRIP_COMMENTS, "");
  let result: any = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
  return result || [];
};

/**
 * A collection of utils
 */
export default class Utils {

    /**
     * Returns if there is any more or less data in the new data
     * @param idEquality Returns true if a and b are referring to the same object, not necessarily if it has changed
     */
    public static hasDataChanged<T>(newData: T[], oldData: T[], equality: (a : T, b : T) => boolean) {
        // If the are identical, either same array or undefined, nothing has changed
        if (oldData === newData) {
            return false;
        }

        // If only one of them is undefined or if they differ in length, then its changed
        if (!oldData || !newData || oldData.length !== newData.length) {
            return true;
        }

        // If there are any elements in newdata that arent in the old data
        return _.some(newData, n => !_.some(oldData, m => equality(m, n)));
    }


    /**
     * Diffs the two given lists
     * @param existingItems The current list of items
     * @param newItems The new set of items
     * @param differ The interface for comparing items and add/remove events
     * @param <M>
     */
    // TODO: Think about a param that indicates if should be merged into existingItems should be modified,
    // or if only the differ should be called
    public static listDiff<M>(existingItems: M[], newItems: M[], differ: IDiffProcessor<M>) {
        existingItems = existingItems || [];
        newItems = newItems || [];

        // Go backwards so we can remove without screwing up the index
        for (let i = existingItems.length - 1; i >= 0; i--) {
            const existing: M = existingItems[i];
            let found = false;
            for (let j = 0; j < newItems.length; j++) {
                let curr: M = newItems[j];
                if (differ.equals(curr, existing)) {
                    found = true;
                }
            }
            if (!found) {
                existingItems.splice(i, 1);

                if (differ.onRemove) {
                    differ.onRemove(existing);
                }
            }
        }

        // Go through the existing ones and add the missing ones
        for (let i = 0; i < newItems.length; i++) {
            const curr = newItems[i];
            let foundItem: M = undefined;

            for (let j = 0; j < existingItems.length; j++) {
                const existing = existingItems[j];
                if (differ.equals(curr, existing)) {
                    foundItem = existing;
                }
            }
            if (!foundItem) {
                existingItems.push(curr);
                if (differ.onAdd) {
                    differ.onAdd(curr);
                }
            } else if (differ.onUpdate) {
                differ.onUpdate(foundItem, curr);
            }
        }
    }

    /**
     * Creates an update watcher for a visual
     */
    // TODO: This would be SOOO much better as a mixin, just don't want all that extra code that it requires right now.
    public static updateTypeGetter(obj: VisualBase) {
        let currUpdateType = UpdateType.Unknown;
        if (obj && obj.update) {
            const oldUpdate = obj.update;
            let prevOptions: VisualUpdateOptions;
            obj.update = function(options: VisualUpdateOptions) {
                let updateType = UpdateType.Unknown;

                if (hasResized(prevOptions, options)) {
                    updateType ^= UpdateType.Resize;
                }

                if (hasDataChanged(prevOptions, options)) {
                    updateType ^= UpdateType.Data;
                }

                if (hasSettingsChanged(prevOptions, options)) {
                    updateType ^= UpdateType.Settings;
                }

                currUpdateType = updateType;
                prevOptions = options;
                return oldUpdate.call(this, options);
            };
        }
        return function() {
            return currUpdateType;
        };
    }
}

function hasArrayChanged<T>(a1: T[], a2: T[], isEqual: (a: T, b: T) => boolean) {
    if (a1.length !== a2.length) {
        return true;
    }

    if (a1.length > 0) {
        const last = a1.length - 1;
        const mid = Math.floor(last / 2);

        // Cheat, check first, last, and middle
        return (!isEqual(a1[0], a2[0])) ||
            (!isEqual(a1[last], a2[last])) ||
            (!isEqual(a1[mid], a2[mid]));
    }
}

function hasCategoryChanged(dc1: powerbi.DataViewCategoryColumn, dc2: powerbi.DataViewCategoryColumn) {
    return hasArrayChanged<powerbi.DataViewScopeIdentity>(dc1.identity, dc2.identity, (a, b) => a.key === b.key);
}

function hasDataViewChanged(dv1: powerbi.DataView, dv2: powerbi.DataView) {
    let cats1 = (dv1.categorical && dv1.categorical.categories) || [];
    let cats2 = (dv2.categorical && dv2.categorical.categories) || [];
    let cols1 = (dv1.metadata && dv1.metadata.columns) || [];
    let cols2 = (dv2.metadata && dv2.metadata.columns) || [];
    if (cats1.length !== cats2.length ||
        cols1.length !== cols2.length) {
        return true;
    }
    for (let i = 0; i < cats1.length; i++) {
        if (hasCategoryChanged(cats1[i], cats2[i])) {
            return true;
        }
    }
    return false;
}

function hasDataChanged(oldOptions: VisualUpdateOptions, newOptions: VisualUpdateOptions) {
    const oldDvs = (oldOptions && oldOptions.dataViews) || [];
    const dvs = newOptions.dataViews || [];
    if (oldDvs.length !== dvs.length) {
        return true;
    }
    for (let i = 0; i < oldDvs.length; i++) {
        if (hasDataViewChanged(oldDvs[i], dvs[i])) {
            return true;
        }
    }
    return false;
}

function hasSettingsChanged(oldOptions: VisualUpdateOptions, newOptions: VisualUpdateOptions) {
    const oldDvs = (oldOptions && oldOptions.dataViews) || [];
    const dvs = newOptions.dataViews || [];

    // Is this correct?
    if (oldDvs.length !== dvs.length) {
        return true;
    }

    for (let i = 0; i < oldDvs.length; i++) {
        const oM: any = oldDvs[i].metadata || {};
        const nM: any = dvs[i].metadata || {};
        if (!_.isEqual(oM.objects, nM.objects)) {
            return true;
        }
    }
}

function hasResized(oldOptions: VisualUpdateOptions, newOptions: VisualUpdateOptions) {
    return newOptions.resizeMode;
}

/**
 * Represents an update type for a visual
 */
export enum UpdateType {
    Unknown = 0,
    Data = 1 << 0,
    Resize = 1 << 1,
    Settings = 1 << 2,
    /* tslint:disable */
    All = UpdateType.Data | UpdateType.Resize | UpdateType.Settings
    /* tslint:enable */
}

/**
 * Processes a difference found in a list
 */
export interface IDiffProcessor<M> {

    /**
     * Returns true if item one equals item two
     */
    equals(one: M, two: M) : boolean;

    /**
     * Gets called when the given item was removed
     */
    onRemove?(item: M) : void;

    /**
     * Gets called when the given item was added
     */
    onAdd?(item: M) : void;

    /**
     * Gets called when the given item was updated
     */
    onUpdate?(oldVersion: M, newVersion : M) : void;
}
