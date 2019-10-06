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
import { IToken } from '../model/token';
import {
  convertIEtherscanTokenTransaction,
  IEtherscanTokenTransaction,
  IEtherscanTokenTransactionInput,
} from '../model/transaction';

// tslint:disable:max-line-length
export const ERC20_ABI = JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]');
// tslint:enable:max-line-length

export async function getBalance(network: string, token: IToken, addr: string): Promise<string> {
  const ethNetwork: IEthereumNetwork = Common.getSupportedNetwork(network);
  const web3 = getWeb3(ethNetwork);

  const contract = new web3.eth.Contract(ERC20_ABI, token.address);
  const balanceBN: BigNumber | null = await contract.methods.balanceOf(addr).call();

  // TODO: FIXME: Convert to normal unit (ETH rather than Wei) before return
  return !!balanceBN && balanceBN.toString() || '0';
}

export async function getRecentHistory(network: string, token: IToken, addr: string): Promise<ITransaction[]> {
  const ethNetwork: IEthereumNetwork = Common.getSupportedNetwork(network);
  const resp = await axios(ethNetwork.etherscanAPI, {
    params: {
      module: 'account',
      action: 'tokentx',
      address: addr,
      sort: 'desc',
    },
  });

  if (resp.status !== 200 || resp.data.status !== '1' || !(resp.data.result instanceof Array)) {
    throw Error(resp.data.message);
  }

  const rawTxList: IEtherscanTokenTransactionInput[] = resp.data.result;
  let safeTxList = rawTxList.map<IEtherscanTokenTransaction>((tx) => {
    const result = convertIEtherscanTokenTransaction(tx);
    if (result) {
      return result;
    }

    throw Error('invalid data');
  });
  safeTxList = safeTxList.filter((item) => item.contractAddress.toLowerCase() === token.address.toLowerCase());

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
      key: 'token',
      format: 'address',
      label: 'Token Address',
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

export async function prepareCommandSignTx(
  req: ISignTxRequest, token: IToken,
): Promise<[IArmadilloCommand, ITransaction]> {
  const ethNetwork = Common.getSupportedNetwork(req.network);
  const web3 = getWeb3(ethNetwork);
  const contract = new web3.eth.Contract(ERC20_ABI, token.address);

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
  const tokenAddr = ethUtil.toChecksumAddress(token.address);
  const to = ethUtil.toChecksumAddress(req.toAddr);
  const nonce = await web3.eth.getTransactionCount(from);
  const value = Common.convertNormAmountToBaseAmount(req.amount);
  const gasLimit = await web3.eth.estimateGas({
    from,
    to: token.address,
    data: contract.methods.transfer(to, value).encodeABI(),
  });
  const gasPrice = web3.utils.toWei(req.feeOpt, 'Gwei');
  const fee = new BigNumber(gasLimit).mul(new BigNumber(gasPrice));

  const toBuffer = Utils.toSafeBuffer(req.toAddr);
  const tokenAddrBuffer = Utils.toSafeBuffer(tokenAddr);
  const chainIdBuffer = Utils.toSafeBuffer(ethNetwork.chainId);
  const nonceBuffer = Utils.toSafeBuffer(nonce);
  const gasLimitBuffer = Utils.toSafeBuffer(gasLimit);
  const gasPriceBuffer = Utils.toSafeBuffer(gasPrice);
  const valueBuffer = Utils.toSafeBuffer(value);

  const pathList: number[] = Utils.getAccountPath(req.accountIndex);

  if (
    pathList.length !== 5
    || tokenAddrBuffer.length !== 20
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
  const msg = new ArmadilloProtob.Ethereum.EthCommand.EthSignERC20Tx();

  msg.setPathList(pathList);
  msg.setSignChainId(true);
  msg.setChainId(chainIdBuffer);
  msg.setNonce(nonceBuffer);
  msg.setGasPrice(gasPriceBuffer);
  msg.setGasLimit(gasLimitBuffer);
  msg.setTokenAddr(tokenAddrBuffer);
  msg.setRecipientAddr(toBuffer);
  msg.setAmount(valueBuffer);
  command.setSignErc20Tx(msg);

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
    token: {
      value: tokenAddr,
      link: Common.getUrlForAddr(req.network, tokenAddr),
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
  token: IToken,
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
  const message = command.getSignErc20Tx();
  if (!message) {
    throw Error('invalid command');
  }

  const chainId = Buffer.from(message.getChainId_asU8());
  const nonce = Buffer.from(message.getNonce_asU8());
  const to = Buffer.from(message.getRecipientAddr_asU8());
  const gasLimit = Buffer.from(message.getGasLimit_asU8());
  const gasPrice = Buffer.from(message.getGasPrice_asU8());
  const value = Buffer.from(message.getAmount_asU8());
  const tokenAddr = Buffer.from(message.getTokenAddr_asU8());

  const ethNetwork = Common.getSupportedNetwork(req.network);
  const web3 = getWeb3(ethNetwork);
  const contract = new web3.eth.Contract(ERC20_ABI, token.address);
  const dataBuffer = Utils.hexdecode(
    contract.methods.transfer(Utils.hexencode(to, true), Utils.hexencode(value, true)).encodeABI(),
  );

  const v = Utils.computeV(
    {
      chainId,
      nonce,
      to: tokenAddr,
      gasLimit,
      gasPrice,
      value: Buffer.alloc(0),
      data: dataBuffer,
    },
    req.fromPubkey,
    {
      r,
      s,
    },
  );

  const rawData = [
    nonce, gasPrice, gasLimit, tokenAddr,
    0, dataBuffer, v, r, s,
  ];
  const rlpData = Utils.rlpEncode(rawData);

  return Utils.hexencode(rlpData, true);
}
