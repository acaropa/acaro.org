const DEFAULT_MAX_ENTRIES = 500;

class MemoryCache {
  constructor(maxEntries = DEFAULT_MAX_ENTRIES) {
    this.maxEntries = maxEntries;
    this.entries = new Map();
  }

  getOrSet(key, loader, ttlMs) {
    const now = Date.now();
    const cached = this.entries.get(key);

    if (cached && cached.expiresAt > now) {
      return cached.promise;
    }
    if (cached) this.entries.delete(key);

    const promise = Promise.resolve()
      .then(loader)
      .catch(err => {
        this.entries.delete(key);
        throw err;
      });

    this.entries.set(key, { promise, expiresAt: now + ttlMs });
    this.trim();
    return promise;
  }

  invalidatePrefix(prefix) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }

  trim() {
    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      this.entries.delete(oldestKey);
    }
  }
}

module.exports = new MemoryCache();
