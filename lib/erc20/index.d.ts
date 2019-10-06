import { IArmadilloCommand, IArmadilloResponse, ICurrencyUtil, ISignTxRequest, ITransaction, ITransactionSchema } from '../model/currency';
import { IToken } from '../model/token';
export default class ERC20 implements ICurrencyUtil {
    token: IToken | false;
    getSupportedNetworks(): string[];
    getFeeOptionUnit(): string;
    isValidFeeOption(network: string, feeOpt: string): boolean;
    isValidAddr(network: string, addr: string): boolean;
    isValidNormAmount(amount: string): boolean;
    convertNormAmountToBaseAmount(amount: string): string;
    convertBaseAmountToNormAmount(amount: string): string;
    getUrlForAddr(network: string, addr: string): string;
    getUrlForTx(network: string, txid: string): string;
    encodePubkeyToAddr(network: string, pubkey: string): string;
    getBalance(network: string, addr: string): Promise<string>;
    getHistorySchema(): ITransactionSchema[];
    getRecentHistory(network: string, addr: string): Promise<ITransaction[]>;
    getFeeOptions(network: string): Promise<string[]>;
    getPreparedTxSchema(): ITransactionSchema[];
    prepareCommandSignTx(req: ISignTxRequest): Promise<[IArmadilloCommand, ITransaction]>;
    buildSignedTx(req: ISignTxRequest, preparedTx: IArmadilloCommand, walletRsp: IArmadilloResponse): string;
    submitTransaction(network: string, signedTx: string): Promise<string>;
    prepareCommandGetPubkey(network: string, accountIndex: number): IArmadilloCommand;
    parsePubkeyResponse(walletRsp: IArmadilloResponse): string;
    prepareCommandShowAddr(network: string, accountIndex: number): IArmadilloCommand;
}
