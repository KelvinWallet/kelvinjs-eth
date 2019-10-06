"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const web3_providers_1 = require("web3-providers");
const network_1 = require("../model/network");
const httpProvider = new web3_providers_1.HttpProvider(network_1.supportedNetworks[network_1.Networks.MAINNET].rpcUrl);
const web3 = new web3_1.default(httpProvider);
function getWeb3(network = network_1.supportedNetworks[network_1.Networks.MAINNET]) {
    httpProvider.host = network.rpcUrl;
    return web3;
}
exports.getWeb3 = getWeb3;
