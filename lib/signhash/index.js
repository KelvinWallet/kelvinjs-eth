"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ArmadilloProtob = __importStar(require("kelvinjs-protob"));
class EthSignHash {
    buildSignHashCommand(index, hashHex) {
        if (!(Number.isInteger(index) && index >= 0 && index <= 0x7FFFFFFF)) {
            throw Error('invalid input account index');
        }
        if (!(hashHex.length === 64 && /^[0-9a-fA-F]*$/.test(hashHex))) {
            throw Error('invalid input hash hex string');
        }
        const msg = new ArmadilloProtob.Ethereum.EthCommand.EthSign32ByteHash();
        msg.setPathList([0x8000002C, 0x8000003C, 0x80000000, 0x00000000, index]);
        msg.setHash(Buffer.from(hashHex, 'hex'));
        const req = new ArmadilloProtob.Ethereum.EthCommand();
        req.setSign32byteHash(msg);
        const walletCmd = {
            commandId: ArmadilloProtob.ETHEREUM_CMDID,
            payload: Buffer.from(req.serializeBinary()),
        };
        return walletCmd;
    }
    parseSignHashResponse(walletRsp) {
        const response = ArmadilloProtob.Ethereum.EthResponse.deserializeBinary(walletRsp.payload);
        const data = response.getSig();
        if (!data) {
            throw Error('invalid wallet response');
        }
        const r = Buffer.from(data.getSigR_asU8());
        const s = Buffer.from(data.getSigS_asU8());
        return r.toString('hex') + s.toString('hex');
    }
}
exports.default = EthSignHash;
