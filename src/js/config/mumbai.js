import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "@rarible/protocol-ethereum-sdk/build/common/id"
import { FEE_CONFIG_URL } from "@rarible/protocol-ethereum-sdk/build/config/common"

export const mumbaiConfig = {
    basePath: "https://localhost:5000/",
    chainId: 568,
    exchange: {
        v1: ZERO_ADDRESS,
        v2: toAddress("0xf6F588e8F40a1169556D9640274868c008214474"),
        openseaV1: ZERO_ADDRESS,
        wrapper: ZERO_ADDRESS,
    },
    transferProxies: {
        nft: toAddress("0x948e07B55db858635dEE1570FF116aBb123eAc74"),
        erc20: toAddress("0x28DC783c801937FdAe36DB13823528e7c072fe56"),
        erc721Lazy: toAddress("0x8C0AA84C71d2A586aF18222726B74Af2B4f39952"),
        erc1155Lazy: toAddress("0x731a03C70d3deBDD96FE2DeC1338F1ac1876a17a"),
        openseaV1: ZERO_ADDRESS,
        cryptoPunks: ZERO_ADDRESS,
    },
    feeConfigUrl: FEE_CONFIG_URL,
    openSea: {
        metadata: id32("RARIBLE"),
        proxyRegistry: ZERO_ADDRESS,
    },
    factories: {
        erc721: toAddress("0x490625A71872b7efb51c5035e45A9B676B6d78A3"),
        erc1155: toAddress("0x671c67a72A0092180840256DbaCFc1294859672d"),
    },
    cryptoPunks: {
        marketContract: ZERO_ADDRESS,
        wrapperContract: ZERO_ADDRESS,
    },
    weth: toAddress("0xbD0cCD660Ef108355c2da082b08ad98C3e9b948F"),
    auction: ZERO_ADDRESS,
}