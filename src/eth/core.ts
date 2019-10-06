import * as ArmadilloProtob from 'kelvinjs-protob';

import axios from 'axios';
import * as ethUtil from 'ethereumjs-util';
import { BigNumber } from 'ethers/utils';

import * as Common from '../common/common';
import * as Utils from '../common/utils';
import { getWeb3 } from '../common/web3';
import {
  IArmadilloCommand,
  IArmadilloResponse,
  ISignTxRequest,
  ITransaction,
  ITransactionSchema,
} from '../model/currency';
import { IEthereumNetwork, Networks } from '../model/network';
import {
  convertIEtherscanTransaction,
  IEtherscanTransaction,
  IEtherscanTransactionInput,
} from '../model/transaction';

export function getBalance(network: string, addr: string): Promise<string> {
  const ethNetwork: IEthereumNetwork = Common.getSupportedNetwork(network);
  const web3 = getWeb3(ethNetwork);
  // TODO: FIXME: Convert to normal unit (ETH rather than Wei) before return
  return web3.eth.getBalance(addr);
}

export async function getRecentHistory(network: string, addr: string): Promise<ITransaction[]> {
  const ethNetwork: IEthereumNetwork = Common.getSupportedNetwork(network);
  const resp = await axios(ethNetwork.etherscanAPI, {
    params: {
      module: 'account',
      action: 'txlist',
      address: addr,
      sort: 'desc',
    },
  });

  if (resp.status !== 200 || resp.data.status !== '1' || !(resp.data.result instanceof Array)) {
    throw Error(resp.data.message);
  }

  const rawTxList: IEtherscanTransactionInput[] = resp.data.result;
  const safeTxList = rawTxList.map<IEtherscanTransaction>((tx) => {
    const result = convertIEtherscanTransaction(tx);
    if (result) {
      return result;
    }

    throw Error('invalid data');
  });

  return safeTxList.map<ITransaction>((tx) => {
    const gas = new BigNumber(tx.gas);
    const gasPrice = new BigNumber(tx.gasPrice);
    const isSelf = tx.from.toLowerCase() === tx.to.toLowerCase();
    const isSent = tx.from.toLowerCase() === addr.toLowerCase();

    return {
      type: {
        value: isSelf ? 'Self' : (isSent ? 'Sent' : 'Received'),
      },
      date: {
        value: tx.timeStamp.toISOString(),
      },
      txid: {
        value: tx.hash,
        link: Common.getUrlForTx(network, tx.hash),
      },
      to: {
        value: tx.to,
        link: Common.getUrlForAddr(network, tx.to),
      },
      value: {
        value: Common.convertBaseAmountToNormAmount(tx.value),
      },
      fee: {
        value: Common.convertBaseAmountToNormAmount(gas.mul(gasPrice).toString()),
      },
      isConfirmed: {
        value: '1',
      },
    };
  });
}

export function getPreparedTxSchema(): ITransactionSchema[] {
  return [
    {
      key: 'from',
      format: 'address',
      label: 'From Address',
    },
    {
      key: 'to',
      format: 'address',
      label: 'To Address',
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
      key: 'nonce',
      format: 'number',
      label: 'Nonce',
    },
  ];
}

