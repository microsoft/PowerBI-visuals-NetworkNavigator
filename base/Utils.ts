function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

function Mixin(ctor: any) {
    return function(me) {
        applyMixins(me, ctor);
    };
}

/**
 * A collection of utils
 */
class Utils {

    /**
     * Returns if there is any more or less data in the new data
     */
    static hasDataChanged(newData: { identity: powerbi.visuals.SelectionId }[], oldData: { identity: powerbi.visuals.SelectionId }[]) {
        // If the are identical, either same array or undefined, nothing has changed
        if (oldData === newData) {
            return false;
        }

        // If only one of them is undefined or if they differ in length, then its changed
        if (!oldData || !newData || oldData.length !== newData.length) {
            return true;
        }
        
        var oldMapped = oldData.map((n) => n.identity);

        // If there are any elements in newdata that arent in the old data
        return _.any(newData, n => !_.any(oldMapped, m => m.equals(n.identity)));
    }
}