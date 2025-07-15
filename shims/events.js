export * from 'unenv/node/events';
import { EventEmitter as UnenvEventEmitter } from 'unenv/node/events';

const methodSource = new UnenvEventEmitter();

function EventEmitter(opts) {
  this._events = Object.create(null);
  this._eventsCount = 0;
  this._maxListeners = undefined;

  if (opts && opts.captureRejections) {
    this[Symbol.for('nodejs.rejection')] = Boolean(opts.captureRejections);
  }
}

const isolatedMethods = {
  addListener: methodSource.addListener.bind(methodSource),
  removeListener: methodSource.removeListener.bind(methodSource),
  emit: methodSource.emit.bind(methodSource),
  once: methodSource.once.bind(methodSource),
  removeAllListeners: methodSource.removeAllListeners.bind(methodSource),
  setMaxListeners: methodSource.setMaxListeners.bind(methodSource),
  getMaxListeners: methodSource.getMaxListeners.bind(methodSource),
  listeners: methodSource.listeners.bind(methodSource),
  rawListeners: methodSource.rawListeners.bind(methodSource),
  listenerCount: methodSource.listenerCount.bind(methodSource),
  prependListener: methodSource.prependListener.bind(methodSource),
  prependOnceListener: methodSource.prependOnceListener.bind(methodSource),
  eventNames: methodSource.eventNames.bind(methodSource)
};

EventEmitter.prototype = {
  constructor: EventEmitter,

  addListener(type, listener) {
    return isolatedMethods.addListener.call(this, type, listener);
  },

  on(type, listener) {
    return isolatedMethods.addListener.call(this, type, listener);
  },

  once(type, listener) {
    return isolatedMethods.once.call(this, type, listener);
  },

  removeListener(type, listener) {
    return isolatedMethods.removeListener.call(this, type, listener);
  },

  off(type, listener) {
    return isolatedMethods.removeListener.call(this, type, listener);
  },

  removeAllListeners(type) {
    return isolatedMethods.removeAllListeners.call(this, type);
  },

  setMaxListeners(n) {
    return isolatedMethods.setMaxListeners.call(this, n);
  },

  getMaxListeners() {
    return isolatedMethods.getMaxListeners.call(this);
  },

  listeners(type) {
    return isolatedMethods.listeners.call(this, type);
  },

  rawListeners(type) {
    return isolatedMethods.rawListeners.call(this, type);
  },

  emit(type, ...args) {
    return isolatedMethods.emit.call(this, type, ...args);
  },

  listenerCount(type) {
    return isolatedMethods.listenerCount.call(this, type);
  },

  prependListener(type, listener) {
    return isolatedMethods.prependListener.call(this, type, listener);
  },

  prependOnceListener(type, listener) {
    return isolatedMethods.prependOnceListener.call(this, type, listener);
  },

  eventNames() {
    return isolatedMethods.eventNames.call(this);
  }
};

EventEmitter.captureRejectionSymbol = UnenvEventEmitter.captureRejectionSymbol;
EventEmitter.errorMonitor = UnenvEventEmitter.errorMonitor;
EventEmitter.defaultMaxListeners = UnenvEventEmitter.defaultMaxListeners;

export { EventEmitter };
export default EventEmitter;
