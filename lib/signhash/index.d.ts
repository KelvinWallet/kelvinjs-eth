import { IArmadilloCommand, IArmadilloResponse } from '../model/currency';
export default class EthSignHash {
    buildSignHashCommand(index: number, hashHex: string): IArmadilloCommand;
    parseSignHashResponse(walletRsp: IArmadilloResponse): string;
}
