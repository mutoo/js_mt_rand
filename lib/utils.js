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
  return u & 0x80000000;
}

/**
 * Mask all but lowest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
export function loBit(u) {
  return u & 0x00000001;
}

/**
 * Mask the highest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
export function loBits(u) {
  return u & 0x7FFFFFFF;
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
  return (Math.random() * Math.pow(2, 32)) >>> 0;
}

/*
 * A bit of tricky math here.  We want to avoid using a modulus because
 * that simply tosses the high-order bits and might skew the distribution
 * of random values over the range.  Instead we map the range directly.
 *
 * We need to map the range from 0...M evenly to the range a...b
 * Let n = the random number and n' = the mapped random number
 *
 * Then we have: n' = a + n(b-a)/M
 *
 * We have a problem here in that only n==M will get mapped to b which
 # means the chances of getting b is much much less than getting any of
 # the other values in the range.  We can fix this by increasing our range
 # artificially and using:
 #
 #               n' = a + n(b-a+1)/M
 *
 # Now we only have a problem if n==M which would cause us to produce a
 # number of b+1 which would be bad.  So we bump M up by one to make sure
 # this will never happen, and the final algorithm looks like this:
 #
 #               n' = a + n(b-a+1)/(M+1)
 *
 * -RL
 */
export function randRangeBadScaling(n, min, max, tmax) {
  return min + ((max - min + 1) * (n / (tmax + 1.0))) >>> 0;
}

/**
 * Helper function to output unexpected value to console.
 *
 * @param {boolean} n
 * @param {string} reason
 * @returns {*}
 */
export function unexpected(n, reason) {
  if (n) {
    console.warn('unexpected: ' + reason);
  }

  return n;
}