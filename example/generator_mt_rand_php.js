let JSMTRand = require('../dist/JSMTRand');

let random = new JSMTRand();
random.srand(0, JSMTRand.MODE_MT_RAND_PHP);

for (let i = 0; i < 100; i++) {
  console.log(random.rand());
}