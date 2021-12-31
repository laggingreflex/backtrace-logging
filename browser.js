import BacktraceLogging from './index.js'
import { getMeta } from './utils.js'

const meta = getMeta(import.meta);
const bl = new BacktraceLogging(meta);
export default bl;
export const { flush } = bl;
if (meta.auto !== false) register(meta);

export function register(meta, opts = meta.opts) {
  for (const key of meta?.console ?? ['debug', 'warn']) {
    bl.object(console, key, opts);
  }
  window.addEventListener('error', bl.flush);
}
