import * as ethUtil from 'ethereumjs-util';
import { BigNumber } from 'ethers/utils';
import * as rlp from 'rlp';
import { IEthereumTransaction, ISignResponse } from '../model/transaction';

export function getAccountPath(index: number): number[] {
  return [0x8000002C, 0x8000003C, 0x80000000, 0, index];
}

export type BufferInput = string | number | Buffer | BigNumber | undefined;

export function toSafeBuffer(value: BufferInput): Buffer {
  let result: Buffer;
  if (typeof value === 'string') {
    if (!/^(0x)?([0-9a-fA-F]+)?$/.test(value)) {
      throw Error(`invalid string: "${value}"`);
    }
    if (/^[0-9]+$/.test(value)) {
      const bigNumber = new BigNumber(value);
      result = hexdecode(bigNumber.toHexString());
    } else {
      result = hexdecode(value);
    }
  } else if (typeof value === 'number') {
    if (value < 0 || Math.floor(value) !== value) {
      throw Error(`invalid number: ${value}, only accept uint`);
    }

    const byteLength = Math.max(1, Math.ceil(Math.log2(value) / 8));
    result = Buffer.alloc(byteLength);
    result.writeUIntBE(value, 0, byteLength);
  } else if (value instanceof Buffer) {
    result = value;
  } else if (value instanceof BigNumber) {
    result = ethUtil.toBuffer(value.toHexString());
  } else if (typeof value === 'undefined') {
    result = Buffer.alloc(0);
  } else {
    throw Error(`invalid type ${typeof value}`);
  }

  while (result[0] === 0) {
    result = result.slice(1);
  }

  return result;
}

export function hexencode(arr: Uint8Array | number[], addHexPrefix: boolean = false): string {
  if (!(arr instanceof Uint8Array || arr instanceof Array)) {
    throw new Error('input type error');
  }

  const uint8Array = new Uint8Array(arr);
  const buffer = Buffer.from(uint8Array);

  if (addHexPrefix) {
    return ethUtil.addHexPrefix(buffer.toString('hex'));
  } else {
    return buffer.toString('hex');
  }
}

export function hexdecode(hexstring: string): Buffer {
  const str = ethUtil.addHexPrefix(hexstring);

  return ethUtil.toBuffer(str) as Buffer;
}

export function rlpEncode(data: any[]): Buffer {
  const rawData = data.map((value) => toSafeBuffer(value));

  return toSafeBuffer(rlp.encode(rawData).toString('hex'));
}

export function computeV(tx: IEthereumTransaction, publicKey: string, signature: ISignResponse): number {
  const hash = ethUtil.keccak256(rlpEncode([
    tx.nonce,
    tx.gasPrice,
    tx.gasLimit,
    tx.to,
    tx.value,
    tx.data,
    tx.chainId,
    0,
    0,
  ]));

  const publicKeyV27 = ethUtil.ecrecover(hash, 27, signature.r, signature.s);
  const publicKeyV28 = ethUtil.ecrecover(hash, 28, signature.r, signature.s);

  let v: number;
  if (`04${publicKeyV27.toString('hex')}` === publicKey.toLowerCase()) {
    v = 27;
  } else if (`04${publicKeyV28.toString('hex')}` === publicKey.toLowerCase()) {
    v = 28;
  } else {
    throw Error('invalid signature');
  }

  const chainIdNumber = tx.chainId.readUIntBE(0, tx.chainId.length);

  v += chainIdNumber * 2 + 8;

  return v;
}
