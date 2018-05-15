/**
 * Convert a number to uint32
 *
 * @param {number} x
 * @returns {number}
 */
const toUInt32 = function(x) {
  return x >>> 0;
};

/**
 * Convert a number to int32
 *
 * @param {number} x
 * @returns {number}
 */
const toInt32 = function(x) {
  return x >> 0;
};

/**
 * Mask all but highest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
const hiBit = function(u) {
  return toUInt32(u) & 0x80000000;
};

/**
 * Mask all but lowest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
const loBit = function(u) {
  return toUInt32(u) & 0x00000001;
};

/**
 * Mask the highest bit of u
 *
 * @param {number} u
 * @returns {number}
 */
const loBits = function(u) {
  return toUInt32(u) & 0x7FFFFFFF;
};

/**
 * Move hi bit of u to hi bit of v
 *
 * @param {number} u
 * @param {number} v
 * @returns {number}
 */
const mixBits = function(u, v) {
  return hiBit(u) | loBits(v);
};

/**
 * Mersenne Twister
 *
 * @param m
 * @param u
 * @param v
 * @returns {number}
 */
const twist = function(m, u, v) {
  return toUInt32(toUInt32(m) ^ (mixBits(u, v) >>> 1) ^
      (toUInt32(-toInt32(loBit(v))) & 0x9908b0df));
};

/**
 * An incorrect version of Mersenne Twister
 * This is for backward compatibility.
 *
 * @param m
 * @param u
 * @param v
 * @returns {number}
 */
const twistPHP = function(m, u, v) {
  return toUInt32(toUInt32(m) ^ (mixBits(u, v) >>> 1) ^
      (toUInt32(-toInt32(loBit(u))) & 0x9908b0df));
};

/**
 * Generator a seed from native javascript random number generator
 *
 * @returns {number}
 */
const generateSeed = function() {
  return Math.random() * Number.MAX_VALUE;
};

module.exports.toUInt32 = toUInt32;
module.exports.toInt32 = toInt32;
module.exports.hiBit = hiBit;
module.exports.loBit = loBit;
module.exports.loBits = loBits;
module.exports.mixBits = mixBits;
module.exports.twist = twist;
module.exports.twistPHP = twistPHP;
module.exports.generateSeed = generateSeed;