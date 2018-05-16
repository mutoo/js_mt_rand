import {spawn} from 'child_process';
import {promisify} from 'util';
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

  let getRandomNumbersPHP = promisify(function(seed, mode, callback) {
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
  });

  const seedGenerator = new JSMTRand();
  seedGenerator.srand();

  const runMultipleSeeds = (mode) => {
    let expects = [];
    for (let i = 0; i < SEEDS_COUNT; i++) {
      let seed = seedGenerator.rand();
      expects.push(getRandomNumbersPHP(seed, mode).then((ret) => {
        expect(getRandomNumbersJS(seed, mode)).
            toEqual(ret);
      }));
    }

    return Promise.all(expects);
  };

  describe('MODE_MT_RAND_19937', () => {
    it('should generate a same sequence of numbers as the php_mt_rand (seed=0)',
        (done) => {
          getRandomNumbersPHP(0, JSMTRand.MODE_MT_RAND_19937).then((ret) => {
            expect(getRandomNumbersJS(0, JSMTRand.MODE_MT_RAND_19937)).
                toEqual(ret);
          }).then(done);
        });

    it('should generate a same sequence of numbers as the php_mt_rand',
        (done) => {
          runMultipleSeeds(JSMTRand.MODE_MT_RAND_19937).then(done);
        });
  });

  describe('MODE_MT_RAND_PHP', () => {
    it('should generate a same sequence of numbers as the php_mt_rand (seed=0)',
        (done) => {
          getRandomNumbersPHP(0, JSMTRand.MODE_MT_RAND_PHP).then((ret) => {
            expect(getRandomNumbersJS(0, JSMTRand.MODE_MT_RAND_PHP)).
                toEqual(ret);
          }).then(done);
        });

    it('should generate a same sequence of numbers as the php_mt_rand',
        (done) => {
          runMultipleSeeds(JSMTRand.MODE_MT_RAND_PHP).then(done);
        });
  });
});
