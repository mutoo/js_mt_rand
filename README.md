js_mt_rand
==========

A pseudo-random generator that can produce the same numbers as php's mt_rand do with given seed.

the javascript version of 32-bit php_mt_rand;
ported from [php-src/ext/standard/mt_rand.c](https://github.com/php/php-src/blob/master/ext/standard/mt_rand.c)


Install
-------

### via npm
```
$ npm install js_mt_rand
```

### via yarn
```
$ yarn add js_mt_rand
```

Usage
-----

```javascript
import JSMTRand from 'js_mt_rand';

let mt = new JSMTRand();

// seed the generator
mt.srand(0);

// php 7.1+ Mersenne Twister implementation (default)
mt.srand(0, JSMTRand.MODE_MT_RAND_19937);

// get next random number, range: [0, 2 ^ 32 - 1)
// N.B. MODE_MT_RAND_19937 has a wider range than MODE_MT_RAND_PHP
let m = mt.rand(0, 0xFFFFFFFF);

// php 5.x backward compatibility.
mt.srand(0, JSMTRand.MODE_MT_RAND_PHP);

// get next random number, range: [0, 2 ^ 31 - 1]
let n = mt.rand();

// get next random number in range: [min, max], max is inclusive
let r = mt.rand(min, max);
```

Pitfall
-------

Due to the PHP 7.1.0 to 7.2.0beta2 mt_rand() modulo bias [bug](https://externals.io/message/100229), the `JSMTRand.rand(min, max)` may return different results between php 7.1.0 to 7.2.0beta2, just use `JSMTRand.rand()` instead and wrap your own range function.

Since the bip operators in javascript are not support 64 bits integer yet, the generator would only work with 32 bits range.

Changelog
---------

See [CHANGELOG](CHANGELOG.md)

License
-------

The MIT License (MIT)

Credits
-------
Authors of PHP 7.1+: 
Rasmus Lerdorf,
Zeev Suraski,
Pedro Melo,
Sterling Hughes.

Based on code from: 
Richard J. Wagner,
Makoto Matsumoto,
Takuji Nishimura,
Shawn Cokus.
