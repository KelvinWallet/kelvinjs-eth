"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Common = __importStar(require("../common/common"));
const Core = __importStar(require("./core"));
class ERC20 {
    constructor() {
        this.token = false;
    }
    getSupportedNetworks() {
        return Common.getSupportedNetworks();
    }
    getFeeOptionUnit() {
        return Common.getFeeOptionUnit();
    }
    isValidFeeOption(network, feeOpt) {
        return Common.isValidFeeOption(network, feeOpt);
    }
    isValidAddr(network, addr) {
        return Common.isValidAddr(network, addr);
    }
    isValidNormAmount(amount) {
        return Common.isValidNormAmount(amount);
    }
    convertNormAmountToBaseAmount(amount) {
        return Common.convertNormAmountToBaseAmount(amount);
    }
    convertBaseAmountToNormAmount(amount) {
        return Common.convertBaseAmountToNormAmount(amount);
    }
    getUrlForAddr(network, addr) {
        return Common.getUrlForAddr(network, addr);
    }
    getUrlForTx(network, txid) {
        return Common.getUrlForTx(network, txid);
    }
    encodePubkeyToAddr(network, pubkey) {
        return Common.encodePubkeyToAddr(network, pubkey);
    }
    getBalance(network, addr) {
        if (!this.token) {
            throw Error('token not correctly initialized');
        }
        return Core.getBalance(network, this.token, addr);
    }
    getHistorySchema() {
        return Common.getHistorySchema();
    }
    getRecentHistory(network, addr) {
        if (!this.token) {
            throw Error('token not correctly initialized');
        }
        return Core.getRecentHistory(network, this.token, addr);
    }
    getFeeOptions(network) {
        return Common.getFeeOptions(network);
    }
    getPreparedTxSchema() {
        return Core.getPreparedTxSchema();
    }
    prepareCommandSignTx(req) {
        if (!this.token) {
            throw Error('token not correctly initialized');
        }
        return Core.prepareCommandSignTx(req, this.token);
    }
    buildSignedTx(req, preparedTx, walletRsp) {
        if (!this.token) {
            throw Error('token not correctly initialized');
        }
        return Core.buildSignedTx(req, this.token, preparedTx, walletRsp);
    }
    submitTransaction(network, signedTx) {
        return Common.submitTransaction(network, signedTx);
    }
    prepareCommandGetPubkey(network, accountIndex) {
        return Common.prepareCommandGetPubkey(network, accountIndex);
    }
    parsePubkeyResponse(walletRsp) {
        return Common.parsePubkeyResponse(walletRsp);
    }
    prepareCommandShowAddr(network, accountIndex) {
        return Common.prepareCommandShowAddr(network, accountIndex);
    }
}
exports.default = ERC20;
