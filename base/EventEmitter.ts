/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * A mixin that adds support for event emitting
 */
export default class EventEmitter {
    private listeners: { [id: string]: Function[]; } = {};

    /**
     * Adds an event listener for the given event
     */
    public on(name: string, handler: Function) {
        var listeners = this.listeners[name] = this.listeners[name] || [];
        listeners.push(handler);
        return {
            destroy: () => {
                this.off(name, handler)
            }
        };
    }

    /**
     * Removes an event listener for the given event
     */
    public off(name: string, handler: Function) {
        var listeners = this.listeners[name];
        if (listeners) {
            var idx = listeners.indexOf(handler);
            if (idx >= 0) {
                listeners.splice(idx, 1);
            }
        }
    }

    /**
     * Raises the given event
     */
    /*protected*/public raiseEvent(name: string, ...args: any[]) {
        var listeners = this.listeners[name];
        if (listeners) {
            listeners.forEach((l) => {
                l.apply(this, args);
            });
        }
    }
}