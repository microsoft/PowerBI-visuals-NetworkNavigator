/**
 * A mixin that adds support for event emitting
 */
var EventEmitter = (function () {
    function EventEmitter() {
        this.listeners = {};
    }
    /**
     * Adds an event listener for the given event
     */
    EventEmitter.prototype.on = function (name, handler) {
        var _this = this;
        var listeners = this.listeners[name] = this.listeners[name] || [];
        listeners.push(handler);
        return {
            destroy: function () {
                _this.off(name, handler);
            }
        };
    };
    /**
     * Removes an event listener for the given event
     */
    EventEmitter.prototype.off = function (name, handler) {
        var listeners = this.listeners[name];
        if (listeners) {
            var idx = listeners.indexOf(handler);
            if (idx >= 0) {
                listeners.splice(idx, 1);
            }
        }
    };
    /**
     * Raises the given event
     */
    /*protected*/ EventEmitter.prototype.raiseEvent = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var listeners = this.listeners[name];
        if (listeners) {
            listeners.forEach(function (l) {
                l.apply(_this, args);
            });
        }
    };
    return EventEmitter;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EventEmitter;
