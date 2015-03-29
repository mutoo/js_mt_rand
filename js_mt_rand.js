/*
 * javascript version of mt_rand();
 *
 * this pesudo-random generator can produce same numbers with given seed as php's mt_rand do.
 *
 */

(function () {

    /* length of state vector */
    var N = 624;
    /* a period parameter */
    var M = 397;

    /* 2^^31, compatibility with the previous php_rand */
    var PHP_MT_RAND_MAX = 0x7FFFFFFF;

    /* convert a number to uint32 */
    var ToUint32 = function (x) {
        return x >>> 0;
    };

    /* convert a number to int32 */
    var ToInt32 = function (x) {
        return x >> 0;
    };

    /* mask all but highest   bit of u */
    var hiBit = function (u) {
        u = ToUint32(u);
        return u & 0x80000000;
    };

    /* mask all but lowest    bit of u */
    var loBit = function (u) {
        u = ToUint32(u);
        return u & 0x00000001;
    };

    /* mask     the highest   bit of u */
    var loBits = function (u) {
        u = ToUint32(u);
        return u & 0x7FFFFFFF;
    };

    /* move hi bit of u to hi bit of v */
    var mixBits = function (u, v) {
        u = ToUint32(u);
        v = ToUint32(v);
        return hiBit(u) | loBits(v);
    };

    var twist = function (m, u, v) {
        m = ToUint32(m);
        u = ToUint32(u);
        v = ToUint32(v);
        return ToUint32(m ^ (mixBits(u, v) >>> 1) ^ (ToUint32(-ToInt32(loBit(u))) & 0x9908b0df));
    };

    var generate_seed = function () {
        return Math.random() * Number.MAX_VALUE;
    };

    /* store the state of the generator */
    var _state = [];
    var _left = 0;
    var _next = 0;
    var _mt_rand_is_seeded = 0;

    /* Initialize generator state with seed
     See Knuth TAOCP Vol 2, 3rd Ed, p.106 for multiplier.
     In previous versions, most significant bits (MSBs) of the seed affect
     only MSBs of the state array.  Modified 9 Jan 2002 by Makoto Matsumoto. */
    var php_mt_initialize = function (seed, state) {
        seed = ToUint32(seed);
        var s = 0;
        var r = 0;
        var i = 1;

        state[s++] = seed & 0xFFFFFFFF;
        for (; i < N; ++i) {
            /* state[s++] = ToUint32(0x6c078965 * (state[r] ^ (state[r] >>> 30)) + i); */
            /* need to handle big numbers' multiplication */
            var t = state[r] ^ (state[r] >>> 30);
            var t_low = t & 0xFFFF;
            var t_high = t & 0xFFFF0000;
            state[s++] = ToUint32(ToUint32(0x6c078965 * t_low) + ToUint32(0x6c078965 * t_high) + i);
            r++;
        }
    };

    /* Generate N new values in state
     Made clearer and faster by Matthew Bellew (matthew.bellew@home.com) */
    var php_mt_reload = function () {
        var state = _state;
        var p = 0;
        var i;

        for (i = N - M; i--; ++p)
            state[p] = twist(state[p + M], state[p], state[p + 1]);
        for (i = M; --i; ++p)
            state[p] = twist(state[p + M - N], state[p], state[p + 1]);
        state[p] = twist(state[p + M - N], state[p], state[0]);

        _left = N;
        _next = 0;
    };

    /* Seed the generator with a simple uint32 */
    var php_mt_srand = function (seed) {
        php_mt_initialize(seed, _state);
        php_mt_reload();

        /* Seed only once */
        _mt_rand_is_seeded = 1;
    };

    /* Pull a 32-bit integer from the generator state
     Every other access function simply transforms the numbers extracted here */
    var php_mt_rand = function () {
        if (_left === 0) {
            php_mt_reload();
        }
        --_left;

        var s1;
        s1 = _state[_next++];
        s1 ^= s1 >>> 11;
        s1 ^= (s1 << 7) & 0x9d2c5680;
        s1 ^= (s1 << 15) & 0xefc60000;
        return (s1 ^ (s1 >>> 18));
    };

    var root = this;

    var previousMtRand = root.mt;

    var mt = function () {
    };


    mt.noConflict = function () {
        root.mt = previousMtRand;
        return this;
    };

    mt.srand = function (seed) {
        seed = seed || generate_seed();
        php_mt_srand(seed);
    };

    mt.rand = function () {
        if (!_mt_rand_is_seeded) {
            php_mt_srand(generate_seed());
        }
        /*
         * Melo: hmms.. randomMT() returns 32 random bits...
         * Yet, the previous php_rand only returns 31 at most.
         * So I put a right shift to loose the lsb. It *seems*
         * better than clearing the msb.
         * Update:
         * I talked with Cokus via email and it won't ruin the algorithm
         */
        var number = php_mt_rand() >>> 1;
        return number;
    };

    mt.getrandmax = function () {
        return PHP_MT_RAND_MAX;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = mt;
        }
        exports.mt = mt;
    } else {
        root.mt = mt;
    }

}.call(this));