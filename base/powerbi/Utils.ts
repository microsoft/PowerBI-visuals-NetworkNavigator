import * as _ from "lodash";

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
                    var name = config.visualName + config.projectId;
                    plugins[name] = {
                        name: name,
                        class: name,
                        capabilities: ctor.capabilities,
                        custom: true,
                        create: function () { return new ctor(); }
                    };
                })(plugins = visuals.plugins || (visuals.plugins = {}));
            })(visuals = powerbi.visuals || (powerbi.visuals = {}));
        })(window['powerbi'] || (window['powerbi'] = {}));
    };
}


/**
 * A collection of utils
 */
export default class Utils {

    /**
     * Returns if there is any more or less data in the new data
     * @param idEquality Returns true if a and b are referring to the same object, not necessarily if it has changed
     */
    static hasDataChanged<T>(newData: T[], oldData: T[], equality: (a : T, b : T) => boolean) {
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
    // TODO: Think about a param that indicates if should be merged into existingItems should be modified, or if only the differ should be called
    static listDiff<M>(existingItems: M[], newItems : M[], differ: IDiffProcessor<M>) {
        existingItems = existingItems || [];
        newItems = newItems || [];

        var existing : M;
        var found : boolean;
        var curr: M;
        var foundItem: M;

        // Go backwards so we can remove without screwing up the index
        for (var i = existingItems.length - 1; i >= 0; i--) {
            var existing : M = existingItems[i];
            var found = false;
            for (var j = 0; j < newItems.length; j++) {
                var curr : M = newItems[j];
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

        existing = undefined;

        // Go through the existing ones and add the missing ones
        for (var i = 0; i < newItems.length; i++) {
            curr = newItems[i];
            foundItem = undefined;

            for (var j = 0; j < existingItems.length; j++) {
                existing = existingItems[j];
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
