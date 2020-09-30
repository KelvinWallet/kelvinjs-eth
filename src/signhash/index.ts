import * as ArmadilloProtob from 'kelvinjs-protob';
import {
  IArmadilloCommand,
  IArmadilloResponse,
} from '../model/currency';

/**
 * This class provides the utility functions for requesting KelvinWallet to
 * generate a secp256k1 ECDSA signature on an already hashed 32-byte data.
 * You can choose any BIP-32 path of the form 44'/60'/0'/0/x to generate key.
 * KelvinWallet will print the 32-byte hash hex string on hardware display.
 */
export default class EthSignHash {

  /**
   * Build a command object for KelvinWallet to sign a raw hash.
   *
   * @param index - specify the number x in the BIP32 path 44'/60'/0'/0/x
   * @param hashHex - specify hex string of the 32-byte message digest to sign
   *                  (you shall hash your data with SHA-256, Keccak-256, or
   *                  SHA-3 first)
   *
   * @returns - the command object for KelvinWallet
   */
  public buildSignHashCommand(index: number, hashHex: string): IArmadilloCommand {

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

  /**
   * Parse a response object from KelvinWallet after signing a raw hash.
   *
   * @param walletRsp - the response object from KelvinWallet
   *
   * @returns - hex string of the 64-byte ECDSA secp256k1 signature
   */
  public parseSignHashResponse(walletRsp: IArmadilloResponse): string {
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
