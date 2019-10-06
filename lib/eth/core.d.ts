import { IArmadilloCommand, IArmadilloResponse, ISignTxRequest, ITransaction, ITransactionSchema } from '../model/currency';
export declare function getBalance(network: string, addr: string): Promise<string>;
export declare function getRecentHistory(network: string, addr: string): Promise<ITransaction[]>;
export declare function getPreparedTxSchema(): ITransactionSchema[];
export declare function prepareCommandSignTx(req: ISignTxRequest): Promise<[IArmadilloCommand, ITransaction]>;
export declare function buildSignedTx(req: ISignTxRequest, preparedTx: IArmadilloCommand, walletRsp: IArmadilloResponse): string;
