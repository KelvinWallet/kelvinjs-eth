"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Networks;
(function (Networks) {
    Networks["MAINNET"] = "mainnet";
    Networks["KOVAN"] = "kovan";
    Networks["ROPSTEN"] = "ropsten";
    Networks["RINKEBY"] = "rinkeby";
})(Networks = exports.Networks || (exports.Networks = {}));
exports.supportedNetworks = {
    [Networks.MAINNET]: {
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/4e1102167eca4ec493d0e4f33ec12a6c',
        etherscanAPI: 'https://api.etherscan.io/api',
        etherscanUrl: 'https://etherscan.io',
    },
    [Networks.ROPSTEN]: {
        chainId: 3,
        rpcUrl: 'https://ropsten.infura.io/v3/4e1102167eca4ec493d0e4f33ec12a6c',
        etherscanAPI: 'https://api-ropsten.etherscan.io/api',
        etherscanUrl: 'https://ropsten.etherscan.io',
    },
    [Networks.RINKEBY]: {
        chainId: 4,
        rpcUrl: 'https://rinkeby.infura.io/v3/4e1102167eca4ec493d0e4f33ec12a6c',
        etherscanAPI: 'https://api-rinkeby.etherscan.io/api',
        etherscanUrl: 'https://rinkeby.etherscan.io',
    },
    [Networks.KOVAN]: {
        chainId: 42,
        rpcUrl: 'https://kovan.infura.io/v3/4e1102167eca4ec493d0e4f33ec12a6c',
        etherscanAPI: 'https://api-kovan.etherscan.io/api',
        etherscanUrl: 'https://kovan.etherscan.io',
    },
};
