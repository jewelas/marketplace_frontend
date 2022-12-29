// import type { EthereumNetwork } from "../types"
// import { ropstenConfig } from "./ropsten"
// import { rinkebyConfig } from "./rinkeby"
// import { mainnetConfig } from "./mainnet"
//import type { EthereumConfig } from "./type"
import { mumbaiConfig } from "./mumbai"
// import { polygonConfig } from "./polygon"
// import { mumbaiDevConfig } from "./mumbai-dev"
// import { devEthereumConfig } from "./dev"
// import { devDogechainConfig } from "./polygon-dev"
// import { testnetEthereumConfig } from "./testnet"

export const configDictionary = {
    // ropsten: ropstenConfig,
    // rinkeby: rinkebyConfig,
    // mainnet: mainnetConfig,
    mumbai: mumbaiConfig,
    // "mumbai-dev": mumbaiDevConfig,
    // polygon: polygonConfig,
    // "dev-ethereum": devEthereumConfig,
    // "dev-polygon": devDogechainConfig,
    // testnet: testnetEthereumConfig,
}

export const getEthereumConfig = (env) => {
    return configDictionary[env]
}