/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

/**
 * A mixin that adds support for event emitting
 */
export default class EventEmitter {
	private listeners: { [id: string]: ((...args: any) => any)[] } = {}

	/**
	 * Adds an event listener for the given event
	 */
	public on(name: string, handler: any) {
		const listeners = (this.listeners[name] = this.listeners[name] || [])
		listeners.push(handler)
		return {
			destroy: () => {
				this.off(name, handler)
			},
		}
	}

	/**
	 * Removes an event listener for the given event
	 */
	public off(name: string, handler: any) {
		const listeners = this.listeners[name]
		if (listeners) {
			const idx = listeners.indexOf(handler)
			if (idx >= 0) {
				listeners.splice(idx, 1)
			}
		}
	}

	/**
	 * Raises the given event
	 */
	/*protected*/ public raiseEvent(name: string, ...args: any[]) {
		const listeners = this.listeners[name]
		if (listeners) {
			listeners.forEach(l => {
				l.apply(this, args)
			})
		}
	}
}
