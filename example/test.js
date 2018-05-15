let JSMTRand = require('../lib/index');

let random = new JSMTRand();
random.srand(0);
// equals to
// random.srand(0, JSMTRand.MODE_MT_RAND_19937);

for (let i = 0; i < 50; i++) {
  console.log(random.rand());
}

console.log('=====');

random.srand(0, JSMTRand.MODE_MT_RAND_PHP);

for (let i = 0; i < 50; i++) {
  console.log(random.rand());
}