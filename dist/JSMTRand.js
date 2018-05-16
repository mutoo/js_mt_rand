/**
 * JSMTRand version 2.0.3
 * (c) 2015-2018 Mutoo
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.JSMTRand = factory());
}(this, (function () { 'use strict';

  /* Length of state vector */
  var N = 624;

  /* A period parameter */
  var M = 397;

  /* 2^31, compatibility with the php_rand */
  var MT_RAND_MAX = 0x7FFFFFFF;

  /**
   * Convert a number to uint32
   *
   * @param {number} x
   * @returns {number}
   */
  function toUInt32(x) {
    return x >>> 0;
  }

  /**
   * Convert a number to int32
   *
   * @param {number} x
   * @returns {number}
   */
  function toInt32(x) {
    return x >> 0;
  }

  /**
   * Mask all but highest bit of u
   *
   * @param {number} u
   * @returns {number}
   */
  function hiBit(u) {
    return u & 0x80000000;
  }

  /**
   * Mask all but lowest bit of u
   *
   * @param {number} u
   * @returns {number}
   */
  function loBit(u) {
    return u & 0x00000001;
  }

  /**
   * Mask the highest bit of u
   *
   * @param {number} u
   * @returns {number}
   */
  function loBits(u) {
    return u & 0x7FFFFFFF;
  }

  /**
   * Move hi bit of u to hi bit of v
   *
   * @param {number} u
   * @param {number} v
   * @returns {number}
   */
  function mixBits(u, v) {
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
  function twist(m, u, v) {
    return toUInt32(toUInt32(m) ^ mixBits(u, v) >>> 1 ^ toUInt32(-toInt32(loBit(v))) & 0x9908b0df);
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
  function twistPHP(m, u, v) {
    return toUInt32(toUInt32(m) ^ mixBits(u, v) >>> 1 ^ toUInt32(-toInt32(loBit(u))) & 0x9908b0df);
  }

  /**
   * Generator a seed from native javascript random number generator
   *
   * @returns {number}
   */
  function generateSeed() {
    return Math.random() * Math.pow(2, 32) >>> 0;
  }

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  /**
   * The Javascript version of mt_rand();
   *
   * this pseudo-random generator can produce the same numbers as php's mt_rand do
   * with given seed.
   */

  var JSMTRand = function () {

    /**
     * @constructor JSMTRand
     */
    function JSMTRand() {
      _classCallCheck(this, JSMTRand);

      /* store the state of the generator */
      this.state_ = [];
      this.left_ = 0;
      this.next_ = 0;
      this.mt_rand_is_seeded_ = false;
    }

    /**
     * Initialize generator state with seed
     *
     * See Knuth TAOCP Vol 2, 3rd Ed, p.106 for multiplier.
     * In previous versions, most significant bits (MSBs) of the seed affect
     * only MSBs of the state array.  Modified 9 Jan 2002 by Makoto Matsumoto.
     *
     * @param seed
     * @private
     */


    _createClass(JSMTRand, [{
      key: 'mtInitialize_',
      value: function mtInitialize_(seed) {
        var s = 0;
        var r = 0;
        var i = 1;

        seed = toUInt32(seed);
        var state = this.state_;

        state[s++] = seed & 0xFFFFFFFF;

        for (; i < N; ++i) {
          var t = state[r] ^ state[r] >>> 30;

          /* to avoid the overflow by big numbers' multiplication */
          var t_low = t & 0xFFFF;
          var t_high = (t & 0xFFFF0000) >>> 16;
          state[s++] = toUInt32(0x6c078965 * t_low + toUInt32(0x6c078965 * t_high << 16) + i);

          r++;
        }
      }

      /**
       * Generate N new values in state
       * Made clearer and faster by Matthew Bellew (matthew.bellew@home.com)
       *
       * @private
       */

    }, {
      key: 'mtReload_',
      value: function mtReload_() {
        var state = this.state_;

        var p = 0;
        var i = void 0;
        var twistFunc = void 0;
        switch (this.mode_) {
          case JSMTRand.MODE_MT_RAND_PHP:
            twistFunc = twistPHP;
            break;

          default:
          case JSMTRand.MODE_MT_RAND_19937:
            twistFunc = twist;
            break;
        }

        for (i = N - M; i--; ++p) {
          state[p] = twistFunc(state[p + M], state[p], state[p + 1]);
        }

        for (i = M; --i; ++p) {
          state[p] = twistFunc(state[p + M - N], state[p], state[p + 1]);
        }

        state[p] = twistFunc(state[p + M - N], state[p], state[0]);

        this.left_ = N;
        this.next_ = 0;
      }

      /**
       * Seed the generator with a simple uint32
       * @param {number} seed
       * @param {number} mode
       * @private
       */

    }, {
      key: 'mtSRand_',
      value: function mtSRand_(seed, mode) {
        this.mode_ = mode;

        this.mtInitialize_(seed);
        this.mtReload_();

        /* Seed only once */
        this.mt_rand_is_seeded_ = true;
      }

      /**
       * Pull a 32-bit integer from the generator state
       * Every other access function simply transforms the numbers extracted here
       *
       * @private
       */

    }, {
      key: 'mtRand_',
      value: function mtRand_() {
        if (this.left_ === 0) {
          this.mtReload_();
        }
        --this.left_;

        var rand = this.state_[this.next_++];
        rand ^= rand >>> 11;
        rand ^= rand << 7 & 0x9d2c5680;
        rand ^= rand << 15 & 0xefc60000;
        return rand ^ rand >>> 18;
      }

      /**
       * Seed the generator
       *
       * @param {number} [seed]
       * @param {number} [mode]
       */

    }, {
      key: 'srand',
      value: function srand() {
        var seed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : generateSeed();
        var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : JSMTRand.MODE_MT_RAND_19937;

        this.mtSRand_(seed, mode);
      }

      /**
       * Get the next random number
       *
       * @return {number}
       */

    }, {
      key: 'rand',
      value: function rand() {
        if (!this.mt_rand_is_seeded_) {
          this.srand();
        }

        /**
         * mt_rand() returns 32 random bits.
         * but php_rand only returns 31 at most.
         */
        return this.mtRand_() >>> 1;
      }

      /**
       * Get the max number this generator will provide
       *
       * @returns {number}
       */

    }], [{
      key: 'getrandmax',
      value: function getrandmax() {
        return MT_RAND_MAX;
      }
    }]);

    return JSMTRand;
  }();

  /* Uses the fixed, correct, Mersenne Twister implementation, available as of PHP 7.1.0. */


  JSMTRand.MODE_MT_RAND_19937 = 0;

  /* Uses an incorrect Mersenne Twister implementation which was used as the default up till PHP 7.1.0. This mode is available for backward compatibility. */
  JSMTRand.MODE_MT_RAND_PHP = 1;

  return JSMTRand;

})));
