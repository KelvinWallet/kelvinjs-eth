import { expect } from 'chai';

import { KelvinWallet } from 'kelvinjs-usbhid';

import * as Utils from '../src/common/utils';
import ERC20 from '../src/erc20/index';
import Ethereum from '../src/eth/index';
import { IArmadilloCommand, ISignTxRequest } from '../src/model/currency';
import { Networks } from '../src/model/network';
import { IToken } from '../src/model/token';

function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function send(command: IArmadilloCommand): Promise<string> {
  const device = new KelvinWallet();
  const [status, buffer] = device.send(
    command.commandId,
    command.payload,
  );

  device.close();

  if (status !== 0) {
    throw Error(`error status code ${status}`);
  }

  return buffer.toString('hex');
}

const ethereum = new Ethereum();
const erc20 = new ERC20();

const token: IToken = {
  address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
  symbol: 'WETH',
};

erc20.token = token;

let address: string = '';
let publicKey: string = '';
let feeOpts: string[] = [];

/*
describe('Ethereum Test', async () => {
  it('prepareCommandGetPubkey()', async () => {
    const command = ethereum.prepareCommandGetPubkey(Networks.KOVAN, 0);
    const response = await send(command);
    publicKey = ethereum.parsePubkeyResponse({ payload: Utils.hexdecode(response) });
    address = ethereum.encodePubkeyToAddr(Networks.KOVAN, publicKey);

    expect(publicKey).to.be.a('string');
    expect(ethereum.isValidAddr(Networks.KOVAN, address)).to.be.true; // tslint:disable-line

    console.log(address);
  });

  it('prepareCommandShowAddr()', async () => {
    const command = ethereum.prepareCommandShowAddr(Networks.KOVAN, 0);
    const response = await send(command);

    expect(response).to.be.a('string');
    expect(response).to.deep.eq('0800');
  }).timeout(60000);

  it('getBalance()', async () => {
    const balance = await ethereum.getBalance(Networks.KOVAN, address);

    expect(balance).to.be.a('string');
    console.log('Your balance (in normal unit) is', balance);
  });

  it('getFeeOptions()', async () => {
    feeOpts = await ethereum.getFeeOptions(Networks.KOVAN);

    expect(feeOpts).to.be.instanceof(Array);
    expect(feeOpts.length).to.be.gte(0);
    expect(feeOpts[0]).to.be.a('string');
    expect(ethereum.isValidFeeOption(Networks.KOVAN, feeOpts[0])).to.be.true; // tslint:disable-line
  });

  it('getRecentHistory()', async () => {
    const schema = ethereum.getHistorySchema();
    const txList = await ethereum.getRecentHistory(Networks.KOVAN, address);

    expect(txList).to.be.instanceof(Array);

    for (let i = 0; i < txList.length && i < 10; i++) {
      const tx = txList[i];
      for (const field of schema) {
        console.log(field.label, ':', tx[field.key].value);
      }
      console.log();
    }
  });

  it('sign & submit tx', async () => {
    const schema = ethereum.getPreparedTxSchema();
    const req: ISignTxRequest = {
      network: Networks.KOVAN,
      accountIndex: 0,
      toAddr: address,
      fromPubkey: publicKey,
      amount: '0.0001',
      feeOpt: feeOpts[0],
    };
    const [command, txinfo] = await ethereum.prepareCommandSignTx(req);

    expect(command.commandId).to.be.a('number');
    expect(command.payload).to.be.instanceof(Buffer);
    expect(txinfo).to.be.a('object');
    Object.keys(txinfo).forEach((key) => {
      expect(txinfo[key].value).to.be.a('string');
    });

    for (const field of schema) {
      console.log(field.label, ':', txinfo[field.key].value);
    }
    console.log();

    const walletResp = await send(command);
    expect(walletResp).to.be.a('string');

    const signedTx = ethereum.buildSignedTx(req, command, { payload: Utils.hexdecode(walletResp)});
    expect(signedTx).to.be.a('string');
    expect(signedTx).to.match(/^0x[0-9a-fA-F]+$/);
    console.log(signedTx);

    const txhash = await ethereum.submitTransaction(Networks.KOVAN, signedTx);
    console.log(txhash);
  }).timeout(60000);
});
*/

describe('ERC20 Test', async () => {
  it('prepareCommandGetPubkey()', async () => {
    const command = erc20.prepareCommandGetPubkey(Networks.KOVAN, 0);
    const response = await send(command);
    publicKey = erc20.parsePubkeyResponse({ payload: Utils.hexdecode(response) });
    address = erc20.encodePubkeyToAddr(Networks.KOVAN, publicKey);

    expect(publicKey).to.be.a('string');
    expect(erc20.isValidAddr(Networks.KOVAN, address)).to.be.true; // tslint:disable-line

    console.log(address);
  });

  it('prepareCommandShowAddr()', async () => {
    const command = erc20.prepareCommandShowAddr(Networks.KOVAN, 0);
    const response = await send(command);

    expect(response).to.be.a('string');
    expect(response).to.deep.eq('0800');
  }).timeout(60000);

  it('getBalance()', async () => {
    const balance = await erc20.getBalance(Networks.KOVAN, address);

    expect(balance).to.be.a('string');
    console.log('Your balance (in normal unit) is', balance);
  });

  it('getFeeOptions()', async () => {
    feeOpts = await erc20.getFeeOptions(Networks.KOVAN);

    expect(feeOpts).to.be.instanceof(Array);
    expect(feeOpts.length).to.be.gte(0);
    expect(feeOpts[0]).to.be.a('string');
    expect(erc20.isValidFeeOption(Networks.KOVAN, feeOpts[0])).to.be.true; // tslint:disable-line
  });

  it('getRecentHistory()', async () => {
    const schema = erc20.getHistorySchema();
    const txList = await erc20.getRecentHistory(Networks.KOVAN, address);

    expect(txList).to.be.instanceof(Array);

    for (let i = 0; i < txList.length && i < 10; i++) {
      const tx = txList[i];
      for (const field of schema) {
        console.log(field.label, ':', tx[field.key].value);
      }
      console.log();
    }
  });

  // In Kovan network
  // From account 0 (0xFF7886d2441F24c364ca2b6b93E306C1F48ecF12)
  // Send 0.0001 WETH tokens (0xd0A1E359811322d97991E03f863a0C30C2cF029C)
  // To account 1 (0xa60F816703fc4B5f897D6cE138dA945Db1820675)
  it('sign & submit tx', async () => {
    const schema = erc20.getPreparedTxSchema();
    const req: ISignTxRequest = {
      network: Networks.KOVAN,
      accountIndex: 0,
      toAddr: '0xa60F816703fc4B5f897D6cE138dA945Db1820675', // FIXME: integration test
      fromPubkey: publicKey,
      amount: '0.0001', // FIXME: integration test
      feeOpt: feeOpts[0],
    };
    const [command, txinfo] = await erc20.prepareCommandSignTx(req);

    expect(command.commandId).to.be.a('number');
    expect(command.payload).to.be.instanceof(Buffer);
    expect(txinfo).to.be.a('object');
    Object.keys(txinfo).forEach((key) => {
      expect(txinfo[key].value).to.be.a('string');
    });

    for (const field of schema) {
      console.log(field.label, ':', txinfo[field.key].value);
    }
    console.log();

    const walletResp = await send(command);
    expect(walletResp).to.be.a('string');

    const signedTx = erc20.buildSignedTx(req, command, { payload: Utils.hexdecode(walletResp)});
    expect(signedTx).to.be.a('string');
    expect(signedTx).to.match(/^0x[0-9a-fA-F]+$/);
    console.log(signedTx);

    const txhash = await erc20.submitTransaction(Networks.KOVAN, signedTx);
    console.log(txhash);
  }).timeout(60000);
});
