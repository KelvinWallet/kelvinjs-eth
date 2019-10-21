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
const utils_1 = require("ethers/utils");
const Common = __importStar(require("../common/common"));
const Utils = __importStar(require("../common/utils"));
const web3_1 = require("../common/web3");
const transaction_1 = require("../model/transaction");
async function getBalance(network, addr) {
    const ethNetwork = Common.getSupportedNetwork(network);
    const web3 = web3_1.getWeb3(ethNetwork);
    const balanceInBaseUnit = await web3.eth.getBalance(addr);
    const balanceInNormUnit = Common.convertBaseAmountToNormAmount(balanceInBaseUnit);
    return balanceInNormUnit;
}
exports.getBalance = getBalance;
async function getRecentHistory(network, addr) {
    const ethNetwork = Common.getSupportedNetwork(network);
    const resp = await axios_1.default(ethNetwork.etherscanAPI, {
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
    const rawTxList = resp.data.result;
    const safeTxList = rawTxList.map((tx) => {
        const result = transaction_1.convertIEtherscanTransaction(tx);
        if (result) {
            return result;
        }
        throw Error('invalid data');
    });
    return safeTxList.map((tx) => {
        const gas = new utils_1.BigNumber(tx.gas);
        const gasPrice = new utils_1.BigNumber(tx.gasPrice);
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
exports.getRecentHistory = getRecentHistory;
function getPreparedTxSchema() {
    return [
        {
            key: 'from',
            format: 'address',
            label: 'From Address',
        },
        {
            key: 'value',
            format: 'value',
            label: 'Value',
        },
        {
            key: 'to',
            format: 'address',
            label: 'To Address',
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
exports.getPreparedTxSchema = getPreparedTxSchema;
async function prepareCommandSignTx(req) {
    const ethNetwork = Common.getSupportedNetwork(req.network);
    const web3 = web3_1.getWeb3(ethNetwork);
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
    if (from === to) {
        throw Error('sending funds back to the same address is prohibited');
    }
    const nonce = await web3.eth.getTransactionCount(from);
    const value = Common.convertNormAmountToBaseAmount(req.amount);
    const gasLimit = await web3.eth.estimateGas({
        from,
        to,
        value,
    });
    const gasPrice = web3.utils.toWei(req.feeOpt, 'Gwei');
    const fee = new utils_1.BigNumber(gasLimit).mul(new utils_1.BigNumber(gasPrice));
    const toBuffer = Utils.toSafeBuffer(req.toAddr);
    const chainIdBuffer = Utils.toSafeBuffer(ethNetwork.chainId);
    const nonceBuffer = Utils.toSafeBuffer(nonce);
    const gasLimitBuffer = Utils.toSafeBuffer(gasLimit);
    const gasPriceBuffer = Utils.toSafeBuffer(gasPrice);
    const valueBuffer = Utils.toSafeBuffer(value);
    const pathList = Utils.getAccountPath(req.accountIndex);
    if (pathList.length !== 5
        || toBuffer.length !== 20
        || chainIdBuffer.length > 4
        || nonceBuffer.length > 32
        || gasLimitBuffer.length > 32
        || gasPriceBuffer.length > 32
        || valueBuffer.length > 32) {
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
    const armadillCommand = {
        commandId: ArmadilloProtob.ETHEREUM_CMDID,
        payload: Buffer.from(command.serializeBinary()),
    };
    const transaction = {
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
exports.prepareCommandSignTx = prepareCommandSignTx;
function buildSignedTx(req, preparedTx, walletRsp) {
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
    const v = Utils.computeV({
        chainId,
        nonce,
        to,
        gasLimit,
        gasPrice,
        value,
        data: Buffer.alloc(0),
    }, req.fromPubkey, {
        r,
        s,
    });
    const rawData = [
        nonce, gasPrice, gasLimit, to,
        value, 0, v, r, s,
    ];
    const rlpData = Utils.rlpEncode(rawData);
    return Utils.hexencode(rlpData, true);
}
exports.buildSignedTx = buildSignedTx;
