import { expect } from 'chai';

import { Networks } from '../model/network';
import * as Common from './common';

describe('Common Test', () => {
  it('getSupportedNetworks()', () => {
    const networks = Common.getSupportedNetworks();

    expect(networks).to.contain(Networks.MAINNET);
    expect(networks).to.contain(Networks.KOVAN);
    expect(networks).to.contain('ropsten');
    expect(networks).to.contain('rinkeby');
  });

  it('getFeeOptionUnit()', () => {
    const unit = Common.getFeeOptionUnit();

    expect(unit).to.contain('Gwei');
  });

  describe('isValidFeeOption()', () => {
    it('valid network and amount', () => {
      const result = Common.isValidFeeOption(Networks.MAINNET, '0.0001');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid network and invalid amount', () => {
      const result = Common.isValidFeeOption(Networks.MAINNET, 'ten');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('valid network and too small amount', () => {
      const result = Common.isValidFeeOption(Networks.MAINNET, '0.0000000001');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid network', (done) => {
      try {
        Common.isValidFeeOption('testnet', '0.0001');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('isValidAddr()', () => {
    it('valid address', () => {
      const result = Common.isValidAddr(Networks.MAINNET, '0x81103f8b6d26688220bb750d9d3b5ba735b5ddc2');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid checksumed address', () => {
      const result = Common.isValidAddr(Networks.MAINNET, '0x81103f8b6d26688220Bb750d9d3B5bA735B5DDc2');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('invalid address', () => {
      const result = Common.isValidAddr(Networks.MAINNET, '81103f8b6d26688220bb750d9d3b5ba735b5ddc2');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid checksumed address', () => {
      const result = Common.isValidAddr(Networks.MAINNET, '0x81103f8b6d26688220Bb750d9d3B5bA735B5Ddc2');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid network', (done) => {
      try {
        Common.isValidAddr('testnet', '0x81103f8b6d26688220bb750d9d3b5ba735b5ddc2');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('isValidNormAmount()', () => {
    it('valid amount', () => {
      const result = Common.isValidNormAmount('23.1');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid amount, 1 wei', () => {
      const result = Common.isValidNormAmount('0.000000000000000001');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('invalid amount', () => {
      const result = Common.isValidNormAmount('ten');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('too small amount, 0.1 wei', () => {
      const result = Common.isValidNormAmount('0.0000000000000000001');

      expect(result).to.be.false; // tslint:disable-line
    });
  });

  describe('convertNormAmountToBaseAmount()', () => {
    it('valid amount: 2.21', () => {
      const baseAmount = Common.convertNormAmountToBaseAmount('2.21');

      expect(baseAmount).to.deep.eq('2210000000000000000');
    });

    it('valid amount: 0.05521', () => {
      const baseAmount = Common.convertNormAmountToBaseAmount('0.05521');

      expect(baseAmount).to.deep.eq('55210000000000000');
    });

    it('invalid amount: 0.l', (done) => {
      try {
        Common.convertNormAmountToBaseAmount('0.l');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });

    it('invalid amount: 0.0000000000000000001', (done) => {
      try {
        Common.convertNormAmountToBaseAmount('0.0000000000000000001');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });
  });

  describe('convertBaseAmountToNormAmount()', () => {
    it('valid amount: 7150609000000000', () => {
      const normalAmount = Common.convertBaseAmountToNormAmount('7150609000000000');

      expect(normalAmount).to.deep.eq('0.007150609');
    });

    it('valid amount: 160490000000000000000', () => {
      const normalAmount = Common.convertBaseAmountToNormAmount('160490000000000000000');

      expect(normalAmount).to.deep.eq('160.49');
    });

    it('invalid amount: l10', (done) => {
      try {
        Common.convertBaseAmountToNormAmount('l10');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });

    it('invalid amount: 0.1', (done) => {
      try {
        Common.convertBaseAmountToNormAmount('0.1');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });
  });

  describe('getUrlForAddr()', () => {
    it('valid network', () => {
      const url = Common.getUrlForAddr(Networks.MAINNET, '0x81103f8b6d26688220Bb750d9d3B5bA735B5DDc2');

      expect(url).to.be.a('string');
    });

    it('invalid network', (done) => {
      try {
        Common.getUrlForAddr('testnet', '0x81103f8b6d26688220Bb750d9d3B5bA735B5DDc2');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('getUrlForTx()', () => {
    it('valid network', () => {
      const url = Common.getUrlForTx(
        Networks.MAINNET, '0x02b5063d48cda90d097690677da5fb950ef3016697ec9942823bc2a4962af322',
      );

      expect(url).to.be.a('string');
    });

    it('invalid network', (done) => {
      try {
        Common.getUrlForTx('testnet', '0x02b5063d48cda90d097690677da5fb950ef3016697ec9942823bc2a4962af322');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('encodePubkeyToAddr()', () => {
    /* tslint:disable:max-line-length */
    it('valid network, valid hexstring', () => {
      const address = Common.encodePubkeyToAddr(Networks.MAINNET, '042261ac392ca7c44ee24902984e4aac261d431a4b5972a918b359c03fc80cafd5b869345bb2c62191f7f419746de4c111ce796d23df699326be52ebbb4f95e3f3');

      expect(address).to.be.a('string');
      expect(address.toLowerCase()).to.deep.eq('0x9fdf5a43b4296bab73a2e8179a7e3c3161b8e0c4');
    });

    it('valid network, valid hexstring', () => {
      const address = Common.encodePubkeyToAddr(Networks.KOVAN, '04f1fd4761b0bafb0a3abd72b392722c69335bb23e25468f185e8bcf998245826d62d8fd619643b22d4f0f83af4da6046b7a72f28f0a5bbe2764851d3fa6e91868');

      expect(address).to.be.a('string');
      expect(address.toLowerCase()).to.deep.eq('0x21709bc9ad2f1553fabb15a280750a129a2a82fe');
    });

    it('valid network, invalid hexstring', (done) => {
      try {
        Common.encodePubkeyToAddr(Networks.KOVAN, '02f1fd4761b0bafb0a3abd72b392722c69335bb23e25468f185e8bcf998245826d');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid uncompressed');
        done();
      }
    });

    it('invalid network', (done) => {
      try {
        Common.encodePubkeyToAddr('testnet', '042261ac392ca7c44ee24902984e4aac261d431a4b5972a918b359c03fc80cafd5b869345bb2c62191f7f419746de4c111ce796d23df699326be52ebbb4f95e3f3');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
    /* tslint:enable:max-line-length */
  });
});
