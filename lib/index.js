import {N, M, MT_RAND_MAX} from './const';
import {toUInt32, twist, twistPHP, generateSeed} from './utils';

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
   * @param {string} mode
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
    if (this.left_ === 0) {
      this.mtReload_();
    }
    --this.left_;

    let rand = this.state_[this.next_++];
    rand ^= rand >>> 11;
    rand ^= (rand << 7) & 0x9d2c5680;
    rand ^= (rand << 15) & 0xefc60000;
    return (rand ^ (rand >>> 18));
  }

  /**
   * Seed the generator
   *
   * @param {number} [seed]
   * @param {string} [mode]
   */
  srand(seed, mode) {
    seed = seed || generateSeed();
    mode = mode || JSMTRand.MODE_MT_RAND_19937;
    this.mtSRand_(seed, mode);
  }

  /**
   * Get the next random number
   *
   * @return {number}
   */
  rand() {
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
  static getrandmax() {
    return MT_RAND_MAX;
  }
}

/* Uses the fixed, correct, Mersenne Twister implementation, available as of PHP 7.1.0. */
JSMTRand.MODE_MT_RAND_19937 = 'mode_mt_rand_19937';

/* Uses an incorrect Mersenne Twister implementation which was used as the default up till PHP 7.1.0. This mode is available for backward compatibility. */
JSMTRand.MODE_MT_RAND_PHP = 'mode_mt_rand_php';

export default JSMTRand;
