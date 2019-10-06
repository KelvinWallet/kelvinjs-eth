import * as Common from '../common/common';
import {
  IArmadilloCommand,
  IArmadilloResponse,
  ICurrencyUtil,
  ISignTxRequest,
  ITransaction,
  ITransactionSchema,
} from '../model/currency';
import { IToken } from '../model/token';
import * as Core from './core';

export default class ERC20 implements ICurrencyUtil {
  public token: IToken | false = false;

  public getSupportedNetworks(): string[] {
    return Common.getSupportedNetworks();
  }

  public getFeeOptionUnit(): string {
    return Common.getFeeOptionUnit();
  }

  public isValidFeeOption(network: string, feeOpt: string): boolean {
    return Common.isValidFeeOption(network, feeOpt);
  }

  public isValidAddr(network: string, addr: string): boolean {
    return Common.isValidAddr(network, addr);
  }

  public isValidNormAmount(amount: string): boolean {
    return Common.isValidNormAmount(amount);
  }

  public convertNormAmountToBaseAmount(amount: string): string {
    return Common.convertNormAmountToBaseAmount(amount);
  }

  public convertBaseAmountToNormAmount(amount: string): string {
    return Common.convertBaseAmountToNormAmount(amount);
  }

  public getUrlForAddr(network: string, addr: string): string {
    return Common.getUrlForAddr(network, addr);
  }

  public getUrlForTx(network: string, txid: string): string {
    return Common.getUrlForTx(network, txid);
  }

  public encodePubkeyToAddr(network: string, pubkey: string): string {
    return Common.encodePubkeyToAddr(network, pubkey);
  }

  public getBalance(network: string, addr: string): Promise<string> {
    if (!this.token) {
      throw Error('token not correctly initialized');
    }

    return Core.getBalance(network, this.token, addr);
  }

  public getHistorySchema(): ITransactionSchema[] {
    return Common.getHistorySchema();
  }

  public getRecentHistory(network: string, addr: string): Promise<ITransaction[]> {
    if (!this.token) {
      throw Error('token not correctly initialized');
    }

    return Core.getRecentHistory(network, this.token, addr);
  }

  public getFeeOptions(network: string): Promise<string[]> {
    return Common.getFeeOptions(network);
  }

  public getPreparedTxSchema(): ITransactionSchema[] {
    return Core.getPreparedTxSchema();
  }

  public prepareCommandSignTx(req: ISignTxRequest): Promise<[IArmadilloCommand, ITransaction]> {
    if (!this.token) {
      throw Error('token not correctly initialized');
    }

    return Core.prepareCommandSignTx(req, this.token);
  }

  public buildSignedTx(req: ISignTxRequest, preparedTx: IArmadilloCommand, walletRsp: IArmadilloResponse): string {
    if (!this.token) {
      throw Error('token not correctly initialized');
    }

    return Core.buildSignedTx(req, this.token, preparedTx, walletRsp);
  }

  public submitTransaction(network: string, signedTx: string): Promise<string> {
    return Common.submitTransaction(network, signedTx);
  }

  public prepareCommandGetPubkey(network: string, accountIndex: number): IArmadilloCommand {
    return Common.prepareCommandGetPubkey(network, accountIndex);
  }

  public parsePubkeyResponse(walletRsp: IArmadilloResponse): string {
    return Common.parsePubkeyResponse(walletRsp);
  }

  public prepareCommandShowAddr(network: string, accountIndex: number): IArmadilloCommand {
    return Common.prepareCommandShowAddr(network, accountIndex);
  }
}
