import ERC721_Factory from './ERC721_Factory.json'
import ERC1155_Factory from './ERC1155_Factory.json'
import ERC721_Asset from './ERC721_Asset.json'
import ERC1155_Asset from './ERC1155_Asset.json'
import Transfer_Proxy from './Transfer_Proxy.json'
import ERC721RaribleMinimal_ from './ERC721RaribleMinimal.json'
import ERC1155RaribleMinimal_ from './ERC1155RaribleMinimal.json'
import ExternalRoyalties_ABI from './ExternalRoyalties_ABI.json'
import Exchange_ABI from './Exchange_ABI.json'
import WETH_9 from './WETH_9.json'
import ERC165_ABI from './ERC165_ABI.json'

export const Factory721 = {
    address: "0x490625A71872b7efb51c5035e45A9B676B6d78A3",
    abi: ERC721_Factory
}

export const Factory1155 = {
    address: "0x671c67a72A0092180840256DbaCFc1294859672d",
    abi: ERC1155_Factory
}

export const Asset721 = {
    address: "0xEd42426d45Ae80e6068Af77813F0A7eC5443dB07",
    abi: ERC721_Asset
}

export const Asset1155 = {
    address: "0x5DFE0C144d8CB6e4A015aDA6cAB875315018E820",
    abi: ERC1155_Asset
}

export const NFTTransferProxy = {
    address: "0x948e07B55db858635dEE1570FF116aBb123eAc74",
    abi: Transfer_Proxy
}

export const Exchange = {
    address: "0xf6F588e8F40a1169556D9640274868c008214474",
    abi: Exchange_ABI
}

export const ExternalRoyalties = {
    address: "0xEb0FCd289BC2A2F9a0084CA6602560d47A6bE3D2",
    abi: ExternalRoyalties_ABI
}

export const ERC721RaribleMinimal = {
    abi: ERC721RaribleMinimal_
}

export const ERC1155RaribleMinimal = {
    abi: ERC1155RaribleMinimal_
}

export const WETH9 = {
    address: "0xbD0cCD660Ef108355c2da082b08ad98C3e9b948F",
    abi: WETH_9
}

export const ERC165 = {
    abi: ERC165_ABI
}