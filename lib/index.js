import {N, M, MT_RAND_MAX} from './const';
import {
  toUInt32,
  twist,
  twistPHP,
  generateSeed,
  randRangeBadScaling,
  unexpected,
} from './utils';

/**
 * The Javascript version of mt_rand();
 *
 * this pseudo-random generator can produce the same numbers as php's mt_rand do
 * with given seed.
 */
class JSMTRand {

  /**
   * @constructor JSMTRand
   */
  constructor() {
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
  mtInitialize_(seed) {
    let s = 0;
    let r = 0;
    let i = 1;

    seed = toUInt32(seed);
    const state = this.state_;

    state[s++] = seed & 0xFFFFFFFF;

    for (; i < N; ++i) {
      const t = state[r] ^ (state[r] >>> 30);

      /* to avoid the overflow by big numbers' multiplication */
      const t_low = t & 0xFFFF;
      const t_high = (t & 0xFFFF0000) >>> 16;
      state[s++] = toUInt32(0x6c078965 * t_low +
          toUInt32((0x6c078965 * t_high) << 16) + i);

      r++;
    }
  }

  /**
   * Generate N new values in state
   * Made clearer and faster by Matthew Bellew (matthew.bellew@home.com)
   *
   * @private
   */
  mtReload_() {
    const state = this.state_;

    let p = 0;
    let i;
    let twistFunc;
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
      state[p] = twistFunc(
          state[p + M],
          state[p],
          state[p + 1],
      );
    }

    for (i = M; --i; ++p) {
      state[p] = twistFunc(
          state[p + M - N],
          state[p],
          state[p + 1],
      );
    }

    state[p] = twistFunc(
        state[p + M - N],
        state[p],
        state[0],
    );

    this.left_ = N;
    this.next_ = 0;
  }

  /**
   * Seed the generator with a simple uint32
   * @param {number} seed
   * @param {number} mode
   * @private
   */
  mtSRand_(seed, mode) {
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
  mtRand_() {
    if (!this.mt_rand_is_seeded_) {
      this.srand();
    }

    if (this.left_ === 0) {
      this.mtReload_();
    }
    --this.left_;

    let rand = this.state_[this.next_++];
    rand ^= rand >>> 11;
    rand ^= (rand << 7) & 0x9d2c5680;
    rand ^= (rand << 15) & 0xefc60000;
    rand ^= (rand >>> 18);
    return toUInt32(rand);
  }

  randRange32_(max) {
    max = toUInt32(max);

    let result = this.mtRand_();

    /* Special case where no modulus is required */
    if (unexpected(max === 0xFFFFFFFF, 'max is 0xffffffff')) {
      return result;
    }

    /* Increment the max so the range is inclusive of max */
    max++;

    /* Powers of two are not biased */
    if ((max & (max - 1)) === 0) {
      return result & (max - 1);
    }

    /* Ceiling under which UINT32_MAX % max == 0 */
    let limit = toUInt32(0xFFFFFFFF - (0xFFFFFFFF % max) - 1);

    /* Discard numbers over the limit to avoid modulo bias */
    // while (unexpected(result > limit, 'result > limit')) {
    while (result > limit) {
      result = this.mtRand_();
    }

    return result % max;
  }

  randRange64_(max) {
    console.error(
        'bit operators in javascript does not support 64 bit integer yet.',
        this);
  }

  mtRandRange_(min, max) {
    let umax = max - min;
    if (unexpected(umax > 0xFFFFFFFF, 'umax > 0xffffffff')) {
      return this.randRange64_(umax);
    }

    return min + this.randRange32_(umax);
  }

  mtRandCommon(min, max) {
    switch (this.mode_) {
      case JSMTRand.MODE_MT_RAND_PHP:
        /**
         * mt_rand() returns 32 random bits.
         * but php_rand only returns 31 at most.
         */
        let n = this.mtRand_() >>> 1;
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
  srand(seed = generateSeed(), mode = JSMTRand.MODE_MT_RAND_19937) {
    this.mtSRand_(seed, mode);
  }

  /**
   * Get the next random number
   *
   * @return {number|null}
   */
  rand(min = 0, max = JSMTRand.getrandmax()) {
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
  static getrandmax() {
    return MT_RAND_MAX;
  }
}

/* Uses the fixed, correct, Mersenne Twister implementation, available as of PHP 7.1.0. */
JSMTRand.MODE_MT_RAND_19937 = 0;

/* Uses an incorrect Mersenne Twister implementation which was used as the default up till PHP 7.1.0. This mode is available for backward compatibility. */
JSMTRand.MODE_MT_RAND_PHP = 1;

export default JSMTRand;
