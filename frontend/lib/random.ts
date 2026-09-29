/** Random fraction in [0, 1), backed by the browser's cryptographic generator. */
export function randomFraction(): number {
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
}

/** A collision-resistant key, including browsers without randomUUID. */
export function createIdempotencyKey(): string {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), byte =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
