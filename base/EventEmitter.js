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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRFbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRXZlbnRFbWl0dGVyLnRzIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsIkV2ZW50RW1pdHRlci5jb25zdHJ1Y3RvciIsIkV2ZW50RW1pdHRlci5vbiIsIkV2ZW50RW1pdHRlci5vZmYiLCJFdmVudEVtaXR0ZXIucmFpc2VFdmVudCJdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFDSDtJQUFBQTtRQUNZQyxjQUFTQSxHQUFrQ0EsRUFBRUEsQ0FBQ0E7SUF1QzFEQSxDQUFDQTtJQXJDR0Q7O09BRUdBO0lBQ0lBLHlCQUFFQSxHQUFUQSxVQUFVQSxJQUFZQSxFQUFFQSxPQUFpQkE7UUFBekNFLGlCQVFDQTtRQVBHQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNsRUEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLE1BQU1BLENBQUNBO1lBQ0hBLE9BQU9BLEVBQUVBO2dCQUNMQSxLQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFBQTtZQUMzQkEsQ0FBQ0E7U0FDSkEsQ0FBQ0E7SUFDTkEsQ0FBQ0E7SUFFREY7O09BRUdBO0lBQ0lBLDBCQUFHQSxHQUFWQSxVQUFXQSxJQUFZQSxFQUFFQSxPQUFpQkE7UUFDdENHLElBQUlBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3JDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNaQSxJQUFJQSxHQUFHQSxHQUFHQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ1hBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxDQUFDQTtRQUNMQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUVESDs7T0FFR0E7SUFDSEEsYUFBYUEsQ0FBT0EsaUNBQVVBLEdBQWpCQSxVQUFrQkEsSUFBWUE7UUFBOUJJLGlCQU9aQTtRQVA0Q0EsY0FBY0E7YUFBZEEsV0FBY0EsQ0FBZEEsc0JBQWNBLENBQWRBLElBQWNBO1lBQWRBLDZCQUFjQTs7UUFDdkRBLElBQUlBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3JDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNaQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxDQUFDQTtnQkFDaEJBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1lBQ3hCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNQQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNMSixtQkFBQ0E7QUFBREEsQ0FBQ0EsQUF4Q0QsSUF3Q0M7QUF4Q0Q7OEJBd0NDLENBQUEifQ==