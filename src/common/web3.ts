// FIXME
//
//  Warning!  The TypeScript declaration file that come with `web3` version
//  `1.0.0-beta.55` is incorrect.  The declaration is inconsistent with the
//  actual implementation.
//
//  Because the main CommonJS module provided by package `web3@1.0.0-beta.55`
//  does not have a `default` export at all, default imports will fail:
//
//          import Web3 from 'web3';
//          // or
//          import { default as Web3 } from 'web3';
//
//  The "correct" way to import such CommonJS module in TypeScript is:
//
//          import Web3 = require('web3');
//
//  And the "correct" way to declare such module is
//
//          declare class Web3 { ... }
//          export = Web3;
//
//  as shown in:
//
//  - https://github.com/ethereum/web3.js/blob/380642fe4004a311e7f26d10c18d5d2623994011/packages/web3/index.d.ts
//  - https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
//
//  Related issues on GitHub:
//
//  - https://github.com/ethereum/web3.js/issues/3070
//  - https://github.com/ethereum/web3.js/issues/1658
//  - https://github.com/ethereum/web3.js/issues/1597
//
//  We should not be forced to use ugly workarounds like esModuleInterop and
//  allowSyntheticDefaultImports.
//
import Web3 from 'web3';

import { HttpProvider } from 'web3-providers';

import { IEthereumNetwork, Networks, supportedNetworks } from '../model/network';

const httpProvider = new HttpProvider(supportedNetworks[Networks.MAINNET].rpcUrl);
const web3 = new Web3(httpProvider);

export function getWeb3(network: IEthereumNetwork = supportedNetworks[Networks.MAINNET]): Web3 {
  httpProvider.host = network.rpcUrl;
  return web3;
}
