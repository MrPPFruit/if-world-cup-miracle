export function stableHash(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createRng(seedInput = Date.now()) {
  let seed = stableHash(String(seedInput)) || 1;

  return {
    next() {
      seed += 0x6d2b79f5;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    },
    int(min, max) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
  };
}

export function pick(items, rng) {
  if (!items.length) return null;
  return items[Math.floor(rng.next() * items.length)];
}

export function weightedPick(items, rng) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  if (total <= 0) return items[0]?.value ?? null;

  let cursor = rng.next() * total;
  for (const item of items) {
    cursor -= Math.max(0, item.weight);
    if (cursor <= 0) return item.value;
  }

  return items.at(-1)?.value ?? null;
}

export function chance(probability, rng) {
  return rng.next() < probability;
}

export function poisson(lambda, rng) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  do {
    count += 1;
    product *= rng.next();
  } while (product > limit);

  return Math.max(0, count - 1);
}
