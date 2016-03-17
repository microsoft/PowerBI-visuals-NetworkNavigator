"use strict";
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
function Mixin(ctor) {
    return function (me) {
        applyMixins(me, ctor);
    };
}
/**
 * Registers a visual in the power bi system
 */
function Visual(config) {
    return function (ctor) {
        (function (powerbi) {
            var visuals;
            (function (visuals) {
                var plugins;
                (function (plugins) {
                    var name = config.visualName + config.projectId;
                    plugins[name] = {
                        name: config.displayName || name,
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
exports.Visual = Visual;
/**
 * A collection of utils
 */
var Utils = (function () {
    function Utils() {
    }
    /**
     * Returns if there is any more or less data in the new data
     * @param idEquality Returns true if a and b are referring to the same object, not necessarily if it has changed
     */
    Utils.hasDataChanged = function (newData, oldData, equality) {
        // If the are identical, either same array or undefined, nothing has changed
        if (oldData === newData) {
            return false;
        }
        // If only one of them is undefined or if they differ in length, then its changed
        if (!oldData || !newData || oldData.length !== newData.length) {
            return true;
        }
        // If there are any elements in newdata that arent in the old data
        return _.any(newData, function (n) { return !_.any(oldData, function (m) { return equality(m, n); }); });
    };
    /**
     * Diffs the two given lists
     * @param existingItems The current list of items
     * @param newItems The new set of items
     * @param differ The interface for comparing items and add/remove events
     * @param <M>
     */
    // TODO: Think about a param that indicates if should be merged into existingItems should be modified, or if only the differ should be called
    Utils.listDiff = function (existingItems, newItems, differ) {
        existingItems = existingItems || [];
        newItems = newItems || [];
        var existing;
        var found;
        var curr;
        var foundItem;
        // Go backwards so we can remove without screwing up the index
        for (var i = existingItems.length - 1; i >= 0; i--) {
            var existing = existingItems[i];
            var found = false;
            for (var j = 0; j < newItems.length; j++) {
                var curr = newItems[j];
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
            }
            else if (differ.onUpdate) {
                differ.onUpdate(foundItem, curr);
            }
        }
    };
    return Utils;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Utils;
