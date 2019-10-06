"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertIEtherscanTransaction(tx) {
    let check = true;
    const isInteger = (data) => {
        return typeof data === 'string' && /^[0-9]+$/.test(data);
    };
    check = check && isInteger(tx.blockNumber);
    check = check && isInteger(tx.nonce);
    check = check && isInteger(tx.transactionIndex);
    check = check && isInteger(tx.gas);
    check = check && isInteger(tx.gasPrice);
    check = check && isInteger(tx.cumulativeGasUsed);
    check = check && isInteger(tx.gasUsed);
    check = check && isInteger(tx.confirmations);
    const isHash = (data) => {
        return typeof data === 'string' && /^0x[0-9a-fA-F]{64}$/.test(data);
    };
    check = check && isHash(tx.hash);
    check = check && isHash(tx.blockHash);
    const isAddress = (data) => {
        return typeof data === 'string' && /^0x[0-9a-fA-F]{40}$/.test(data);
    };
    check = check && isAddress(tx.from);
    check = check && isAddress(tx.to);
    check = check && (isAddress(tx.contractAddress) || tx.contractAddress === '');
    const timeStamp = new Date(parseInt(tx.timeStamp, 10) * 1000);
    check = check && typeof tx.timeStamp === 'string' && timeStamp.getFullYear() >= 1970;
    check = check && (tx.isError === '0' || tx.isError === '1');
    check = check && /^0x[0-9a-fA-F]*$/.test(tx.input);
    if (!check) {
        return false;
    }
    return Object.assign(Object.assign({}, tx), { blockNumber: parseInt(tx.blockNumber, 10), timeStamp, nonce: parseInt(tx.nonce, 10), transactionIndex: parseInt(tx.transactionIndex, 10), isError: tx.isError === '1', cumulativeGasUsed: parseInt(tx.cumulativeGasUsed, 10), gasUsed: parseInt(tx.gasUsed, 10), confirmations: parseInt(tx.confirmations, 10) });
}
exports.convertIEtherscanTransaction = convertIEtherscanTransaction;
function convertIEtherscanTokenTransaction(tx) {
    let check = true;
    const isInteger = (data) => {
        return typeof data === 'string' && /^[0-9]+$/.test(data);
    };
    check = check && isInteger(tx.blockNumber);
    check = check && isInteger(tx.nonce);
    check = check && isInteger(tx.gas);
    check = check && isInteger(tx.gasPrice);
    check = check && isInteger(tx.cumulativeGasUsed);
    check = check && isInteger(tx.gasUsed);
    check = check && isInteger(tx.confirmations);
    const isHash = (data) => {
        return typeof data === 'string' && /^0x[0-9a-fA-F]{64}$/.test(data);
    };
    check = check && isHash(tx.hash);
    check = check && isHash(tx.blockHash);
    const isAddress = (data) => {
        return typeof data === 'string' && /^0x[0-9a-fA-F]{40}$/.test(data);
    };
    check = check && isAddress(tx.from);
    check = check && isAddress(tx.to);
    check = check && (isAddress(tx.contractAddress) || tx.contractAddress === '');
    const timeStamp = new Date(parseInt(tx.timeStamp, 10) * 1000);
    check = check && typeof tx.timeStamp === 'string' && timeStamp.getFullYear() >= 1970;
    check = check && typeof tx.tokenName === 'string';
    check = check && typeof tx.tokenSymbol === 'string';
    check = check && typeof tx.tokenDecimal === 'string' && /^[0-9]+$/.test(tx.tokenDecimal);
    if (!check) {
        return false;
    }
    return Object.assign(Object.assign({}, tx), { blockNumber: parseInt(tx.blockNumber, 10), timeStamp, nonce: parseInt(tx.nonce, 10), cumulativeGasUsed: parseInt(tx.cumulativeGasUsed, 10), gasUsed: parseInt(tx.gasUsed, 10), confirmations: parseInt(tx.confirmations, 10), tokenName: tx.tokenName, tokenSymbol: tx.tokenSymbol, tokenDecimal: 18 });
}
exports.convertIEtherscanTokenTransaction = convertIEtherscanTokenTransaction;
