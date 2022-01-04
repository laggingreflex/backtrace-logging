import util from 'util';
import process from 'process';
import fs from 'fs';
import BacktraceLogging from './index.js'
import { arrify, getMeta } from './utils.js'

const meta = getMeta(import.meta);
const bl = new BacktraceLogging(meta);
export default bl;
export const { flush } = bl;
if (meta.auto !== false) register(meta);

/**
 * @param {meta} meta
 */
 export function register(meta, opts = meta.opts, b = bl) {
  for (const key of arrify(meta?.console ?? ['debug', 'warn'])) {
    b.object(console, key, opts);
  }
  if (meta?.util ?? true) {
    util.debug = (debug => section => b.fn(debug.call(util, section), opts))(util.debug);
  }
  for (const key of arrify(meta?.process ?? [])) {
    createObject(process[key], 'write', opts);
  }
  process.on('uncaughtExceptionMonitor', b.flush);
  process.on('beforeExit', code => code && b.flush());
  if (meta.file) file(meta.file, b);
}

export function file(file, b = bl, format = util.format) {
  const stream = fs.createWriteStream(file, { flags: 'a' });
  b.tee(stream, a => format(...a, '\n'));
}

/**
 * @typedef meta
 * @property {array} [console=[debug,warn]] Keys in `console` to patch
 * @property {boolean} [util=true] Patch `util.debug`
 * @property {array} [process] Patch keys (stdout|stderr) in `process`
 * @property {number} [capacity=10] How many messages to buffer
 * @property {object} [opts] Opts for fn-buffer
 */
