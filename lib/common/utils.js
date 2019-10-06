"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethUtil = __importStar(require("ethereumjs-util"));
const utils_1 = require("ethers/utils");
const rlp = __importStar(require("rlp"));
function getAccountPath(index) {
    return [0x8000002C, 0x8000003C, 0x80000000, 0, index];
}
exports.getAccountPath = getAccountPath;
function toSafeBuffer(value) {
    let result;
    if (typeof value === 'string') {
        if (!/^(0x)?([0-9a-fA-F]+)?$/.test(value)) {
            throw Error(`invalid string: "${value}"`);
        }
        if (/^[0-9]+$/.test(value)) {
            const bigNumber = new utils_1.BigNumber(value);
            result = hexdecode(bigNumber.toHexString());
        }
        else {
            result = hexdecode(value);
        }
    }
    else if (typeof value === 'number') {
        if (value < 0 || Math.floor(value) !== value) {
            throw Error(`invalid number: ${value}, only accept uint`);
        }
        const byteLength = Math.max(1, Math.ceil(Math.log2(value) / 8));
        result = Buffer.alloc(byteLength);
        result.writeUIntBE(value, 0, byteLength);
    }
    else if (value instanceof Buffer) {
        result = value;
    }
    else if (value instanceof utils_1.BigNumber) {
        result = ethUtil.toBuffer(value.toHexString());
    }
    else if (typeof value === 'undefined') {
        result = Buffer.alloc(0);
    }
    else {
        throw Error(`invalid type ${typeof value}`);
    }
    while (result[0] === 0) {
        result = result.slice(1);
    }
    return result;
}
exports.toSafeBuffer = toSafeBuffer;
function hexencode(arr, addHexPrefix = false) {
    if (!(arr instanceof Uint8Array || arr instanceof Array)) {
        throw new Error('input type error');
    }
    const uint8Array = new Uint8Array(arr);
    const buffer = Buffer.from(uint8Array);
    if (addHexPrefix) {
        return ethUtil.addHexPrefix(buffer.toString('hex'));
    }
    else {
        return buffer.toString('hex');
    }
}
exports.hexencode = hexencode;
function hexdecode(hexstring) {
    const str = ethUtil.addHexPrefix(hexstring);
    return ethUtil.toBuffer(str);
}
exports.hexdecode = hexdecode;
function rlpEncode(data) {
    const rawData = data.map((value) => toSafeBuffer(value));
    return toSafeBuffer(rlp.encode(rawData).toString('hex'));
}
exports.rlpEncode = rlpEncode;
function computeV(tx, publicKey, signature) {
    const hash = ethUtil.keccak256(rlpEncode([
        tx.nonce,
        tx.gasPrice,
        tx.gasLimit,
        tx.to,
        tx.value,
        tx.data,
        tx.chainId,
        0,
        0,
    ]));
    const publicKeyV27 = ethUtil.ecrecover(hash, 27, signature.r, signature.s);
    const publicKeyV28 = ethUtil.ecrecover(hash, 28, signature.r, signature.s);
    let v;
    if (`04${publicKeyV27.toString('hex')}` === publicKey.toLowerCase()) {
        v = 27;
    }
    else if (`04${publicKeyV28.toString('hex')}` === publicKey.toLowerCase()) {
        v = 28;
    }
    else {
        throw Error('invalid signature');
    }
    const chainIdNumber = tx.chainId.readUIntBE(0, tx.chainId.length);
    v += chainIdNumber * 2 + 8;
    return v;
}
exports.computeV = computeV;
