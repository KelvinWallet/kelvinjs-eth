import { IArmadilloCommand, IArmadilloResponse, ISignTxRequest, ITransaction, ITransactionSchema } from '../model/currency';
import { IToken } from '../model/token';
export declare const ERC20_ABI: any;
export declare function getBalance(network: string, token: IToken, addr: string): Promise<string>;
export declare function getRecentHistory(network: string, token: IToken, addr: string): Promise<ITransaction[]>;
export declare function getPreparedTxSchema(): ITransactionSchema[];
export declare function prepareCommandSignTx(req: ISignTxRequest, token: IToken): Promise<[IArmadilloCommand, ITransaction]>;
export declare function buildSignedTx(req: ISignTxRequest, token: IToken, preparedTx: IArmadilloCommand, walletRsp: IArmadilloResponse): string;
