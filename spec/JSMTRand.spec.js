import {spawn} from 'child_process';
import {promisify} from 'util';
import path from 'path';
import JSMTRand from '../lib';

const PHP = 'php'; // version: PHP 7.2+
// const PHP = path.resolve('/Applications/MAMP/bin/php/php7.2.1/bin/php');
const generatorPHP = path.resolve(__dirname, 'helpers/generator.php');
console.info('PHP generator:', generatorPHP);

const SINGLE_ASSERTION_TEST_COUNT = 10;
const GENERATE_COUNT = 65535;
const SEEDS_COUNT = 20; // how many child process would run for php generator

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // in ms

describe('JSMTRand', () => {
  const mt = new JSMTRand();

  const getRandomNumbersJS = function(
      seed, mode, min = 0, max = JSMTRand.getrandmax()) {
    mt.srand(seed, mode);

    let ret = [];
    for (let i = 0; i < GENERATE_COUNT; i++) {
      ret.push(mt.rand(min, max));
    }
    return ret;
  };

  let getRandomNumbersPHP = promisify(
      function(seed, mode, min, max, callback) {
        let params = [
          '-s', seed, '-m', mode, '-a', min, '-b', max, '-c', GENERATE_COUNT];

        console.log(`\n${JSON.stringify(params)}`);

        let php = spawn(PHP, [generatorPHP, ...params]);

        let ret = [];

        php.stdout.on('data', (data) => {
          // console.info('stdout', data);
          ret = ret.concat(data.toString().match(/\d+/g).map(x => parseInt(x)));
        });

        php.stderr.on('data', (data) => {
          console.error('PHP generator:', data.toString());
        });

        php.on('error', (error) => {
          console.error(error);
        });

        php.on('close', (code) => {
          if (code !== 0) {
            callback(`child process exited with code ${code}`, null);
          } else {
            callback(null, ret);
          }
        });
      });

  describe('srand', () => {
    it('should get the same result when use the same seed', () => {
      expect(getRandomNumbersJS(0)).toEqual(getRandomNumbersJS(0));
    });

    it('should get the different result when use the different seed', () => {
      expect(getRandomNumbersJS(0)).not.toEqual(getRandomNumbersJS(1));
    });
  });

  describe('rand', () => {
    it('should generator random number', () => {
      expect(mt.rand()).toEqual(jasmine.any(Number));
    });

    const generatorRange = function(min, max) {
      for (let i = 0; i < SINGLE_ASSERTION_TEST_COUNT; i++) {
        let r = mt.rand(min, max);
        expect(r).not.toBeLessThan(min);
        expect(r).not.toBeGreaterThan(max);
      }
    };

    it('should generator random number between min and max', () => {
      mt.srand(0, JSMTRand.MODE_MT_RAND_PHP);
      generatorRange(0, 1);
      generatorRange(0, 2);
      generatorRange(0, 3);
      generatorRange(0, 0xFFFFFFFF - 1);

      mt.srand(0, JSMTRand.MODE_MT_RAND_19937);
      generatorRange(0, 1);
      generatorRange(0, 2);
      generatorRange(0, 3);
      generatorRange(0, 0xFFFFFFFF - 1);
    });
  });

  const seedGenerator = new JSMTRand();
  seedGenerator.srand();

  const runMultipleSeeds = (mode) => {
    let expects = [];
    for (let i = 0; i < SEEDS_COUNT; i++) {
      let min = seedGenerator.rand();
      let max = seedGenerator.rand();

      if (min > max) {
        [min, max] = [max, min];
      }

      let seed = seedGenerator.rand();
      expects.push(getRandomNumbersPHP(seed, mode, min, max).then((ret) => {
        expect(getRandomNumbersJS(seed, mode, min, max)).
            toEqual(ret);
      }));
    }

    return Promise.all(expects);
  };

  describe('MODE_MT_RAND_19937', () => {
    it('should generate a same sequence of numbers as the php_mt_rand (seed=0)',
        (done) => {
          let min = 0;
          let max = JSMTRand.getrandmax();
          getRandomNumbersPHP(0, JSMTRand.MODE_MT_RAND_19937, min, max).
              then((ret) => {
                expect(getRandomNumbersJS(0, JSMTRand.MODE_MT_RAND_19937, min,
                    max)).
                    toEqual(ret);
              }).
              then(done);
        });

    it('should generate a same sequence of numbers as the php_mt_rand',
        (done) => {
          runMultipleSeeds(JSMTRand.MODE_MT_RAND_19937).then(done);
        });
  });

  describe('MODE_MT_RAND_PHP', () => {
    it('should generate a same sequence of numbers as the php_mt_rand (seed=0)',
        (done) => {
          let min = 0;
          let max = JSMTRand.getrandmax();
          getRandomNumbersPHP(0, JSMTRand.MODE_MT_RAND_PHP, min, max).
              then((ret) => {
                expect(
                    getRandomNumbersJS(0, JSMTRand.MODE_MT_RAND_PHP, min, max)).
                    toEqual(ret);
              }).
              then(done);
        });

    it('should generate a same sequence of numbers as the php_mt_rand',
        (done) => {
          runMultipleSeeds(JSMTRand.MODE_MT_RAND_PHP).then(done);
        });
  });
});
