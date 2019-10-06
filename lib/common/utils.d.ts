/// <reference types="node" />
import { BigNumber } from 'ethers/utils';
import { IEthereumTransaction, ISignResponse } from '../model/transaction';
export declare function getAccountPath(index: number): number[];
export declare type BufferInput = string | number | Buffer | BigNumber | undefined;
export declare function toSafeBuffer(value: BufferInput): Buffer;
export declare function hexencode(arr: Uint8Array | number[], addHexPrefix?: boolean): string;
export declare function hexdecode(hexstring: string): Buffer;
export declare function rlpEncode(data: any[]): Buffer;
export declare function computeV(tx: IEthereumTransaction, publicKey: string, signature: ISignResponse): number;
