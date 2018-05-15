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
let mt = new JSMTRand();

// seed the generator
mt.srand(0);

// get next random number
let n = mt.rand();
```

Changelog
---------

See [CHANGELOG](CHANGELOG.md)

License
-------

The MIT License (MIT)