export async function prepareCommandSignTx(req: ISignTxRequest): Promise<[IArmadilloCommand, ITransaction]> {
  const ethNetwork = Common.getSupportedNetwork(req.network);
  const web3 = getWeb3(ethNetwork);

  if (req.accountIndex < 0) {
    throw Error('invalid account index');
  }

  if (!req.feeOpt) {
    throw Error('no fee option');
  }

  if (!Common.isValidAddr(req.network, req.toAddr)) {
    throw Error('invalid to address');
  }

  if (!Common.isValidNormAmount(req.amount)) {
    throw Error('invalid amount');
  }

  const from = Common.encodePubkeyToAddr(req.network, req.fromPubkey);
  const to = ethUtil.toChecksumAddress(req.toAddr);
  const nonce = await web3.eth.getTransactionCount(from);
  const value = Common.convertNormAmountToBaseAmount(req.amount);
  const gasLimit = await web3.eth.estimateGas({
    from,
    to,
    value,
  });
  const gasPrice = web3.utils.toWei(req.feeOpt, 'Gwei');
  const fee = new BigNumber(gasLimit).mul(new BigNumber(gasPrice));

  const toBuffer = Utils.toSafeBuffer(req.toAddr);
  const chainIdBuffer = Utils.toSafeBuffer(ethNetwork.chainId);
  const nonceBuffer = Utils.toSafeBuffer(nonce);
  const gasLimitBuffer = Utils.toSafeBuffer(gasLimit);
  const gasPriceBuffer = Utils.toSafeBuffer(gasPrice);
  const valueBuffer = Utils.toSafeBuffer(value);

  const pathList: number[] = Utils.getAccountPath(req.accountIndex);

  if (
    pathList.length !== 5
    || toBuffer.length !== 20
    || chainIdBuffer.length > 4
    || nonceBuffer.length > 32
    || gasLimitBuffer.length > 32
    || gasPriceBuffer.length > 32
    || valueBuffer.length > 32
  ) {
    throw new Error('invalid sign request');
  }

  const command = new ArmadilloProtob.Ethereum.EthCommand();
  const msg = new ArmadilloProtob.Ethereum.EthCommand.EthSignBasicTx();

  msg.setPathList(pathList);
  msg.setSignChainId(true);
  msg.setChainId(chainIdBuffer);
  msg.setNonce(nonceBuffer);
  msg.setGasPrice(gasPriceBuffer);
  msg.setGasLimit(gasLimitBuffer);
  msg.setDstAddr(toBuffer);
  msg.setValue(valueBuffer);
  command.setSignBasicTx(msg);

  const armadillCommand: IArmadilloCommand = {
    commandId: ArmadilloProtob.ETHEREUM_CMDID,
    payload: Buffer.from(command.serializeBinary()),
  };

  const transaction: ITransaction = {
    from: {
      value: from,
      link: Common.getUrlForAddr(req.network, from),
    },
    to: {
      value: to,
      link: Common.getUrlForAddr(req.network, to),
    },
    value: {
      value: req.amount,
    },
    fee: {
      value: Common.convertBaseAmountToNormAmount(fee.toString()),
    },
    nonce: {
      value: `${nonce}`,
    },
  };

  return [armadillCommand, transaction];
}

export function buildSignedTx(
  req: ISignTxRequest,
  preparedTx: IArmadilloCommand,
  walletRsp: IArmadilloResponse,
): string {
  const response = ArmadilloProtob.Ethereum.EthResponse.deserializeBinary(walletRsp.payload);

  const data = response.getSig();
  if (!data) {
    throw Error('invalid wallet response');
  }

  const r = Buffer.from(data.getSigR_asU8());
  const s = Buffer.from(data.getSigS_asU8());

  const command = ArmadilloProtob.Ethereum.EthCommand.deserializeBinary(preparedTx.payload);
  const message = command.getSignBasicTx();
  if (!message) {
    throw Error('invalid command');
  }

  const chainId = Buffer.from(message.getChainId_asU8());
  const nonce = Buffer.from(message.getNonce_asU8());
  const to = Buffer.from(message.getDstAddr_asU8());
  const gasLimit = Buffer.from(message.getGasLimit_asU8());
  const gasPrice = Buffer.from(message.getGasPrice_asU8());
  const value = Buffer.from(message.getValue_asU8());

  const v = Utils.computeV(
    {
      chainId,
      nonce,
      to,
      gasLimit,
      gasPrice,
      value,
      data: Buffer.alloc(0),
    },
    req.fromPubkey,
    {
      r,
      s,
    },
  );

  const rawData = [
    nonce, gasPrice, gasLimit, to,
    value, 0, v, r, s,
  ];
  const rlpData = Utils.rlpEncode(rawData);

  return Utils.hexencode(rlpData, true);
}
