/**
 * Convert a number to uint32
 *
 * @param {number} x
 * @returns {number}
 */
export function toUInt32(x) {
  return x >>> 0;
}

/**
 * Convert a number to int32
 *
 * @param {number} x
 * @returns {number}
 */
export function toInt32(x) {
  return x >> 0;
}

/**
 * Mask all but highest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
export function hiBit(u) {
  return toUInt32(u) & 0x80000000;
}

/**
 * Mask all but lowest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
export function loBit(u) {
  return toUInt32(u) & 0x00000001;
}

/**
 * Mask the highest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
export function loBits(u) {
  return toUInt32(u) & 0x7FFFFFFF;
}

/**
 * Move hi bit of u to hi bit of v
 *
 * @param {number} u
 * @param {number} v
 * @returns {number}
 */
export function mixBits(u, v) {
  return hiBit(u) | loBits(v);
}

/**
 * Mersenne Twister
 *
 * @param m
 * @param u
 * @param v
 * @returns {number}
 */
export function twist(m, u, v) {
  return toUInt32(toUInt32(m) ^ (mixBits(u, v) >>> 1) ^
      (toUInt32(-toInt32(loBit(v))) & 0x9908b0df));
}

/**
 * An incorrect version of Mersenne Twister
 * This is for backward compatibility.
 *
 * @param m
 * @param u
 * @param v
 * @returns {number}
 */
export function twistPHP(m, u, v) {
  return toUInt32(toUInt32(m) ^ (mixBits(u, v) >>> 1) ^
      (toUInt32(-toInt32(loBit(u))) & 0x9908b0df));
}

/**
 * Generator a seed from native javascript random number generator
 *
 * @returns {number}
 */
export function generateSeed() {
  return Math.random() * Number.MAX_VALUE;
}
