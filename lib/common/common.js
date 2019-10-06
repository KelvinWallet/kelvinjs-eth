"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ArmadilloProtob = __importStar(require("kelvinjs-protob"));
const axios_1 = __importDefault(require("axios"));
const ethUtil = __importStar(require("ethereumjs-util"));
const network_1 = require("../model/network");
const Utils = __importStar(require("./utils"));
const web3_1 = require("./web3");
const web3Utils = web3_1.getWeb3().utils;
function getSupportedNetworks() {
    return [network_1.Networks.MAINNET, network_1.Networks.KOVAN, network_1.Networks.ROPSTEN, network_1.Networks.RINKEBY];
}
exports.getSupportedNetworks = getSupportedNetworks;
function getSupportedNetwork(network) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    return network_1.supportedNetworks[network];
}
exports.getSupportedNetwork = getSupportedNetwork;
function getFeeOptionUnit() {
    return 'Gwei';
}
exports.getFeeOptionUnit = getFeeOptionUnit;
function isValidFeeOption(network, feeOpt) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    try {
        web3Utils.toWei(feeOpt, 'Gwei');
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.isValidFeeOption = isValidFeeOption;
function isValidAddr(network, addr) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (addr.toLowerCase() === addr || addr.slice(2).toUpperCase() === addr.slice(2)) {
        return ethUtil.isValidAddress(addr);
    }
    else {
        return ethUtil.isValidChecksumAddress(addr);
    }
}
exports.isValidAddr = isValidAddr;
function isValidNormAmount(amount) {
    try {
        web3Utils.toWei(amount, 'ether');
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.isValidNormAmount = isValidNormAmount;
function convertNormAmountToBaseAmount(amount) {
    if (isValidNormAmount(amount)) {
        return web3Utils.toWei(amount, 'ether');
    }
    else {
        throw Error('invalid amount');
    }
}
exports.convertNormAmountToBaseAmount = convertNormAmountToBaseAmount;
function convertBaseAmountToNormAmount(amount) {
    try {
        return web3Utils.fromWei(amount, 'ether');
    }
    catch (error) {
        throw Error('invalid amount');
    }
}
exports.convertBaseAmountToNormAmount = convertBaseAmountToNormAmount;
function etherscanUrlOfNetwork(network) {
    const ethNetwork = getSupportedNetwork(network);
    return ethNetwork.etherscanUrl;
}
function getUrlForAddr(network, addr) {
    return `${etherscanUrlOfNetwork(network)}/address/${addr.toLowerCase()}`;
}
exports.getUrlForAddr = getUrlForAddr;
function getUrlForTx(network, txid) {
    return `${etherscanUrlOfNetwork(network)}/tx/${txid.toLowerCase()}`;
}
exports.getUrlForTx = getUrlForTx;
function encodePubkeyToAddr(network, pubkey) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!/^04[0-9a-fA-F]{128}$/.test(pubkey)) {
        throw Error('invalid uncompressed public key');
    }
    const buffer = Utils.toSafeBuffer(pubkey);
    const publicKey = ethUtil.importPublic(buffer);
    const addressBuffer = ethUtil.pubToAddress(publicKey);
    const address = ethUtil.toChecksumAddress(Utils.hexencode(addressBuffer, true));
    return address;
}
exports.encodePubkeyToAddr = encodePubkeyToAddr;
async function getFeeOptions(network) {
    const ethNetwork = getSupportedNetwork(network);
    if (network === network_1.Networks.MAINNET) {
        const response = await axios_1.default.get('https://ethgasstation.info/json/ethgasAPI.json');
        return [`${response.data.fastest}`, `${response.data.fast}`, `${response.data.safeLow}`];
    }
    const web3 = web3_1.getWeb3(ethNetwork);
    const price = await web3.eth.getGasPrice();
    return [web3.utils.fromWei(price, 'Gwei')];
}
exports.getFeeOptions = getFeeOptions;
function getHistorySchema() {
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
exports.getHistorySchema = getHistorySchema;
async function submitTransaction(network, signedTx) {
    const ethNetwork = getSupportedNetwork(network);
    const web3 = web3_1.getWeb3(ethNetwork);
    const provider = web3.currentProvider;
    const result = await provider.send('eth_sendRawTransaction', [signedTx]);
    return result;
}
exports.submitTransaction = submitTransaction;
function prepareCommandGetPubkey(network, accountIndex) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    const req = new ArmadilloProtob.Ethereum.EthCommand();
    const msg = new ArmadilloProtob.Ethereum.EthCommand.EthGetXPub();
    const pathList = Utils.getAccountPath(accountIndex);
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
exports.prepareCommandGetPubkey = prepareCommandGetPubkey;
function parsePubkeyResponse(walletRsp) {
    const response = ArmadilloProtob.Ethereum.EthResponse.deserializeBinary(walletRsp.payload);
    const data = response.getXpub();
    if (!data) {
        throw Error('invalid wallet response');
    }
    const publicKey = Buffer.concat([
        Buffer.from([0x04]),
        Buffer.from(data.getXpub_asU8().slice(0, 64)),
    ]);
    return publicKey.toString('hex');
}
exports.parsePubkeyResponse = parsePubkeyResponse;
function prepareCommandShowAddr(network, accountIndex) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    const req = new ArmadilloProtob.Ethereum.EthCommand();
    const msg = new ArmadilloProtob.Ethereum.EthCommand.EthShowAddr();
    const pathList = Utils.getAccountPath(accountIndex);
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
exports.prepareCommandShowAddr = prepareCommandShowAddr;
