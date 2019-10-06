import * as ArmadilloProtob from 'kelvinjs-protob';

import axios from 'axios';
import * as ethUtil from 'ethereumjs-util';
import { HttpProvider } from 'web3-providers';

import { IArmadilloCommand, IArmadilloResponse, ITransactionSchema } from '../model/currency';
import { IEthereumNetwork, Networks, supportedNetworks } from '../model/network';
import * as Utils from './utils';
import { getWeb3 } from './web3';

const web3Utils = getWeb3().utils;

export function getSupportedNetworks(): string[] {
  return [Networks.MAINNET, Networks.KOVAN, Networks.ROPSTEN, Networks.RINKEBY];
}

export function getSupportedNetwork(network: string): IEthereumNetwork {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  return supportedNetworks[network];
}

export function getFeeOptionUnit(): string {
  return 'Gwei';
}

export function isValidFeeOption(network: string, feeOpt: string): boolean {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  try {
    web3Utils.toWei(feeOpt, 'Gwei');
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidAddr(network: string, addr: string): boolean {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  if (addr.toLowerCase() === addr || addr.slice(2).toUpperCase() === addr.slice(2)) {
    return ethUtil.isValidAddress(addr);
  } else {
    return ethUtil.isValidChecksumAddress(addr);
  }
}

export function isValidNormAmount(amount: string): boolean {
  try {
    web3Utils.toWei(amount, 'ether');
    return true;
  } catch (error) {
    return false;
  }
}

export function convertNormAmountToBaseAmount(amount: string): string {
  if (isValidNormAmount(amount)) {
    return web3Utils.toWei(amount, 'ether');
  } else {
    throw Error('invalid amount');
  }
}

export function convertBaseAmountToNormAmount(amount: string): string {
  try {
    return web3Utils.fromWei(amount, 'ether');
  } catch (error) {
    throw Error('invalid amount');
  }
}

function etherscanUrlOfNetwork(network: string): string {
  const ethNetwork: IEthereumNetwork = getSupportedNetwork(network);

  return ethNetwork.etherscanUrl;
}

export function getUrlForAddr(network: string, addr: string): string {
  return `${etherscanUrlOfNetwork(network)}/address/${addr.toLowerCase()}`;
}

export function getUrlForTx(network: string, txid: string): string {
  return `${etherscanUrlOfNetwork(network)}/tx/${txid.toLowerCase()}`;
}

export function encodePubkeyToAddr(network: string, pubkey: string): string {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  if (!/^04[0-9a-fA-F]{128}$/.test(pubkey)) {
    throw Error('invalid uncompressed public key');
  }

  const buffer = Utils.toSafeBuffer(pubkey);
  const publicKey = ethUtil.importPublic(buffer) as Buffer;
  const addressBuffer = ethUtil.pubToAddress(publicKey) as Buffer;
  const address = ethUtil.toChecksumAddress(Utils.hexencode(addressBuffer, true));

  return address;
}

export async function getFeeOptions(network: string): Promise<string[]> {
  const ethNetwork: IEthereumNetwork = getSupportedNetwork(network);

  if (network === Networks.MAINNET) {
    const response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
    return [`${response.data.fastest}`, `${response.data.fast}`, `${response.data.safeLow}`];
  }

  const web3 = getWeb3(ethNetwork);
  const price = await web3.eth.getGasPrice();

  return [web3.utils.fromWei(price, 'Gwei')];
}

export function getHistorySchema(): ITransactionSchema[] {
  return [
    {
      key: 'type',
      format: 'string',
      label: 'Type',
    },
    {
      key: 'date',
      format: 'date',
      label: 'Date',
    },
    {
      key: 'txid',
      format: 'hash',
      label: 'TxHash',
    },
    {
      key: 'to',
      format: 'address',
      label: 'To',
    },
    {
      key: 'value',
      format: 'value',
      label: 'Value',
    },
    {
      key: 'fee',
      format: 'value',
      label: 'Fee',
    },
    {
      key: 'isConfirmed',
      label: 'isConfirmed',
      format: 'number',
    },
  ];
}

export async function submitTransaction(network: string, signedTx: string): Promise<string> {
  const ethNetwork: IEthereumNetwork = getSupportedNetwork(network);
  const web3 = getWeb3(ethNetwork);

  const provider: HttpProvider = web3.currentProvider as HttpProvider;
  const result = await provider.send('eth_sendRawTransaction', [signedTx]);
  return result;
}

export function prepareCommandGetPubkey(network: string, accountIndex: number): IArmadilloCommand {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  const req = new ArmadilloProtob.Ethereum.EthCommand();
  const msg = new ArmadilloProtob.Ethereum.EthCommand.EthGetXPub();
  const pathList: number[] = Utils.getAccountPath(accountIndex);

  if (pathList.length < 2 || pathList.length > 5) {
    throw Error('invalid path');
  }

  msg.setPathList(pathList);
  req.setGetXpub(msg);

  return {
    commandId: ArmadilloProtob.ETHEREUM_CMDID,
    payload: Buffer.from(req.serializeBinary()),
  };
}

export function parsePubkeyResponse(walletRsp: IArmadilloResponse): string {
  const response = ArmadilloProtob.Ethereum.EthResponse.deserializeBinary(walletRsp.payload);
  const data = response.getXpub();
  if (!data) {
    throw Error('invalid wallet response');
  }
  const publicKey: Buffer = Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(data.getXpub_asU8().slice(0, 64)),
  ]);

  return publicKey.toString('hex');
}

export function prepareCommandShowAddr(network: string, accountIndex: number): IArmadilloCommand {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  const req = new ArmadilloProtob.Ethereum.EthCommand();
  const msg = new ArmadilloProtob.Ethereum.EthCommand.EthShowAddr();
  const pathList: number[] = Utils.getAccountPath(accountIndex);

  if (pathList.length !== 5) {
    throw Error('invalid path');
  }

  msg.setPathList(pathList);
  req.setShowAddr(msg);

  return {
    commandId: ArmadilloProtob.ETHEREUM_CMDID,
    payload: Buffer.from(req.serializeBinary()),
  };
}
