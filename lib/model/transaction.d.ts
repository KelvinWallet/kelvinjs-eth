/// <reference types="node" />
export interface IEthereumTransaction {
    nonce: Buffer;
    chainId: Buffer;
    to: Buffer;
    value: Buffer;
    data: Buffer;
    gasLimit: Buffer;
    gasPrice: Buffer;
}
export interface ISignResponse {
    r: Buffer;
    s: Buffer;
}
export interface IEtherscanTransactionInput {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
}
export interface IEtherscanTransaction {
    blockNumber: number;
    timeStamp: Date;
    hash: string;
    nonce: number;
    blockHash: string;
    transactionIndex: number;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: boolean;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    confirmations: number;
}
export interface IEtherscanTokenTransactionInput {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
    tokenDecimal: string;
    tokenName: string;
    tokenSymbol: string;
}
export interface IEtherscanTokenTransaction {
    blockNumber: number;
    timeStamp: Date;
    hash: string;
    nonce: number;
    blockHash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    contractAddress: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    confirmations: number;
    tokenDecimal: number;
    tokenName: string;
    tokenSymbol: string;
}
export declare function convertIEtherscanTransaction(tx: IEtherscanTransactionInput): IEtherscanTransaction | false;
export declare function convertIEtherscanTokenTransaction(tx: IEtherscanTokenTransactionInput): IEtherscanTokenTransaction | false;
