import { EventEmitter } from 'events';

import unenvStream from 'unenv/node/stream';

class Stream extends EventEmitter {
  constructor(options) {
    super();

    this.readable = false;
    this.writable = false;
    this.destroyed = false;

    if (options) {
      Object.assign(this, options);
    }
  }

  on(event, listener) {
    return this;
  }

  destroy(error) {
    if (this.destroyed) return this;
    this.destroyed = true;

    if (error) {
      this.emit('error', error);
    }

    this.emit('close');
    return this;
  }
}

Stream.Readable = unenvStream.Readable;
Stream.Writable = unenvStream.Writable;
Stream.Duplex = unenvStream.Duplex;
Stream.Transform = unenvStream.Transform;
Stream.promises = unenvStream.promises;
Stream.PassThrough = unenvStream.PassThrough;
Stream.pipeline = unenvStream.pipeline;
Stream.finished = unenvStream.finished;
Stream.addAbortSignal = unenvStream.addAbortSignal;
Stream.isDisturbed = unenvStream.isDisturbed;
Stream.isReadable = unenvStream.isReadable;
Stream.compose = unenvStream.compose;
Stream.isErrored = unenvStream.isErrored;
Stream.destroy = unenvStream.destroy;
Stream._isUint8Array = unenvStream._isUint8Array;
Stream._uint8ArrayToBuffer = unenvStream._uint8ArrayToBuffer;
Stream._isArrayBufferView = unenvStream._isArrayBufferView;
Stream.duplexPair = unenvStream.duplexPair;
Stream.getDefaultHighWaterMark = unenvStream.getDefaultHighWaterMark;
Stream.isDestroyed = unenvStream.isDestroyed;
Stream.isWritable = unenvStream.isWritable;
Stream.setDefaultHighWaterMark = unenvStream.setDefaultHighWaterMark;

Stream.Stream = Stream;
export default Stream;

export const {
  Readable,
  Writable,
  Duplex,
  Transform,
  promises,
  PassThrough,
  pipeline,
  finished,
  addAbortSignal,
  isDisturbed,
  isReadable,
  compose,
  isErrored,
  destroy,
  _isUint8Array,
  _uint8ArrayToBuffer,
  _isArrayBufferView,
  duplexPair,
  getDefaultHighWaterMark,
  isDestroyed,
  isWritable,
  setDefaultHighWaterMark
} = unenvStream;

export { Stream };
