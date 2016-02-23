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
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVdGlscy50cyJdLCJuYW1lcyI6WyJhcHBseU1peGlucyIsIk1peGluIiwiVmlzdWFsIiwiVXRpbHMiLCJVdGlscy5jb25zdHJ1Y3RvciIsIlV0aWxzLmhhc0RhdGFDaGFuZ2VkIiwiVXRpbHMubGlzdERpZmYiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUFxQixXQUFnQixFQUFFLFNBQWdCO0lBQ25EQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFBQSxRQUFRQTtRQUN0QkEsTUFBTUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFBQSxJQUFJQTtZQUN2REEsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLENBQUNBLENBQUNBLENBQUNBO0lBQ1BBLENBQUNBLENBQUNBLENBQUNBO0FBQ1BBLENBQUNBO0FBRUQsZUFBZSxJQUFTO0lBQ3BCQyxNQUFNQSxDQUFDQSxVQUFTQSxFQUFFQTtRQUNkLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQyxDQUFDQTtBQUNOQSxDQUFDQTtBQUVEOztHQUVHO0FBQ0gsZ0JBQXVCLE1BQU07SUFDekJDLE1BQU1BLENBQUNBLFVBQVNBLElBQVNBO1FBQ3JCLENBQUMsVUFBVSxPQUFPO1lBQ2QsSUFBSSxPQUFPLENBQUM7WUFDWixDQUFDLFVBQVUsT0FBTztnQkFDZCxJQUFJLE9BQU8sQ0FBQztnQkFDWixDQUFDLFVBQVUsT0FBTztvQkFDZCxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7b0JBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRzt3QkFDWixJQUFJLEVBQUUsSUFBSTt3QkFDVixL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UUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDaENBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO2dCQUNqQkEsQ0FBQ0E7WUFDTEEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ1RBLGFBQWFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUUzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2xCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtnQkFDOUJBLENBQUNBO1lBQ0xBLENBQUNBO1FBQ0xBLENBQUNBO1FBRURBLFFBQVFBLEdBQUdBLFNBQVNBLENBQUNBO1FBRXJCQSx3REFBd0RBO1FBQ3hEQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxRQUFRQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUN2Q0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBO1lBRXRCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxhQUFhQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtnQkFDNUNBLFFBQVFBLEdBQUdBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2hDQSxTQUFTQSxHQUFHQSxRQUFRQSxDQUFDQTtnQkFDekJBLENBQUNBO1lBQ0xBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNiQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDekJBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO29CQUNmQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDdkJBLENBQUNBO1lBQ0xBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO2dCQUN6QkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDckNBLENBQUNBO1FBQ0xBLENBQUNBO0lBQ0xBLENBQUNBO0lBRUxILFlBQUNBO0FBQURBLENBQUNBLEFBbEZELElBa0ZDO0FBbEZEO3VCQWtGQyxDQUFBIn0=