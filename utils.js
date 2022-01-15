export function arrify(item) {
  if (Array.isArray(item)) return item;
  if (typeof item === typeof undefined) return [];
  return [item];
}

export function getMeta({ url: href } = {}) {
  if (!href) return;
  const meta = {};
  const url = new URL(href);
  for (let key of url.searchParams.keys()) {
    let value = url.searchParams.get(key);
    if ((value === '') || ('true' === value?.toLowerCase())) value = true;
    if ('false' === value?.toLowerCase()) value = false;
    if (value?.includes?.(',')) value = value.split(',');
    if (key.startsWith('!')) {
      key = key.substring(1);
      value = false;
    }
    if (value === String(Number(value))) value = Number(value);
    if (key in meta) {
      meta[key] = arrify(meta[key]).concat(arrify(value));
    } else {
      meta[key] = value;
    }
  }
  return meta;
}
