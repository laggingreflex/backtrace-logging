import BufferedFunction, { BufferQueue } from 'fn-buffer';

export default class BacktraceLogging {
  /**
   * @param {object} [opts]
   * @param {object} [opts.capacity=10] How many messages to buffer
   * @param {Queue} [opts.queue] Custom queue for 'fn-buffer'
   * @param {Map} [opts.store] Custom map to store { original => patch } function pairs
   */
  constructor(opts) {
    if (typeof opts === 'number') opts = { capacity: opts };
    this.queue = opts?.queue ?? new BufferQueue(opts?.capacity ?? 10);
    this.store = opts?.store ?? new Map();
  }

  /**
   * Patch a function to buffer its calls
   * @param {function} fn Function to patch
   * @param {object} [opts] options for fn-buffer
   * @returns {function} The patched function
   * Example:
   * ```js
   * console.log = fn(console.log)
   * ```
   */
  fn = (fn, opts) => {
    if (this.store.has(fn)) return this.store.get(fn);
    const patch = new BufferedFunction(fn, {
      flush: 0,
      queue: this.queue,
      ...opts
    });
    this.store.set(fn, patch);
    const name = ['patched(backtrace-logging)', fn.name].filter(Boolean).join(' <= ');
    Object.defineProperty(patch, 'name', { value: name });
    patch(name);
    return new Proxy(fn, {
      apply(target, thisArgument, argumentsList) {
        return Reflect.apply( /* not target */ patch, thisArgument, argumentsList)
      }
    });
  }

  /**
   * Patch an object's key method with the patched function
   * @param {object} object Object to patch
   * @param {string} key Key to patch in the {object}
   * @param {object} [opts] options for fn-buffer
   * @returns {function} The patched function
   * Example:
   * ```js
   * object(console, 'log')
   * ```
   */
  object = (object, key, opts) => {
    const fn = object[key];
    const patch = this.fn((...args) => Reflect.apply(fn, object, args), opts);
    return object[key] = patch;
  }

  /**
   * Get the original function of the patched function back
   * @param {function} patch The patched function
   * @returns {function} The original function
   * Example:
   * ```js
   * console.log = get(console.log) // restored
   * ```
   */
  get = patch => {
    for (let [original, patched] of this.store.entries())
      if (patched === patch)
        return original;
  }

  /**
   * Flush the queue
   */
  flush = () => {
    for (const patch of this.store.values()) {
      patch.flush();
    }
  }
}
