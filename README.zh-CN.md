js_mt_rand
==========

一个能够与 PHP 产生相同随机数的 Javascript MT19937 伪随机数生成器。

从 PHP 源码移植： [php-src/ext/standard/mt_rand.c](https://github.com/php/php-src/blob/master/ext/standard/mt_rand.c)


安装
-------

### 通过 npm
```
$ npm install js_mt_rand
```

### 或者 yarn
```
$ yarn add js_mt_rand
```

使用方法
-------

```javascript
import JSMTRand from 'js_mt_rand';

let mt = new JSMTRand();

// 设置随机数种子
mt.srand(0);

// 默认使用 php 7.1+ 版的 Mersenne Twister 实现
mt.srand(0, JSMTRand.MODE_MT_RAND_19937);

// 向后兼容 php 5.x
mt.srand(0, JSMTRand.MODE_MT_RAND_PHP);

// 取随机数，范围 [0, 2 ^ 31 - 1]
let n = mt.rand();

// 取随机数，范围 [min, max]，包含 max
let r = mt.rand(min, max);
```

注意事项
-------

由于 PHP 7.1.0 到 7.2.0beta2 版本的 mt_rand() 有一个 [bug](https://externals.io/message/100229), 导致了 `JSMTRand.rand(min, max)` 在这几个版本可能返回不一样的结果。遇到这种情况，请使用不带范围参数的 `JSMTRand.rand()` 方法，并自己封装范围取值函数。

另外由于 Javascript 的位运算尚不支持 64 位整数，所以当前随机数的处理范围被限制在 32 位以内。

更新日志
-------

参见 [CHANGELOG](CHANGELOG.md)

License
-------

The MIT License (MIT)

呜谢
----
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
