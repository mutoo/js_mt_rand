js_mt_rand
==========

A pesudo-random generator that can produce same numbers with given seed as php's mt_rand do.

javascript version of 32-bit php_mt_rand;
ported from [/php/ext/standard/rand.c](http://lxr.php.net/xref/PHP_5_4/ext/standard/rand.c)


install
-------

```
$ npm install js_mt_rand
```

Usage
-----

```javascript
var mt = require("js_mt_rand")

// set seed
mt.srand(0);

// get next random number
var n = mt.rand(); 

console.log(n);
// 963932192
```

License
-------

PHP 3.01

This product includes PHP software, freely available from <http://www.php.net/software/>