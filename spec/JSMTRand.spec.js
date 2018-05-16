import {spawn} from 'child_process';
import path from 'path';
import JSMTRand from '../lib';

const generatorPHP = path.resolve(__dirname, 'helpers/generator.php');
console.info('PHP generator:', generatorPHP);

const GENERATE_COUNT = 65535;
const SEEDS_COUNT = 10; // how many child process would run for php generator

describe('JSMTRand', () => {
  const mt = new JSMTRand();

  const getRandomNumbersJS = function(seed, mode) {
    mt.srand(seed, mode);

    let ret = [];
    for (let i = 0; i < GENERATE_COUNT; i++) {
      ret.push(mt.rand());
    }
    return ret;
  };

  const getRandomNumbersPHP = function(seed, mode, callback) {
    let php = spawn('php',
        [generatorPHP, '-s', seed, '-m', mode, '-c', GENERATE_COUNT]);

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
      // console.info(`child process exited with code ${code}`);
      callback(code === 0 ? ret : null);
    });
  };

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
  });

  const seedGenerator = new JSMTRand();
  seedGenerator.srand();

  const runMultipleSeeds = (mode, done) => {
    let expects = [];
    for (let i = 0; i < SEEDS_COUNT; i++) {
      let deferred = Promise.defer();
      let seed = seedGenerator.rand();
      getRandomNumbersPHP(seed, mode, (ret) => {
        expect(getRandomNumbersJS(seed, mode)).
            toEqual(ret);
        deferred.resolve();
      });
      expects.push(deferred);
    }

    Promise.all(expects).then(done);
  };

  describe('MODE_MT_RAND_19937', () => {
    it('should generate a same sequence of numbers as the php_mt_rand (seed=0)',
        (done) => {
          getRandomNumbersPHP(0, JSMTRand.MODE_MT_RAND_19937, (ret) => {
            expect(getRandomNumbersJS(0, JSMTRand.MODE_MT_RAND_19937)).
                toEqual(ret);
            done();
          });
        });

    it('should generate a same sequence of numbers as the php_mt_rand',
        (done) => {
          runMultipleSeeds(JSMTRand.MODE_MT_RAND_19937, done);
        });
  });

  describe('MODE_MT_RAND_PHP', () => {
    it('should generate a same sequence of numbers as the php_mt_rand (seed=0)',
        (done) => {
          getRandomNumbersPHP(0, JSMTRand.MODE_MT_RAND_PHP, (ret) => {
            expect(getRandomNumbersJS(0, JSMTRand.MODE_MT_RAND_PHP)).
                toEqual(ret);
            done();
          });
        });

    it('should generate a same sequence of numbers as the php_mt_rand',
        (done) => {
          runMultipleSeeds(JSMTRand.MODE_MT_RAND_PHP, done);
        });
  });
});