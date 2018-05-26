/**
 * JSMTRand version 2.1.0
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

  /* 2 ^ 31 - 1, compatibility with the php_rand */
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
  function randRangeBadScaling(n, min, max, tmax) {
    return min + (max - min + 1) * (n / (tmax + 1.0)) >>> 0;
  }

  /**
   * Helper function to output unexpected value to console.
   *
   * @param {boolean} n
   * @param {string} reason
   * @returns {*}
   */
  function unexpected(n, reason) {
    if (n) {
      console.warn('unexpected: ' + reason);
    }

    return n;
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
        if (!this.mt_rand_is_seeded_) {
          this.srand();
        }

        if (this.left_ === 0) {
          this.mtReload_();
        }
        --this.left_;

        var rand = this.state_[this.next_++];
        rand ^= rand >>> 11;
        rand ^= rand << 7 & 0x9d2c5680;
        rand ^= rand << 15 & 0xefc60000;
        rand ^= rand >>> 18;
        return toUInt32(rand);
      }
    }, {
      key: 'randRange32_',
      value: function randRange32_(max) {
        max = toUInt32(max);

        var result = this.mtRand_();

        /* Special case where no modulus is required */
        if (unexpected(max === 0xFFFFFFFF, 'max is 0xffffffff')) {
          return result;
        }

        /* Increment the max so the range is inclusive of max */
        max++;

        /* Powers of two are not biased */
        if ((max & max - 1) === 0) {
          return result & max - 1;
        }

        /* Ceiling under which UINT32_MAX % max == 0 */
        var limit = toUInt32(0xFFFFFFFF - 0xFFFFFFFF % max - 1);

        /* Discard numbers over the limit to avoid modulo bias */
        // while (unexpected(result > limit, 'result > limit')) {
        while (result > limit) {
          result = this.mtRand_();
        }

        return result % max;
      }
    }, {
      key: 'randRange64_',
      value: function randRange64_(max) {
        console.error('bit operators in javascript does not support 64 bit integer yet.', this);
      }
    }, {
      key: 'mtRandRange_',
      value: function mtRandRange_(min, max) {
        var umax = max - min;
        if (unexpected(umax > 0xFFFFFFFF, 'umax > 0xffffffff')) {
          return this.randRange64_(umax);
        }

        return min + this.randRange32_(umax);
      }
    }, {
      key: 'mtRandCommon',
      value: function mtRandCommon(min, max) {
        switch (this.mode_) {
          case JSMTRand.MODE_MT_RAND_PHP:
            /**
             * mt_rand() returns 32 random bits.
             * but php_rand only returns 31 at most.
             */
            var n = this.mtRand_() >>> 1;
            return randRangeBadScaling(n, min, max, JSMTRand.getrandmax());

          default:
          case JSMTRand.MODE_MT_RAND_19937:
            return this.mtRandRange_(min, max);
        }
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
       * @return {number|null}
       */

    }, {
      key: 'rand',
      value: function rand() {
        var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : JSMTRand.getrandmax();

        if (arguments.length === 0) {
          /**
           * mtRand_() returns 32 random bits.
           * but php_rand only returns 31 at most.
           */
          return this.mtRand_() >>> 1;
        }

        if (unexpected(max < min)) {
          console.error('JSMTRand.rand(min, max): expected min <= max.');
          return null;
        }

        return this.mtRandCommon(min, max);
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
