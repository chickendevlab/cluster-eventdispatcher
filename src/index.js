const cluster = require('cluster')

/**
 * Callback that handles events
 * @callback EventListener
 * @param {*} data Event data
 */

/**
 * Handles events in master and worker processes
 * @author Dr_Dee <chickendevlab.gmx.de>
 * @license MIT
 */
class EventDispatcher {

    /**
     * Constructor of the EventDispatcher
     */
    constructor() {
        this._listener = {}
        this._onceListener = {}
        if (!cluster.isMaster) {
            process.on('message', msg => {
                if (msg.event && msg.data) {
                    this._handle(msg.event, msg.data)
                }
            })
        }
    }

    /**
     * Adds required listeners to a given worker object.
     * @param {object} worker Worker object created with <i>cluster.fork()</i>
     */
    initWorker(worker) {
        worker.on('message', (msg) => {
            if (msg.event && msg.data) {
                this.dispatch(msg.event, msg.data)
            }
        })
    }

    _handle(event, data) {
        if (this._listener[event]) {
            this._listener[event].forEach(listener => {
                listener(data)
            })
        }
        if (this._onceListener[event]) {
            this._listener[event].forEach((listener, index) => {
                listener(data)
                delete this._listener[event][index]
            })
        }
    }

    /**
     * Dispatchs an event to all processes
     * @param {string} event Event name
     * @param {*} data Event data
     */
    dispatch(event, data) {
        if (cluster.isMaster) {
            this._handle(event, data)
            for (const wID in cluster.workers) {
                cluster.workers[wID].send({
                    event: event,
                    data: data
                })
            }
        } else {
            process.send({
                event: event,
                data: data
            })
        }
    }

    /**
     * Registers a listener which will be executed whenever the specified event occurs.
     * @param {string} event Event name
     * @param {EventListener} handler Listener, which is executed as soon as the specified event occurs.
     */
    on(event, handler) {
        if (!this._listener[event]) {
            this._listener[event] = []
        }
        this._listener[event].push(handler)
    }

    /**
     * Registers a listener which is executed only once
     * @param {*} event Event name
     * @param {EventListener} handler Listener, which is executed <b>once</b> when the specified event occurs.
     */
    once(event, handler) {
        if (!this._onceListener[event]) {
            this._onceListener[event] = []
        }
        this._onceListener[event].push(handler)
    }


}

module.exports = EventDispatcher