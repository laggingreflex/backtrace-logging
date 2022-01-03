# backtrace-logging

Hide unnecessary logs¹ until an error² occurs.

Loosely based implementation of http://www.exampler.com/writing/ring-buffer.pdf

* ¹ `console.debug/warn` in Browser/Node, `util.debug` and optionally `process.stdout/err` in Node.
* ² `window.on(error)` in Browser, `process.on(uncaughtException, exit)` in Node.
* Auto-register for plug-n-play use, using [import.meta.url] query strings
* Customizable API for advanced usage

## Install

```
npm install backtrace-logging
```

## Usage

Just import this in NodeJS and all your `console.debug` and `console.warn` logs will be buffered (upto `capacity=10`) until the end (`process.on(error)`):

```js
import 'backtrace-logging/node.js'
```

Or this in the browser with some customizations:

```js
import 'backtrace-logging/browser.js?console=log,debug,warn&capacity=10'
```

## API

Replace **`…/node.js`** with **`…/browser.js`** accordingly.

### Core

```js
import BacktraceLogging from 'backtrace-logging'
const bl = new BacktraceLogging(opts)
```

* **`opts.capacity`** `[number=10]` How many messages to buffer
* **`opts.queue`** `[Queue]` Custom queue for [fn-buffer]
* **`opts.store`** `[Map]` Custom map to store `{ original => patch }` function pairs

---
Patch a function to buffer its calls
```js
bl.fn(fn, opts)
```
* **`fn`** `<function>` Function to patch
* **`opts`** `[object]` options for [fn-buffer]

Example:
```js
console.log = bl.fn(console.log)
```

---
Patch an object's key method with the patched function
```js
bl.object(object, key, opts)
```
* **`object`** `<object>` Object to patch
* **`key`** `<string>` Key to patch in the `object`
* **`opts`** `[object]` options for [fn-buffer]

Example:
```js
bl.object(console, 'log')
```

---
Get the original function of the patched function back
```js
bl.get(patch)
```
* **`patch`** `<function>` The patched function

Example:
```js
console.log = bl.get(console.log) // restored
```
---
Flush the queue
```js
bl.flush()
```

### Register Helper

**`?auto=false`** must be passed to disable [auto-registration](#auto-register)

```js
import { register } from 'backtrace-logging/node.js?auto=false'
register(meta, opts = meta.opts)
```
#### Browser/Node
* **`meta.console`** `[array=debug,warn]` Keys to patch in [console]
* **`opts`** `[object]` options for [fn-buffer]
#### Node only
* **`meta.util`** `[boolean]` Patch [util.debug]
* **`meta.process`** `[array]` Keys to patch in [process] (`stdout|stderr`)
* **`meta.file`** `[string]` File to append skipped logs to

### Auto Register

Requiring **`…/node.js`** *without* **`?auto=false`** calls the [**`register`**](#register-helper) helper function automatically with `meta` options parsed from [import.meta.url].

Pass the values of `meta` object as a URL query string.

Arrays must be passed as comma-separated values.

```js
import 'backtrace-logging/browser.js?console=log,debug,warn&capacity=10'
```

## Dependencies

* [fn-buffer]

[fn-buffer]: https://github.com/laggingreflex/fn-buffer
[console]: https://developer.mozilla.org/en-US/docs/Web/API/console
[util.debug]: https://nodejs.org/api/util.html#utildebugsection
[process]: https://nodejs.org/api/process.html
[import.meta.url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta
