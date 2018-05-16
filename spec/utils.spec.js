import {
  toInt32,
  toUInt32,
  loBit,
  hiBit,
  loBits,
  mixBits,
  generateSeed,
} from '../lib/utils';

describe('utils', () => {

  describe('toInt32', () => {
    it('should convert a number to signed int32', () => {
      expect(toInt32(-2147483648)).toEqual(-2147483648); //-2^31
      expect(toInt32(-1)).toEqual(-1);
      expect(toInt32(0)).toEqual(0);
      expect(toInt32(1)).toEqual(1);
      expect(toInt32(2147483647)).toEqual(2147483647); //2^31-1
    });

    it('should overflow', () => {
      expect(toInt32(-2147483649)).toEqual(2147483647);
      expect(toInt32(-2147483649)).not.toEqual(-2147483649); //-2^31-1
      expect(toInt32(2147483648)).not.toEqual(2147483648); //2^31
      expect(toInt32(2147483648)).toEqual(-2147483648);
    });

    it('should handle special cases', () => {
      expect(toInt32(NaN)).toEqual(0);
      expect(toInt32('not a number')).toEqual(0);
    });
  });

  describe('toUInt32', () => {
    it('should convert a number to unsigned int32', () => {
      expect(toUInt32(0)).toEqual(0);
      expect(toUInt32(1)).toEqual(1);
      expect(toUInt32(2147483647)).toEqual(2147483647); // 2^31-1
      expect(toUInt32(2147483648)).toEqual(2147483648); // 2^31
      expect(toUInt32(4294967295)).toEqual(4294967295); // 2^32-1
    });

    it('should overflow', () => {
      expect(toUInt32(-1)).not.toEqual(-1);
      expect(toUInt32(-1)).toEqual(4294967295);
      expect(toUInt32(4294967296)).not.toEqual(4294967295); // 2^32
      expect(toUInt32(4294967296)).toEqual(0);
    });

    it('should handle special cases', () => {
      expect(toUInt32(NaN)).toEqual(0);
      expect(toUInt32('not a number')).toEqual(0);
    });
  });

  describe('loBit', () => {
    it('should get the lowest bit of a number', () => {
      expect(loBit(0x0)).toEqual(0);
      expect(loBit(0x1)).toEqual(1);
      expect(loBit(0xE)).toEqual(0);
      expect(loBit(0xF)).toEqual(1);
    });
  });

  describe('hiBit', () => {
    it('should get the 32rd bit of a number', () => {
      expect(hiBit(0x0AFBFCFD)).toEqual(0);
      expect(hiBit(0x7FBFCFDF)).toEqual(0);
      expect(hiBit(0x8FFCFDFE) >>> 0).toEqual(0x80000000);
      expect(hiBit(0xFFFFDFEF) >>> 0).toEqual(0x80000000);
    });
  });

  describe('loBits', () => {
    it('should get the lower bits of a number', () => {
      expect(loBits(0x0AFBFCFD)).toEqual(0x0AFBFCFD);
      expect(loBits(0x7FBFCFDF)).toEqual(0x7FBFCFDF);
      expect(loBits(0x8FFCFDFE)).toEqual(0x0FFCFDFE);
      expect(loBits(0xFFFFDFEF)).toEqual(0x7FFFDFEF);
    });
  });

  describe('mixBits', () => {
    it('should move the 32rd bit of u to v', () => {
      expect(mixBits(0x0FFFFFFF, 0x0AFBFCFD)).toEqual(0x0AFBFCFD);
      expect(mixBits(0x7FFFFFFF, 0x0FBFCFEF)).toEqual(0x0FBFCFEF);
      expect(mixBits(0x8FFFFFFF, 0x0FFCFDFE) >>> 0).toEqual(0x8FFCFDFE);
      expect(mixBits(0xFFFFFFFF, 0x0FFFDFEF) >>> 0).toEqual(0x8FFFDFEF);
    });
  });

  describe('generateSeed', () => {
    it('should generator random numbers', () => {
      expect(generateSeed()).toEqual(jasmine.any(Number));
    });
  });
});
