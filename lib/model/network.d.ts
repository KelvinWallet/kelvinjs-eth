export declare enum Networks {
    MAINNET = "mainnet",
    KOVAN = "kovan",
    ROPSTEN = "ropsten",
    RINKEBY = "rinkeby"
}
export interface IEthereumNetwork {
    chainId: number;
    rpcUrl: string;
    etherscanUrl: string;
    etherscanAPI: string;
}
export declare const supportedNetworks: {
    [network: string]: IEthereumNetwork;
};
