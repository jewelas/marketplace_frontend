import { getNftCollectionByIdRaw } from '../apis/collection'
import { getNftItemByIdRaw } from '../apis/item'
import { toBigNumber } from '@rarible/types'
import { WETH9 } from '../../interface/contracts'

export const checkAssetType = async (asset) => {
    if ("assetClass" in asset) {
        return asset
    } else {
        const collectionResponse = await getNftCollectionByIdRaw({ collection: asset.contract })
        if (collectionResponse.status === 200) {
            switch (collectionResponse.value.type) {
                case "ERC721":
                case "ERC1155": {
                    return {
                        ...asset,
                        tokenId: toBigNumber(`${asset.tokenId}`),
                        assetClass: collectionResponse.value.type,
                    }
                }
                case "CRYPTO_PUNKS": {
                    return {
                        assetClass: "CRYPTO_PUNKS",
                        contract: asset.contract,
                        tokenId: parseInt(`${asset.tokenId}`),
                    }
                }
                default: {
                    throw new Error(`Unrecognized collection asset class ${collectionResponse.value.type}`)
                }
            }
        } else {
            throw new Error(`Can't get info of NFT collection with id ${asset.contract}`)
        }
    }
}

export const checkLazyAsset = async (asset) => {
    return {
        assetType: await checkLazyAssetType(asset.assetType),
        value: asset.value,
    }
}


export const checkLazyAssetType = async (type) => {
    switch (type.assetClass) {
        case "ERC1155":
        case "ERC721": {
            const itemResponse = await getNftItemByIdRaw({ itemId: `${type.contract}:${type.tokenId}` })
            if (itemResponse.status === 200 && itemResponse.value.lazySupply === "0") {
                return type
            }
            const lazyResponse = await getNftLazyItemByIdRaw({ itemId: `${type.contract}:${type.tokenId}` })
            if (lazyResponse.status === 200) {
                const lazy = lazyResponse.value
                switch (lazy["@type"]) {
                    case "ERC721": {
                        return {
                            ...lazy,
                            assetClass: "ERC721_LAZY",
                        }
                    }
                    case "ERC1155": {
                        return {
                            ...lazy,
                            assetClass: "ERC1155_LAZY",
                        }
                    }
                    default: return type
                }
            }
            return type
        }
        default: return type
    }
}

export const isLazyAsset = (x) => {
    return x.assetClass === "ERC1155_LAZY" || x.assetClass === "ERC721_LAZY"
}

export const checkLazyMakeAsset = async (asset, maker) => {
    const make = await checkLazyAsset(asset)
    if (isLazyAsset(make.assetType) && make.assetType.creators[0].account === maker) {
        return make
    }
    return asset
}

export const checkLazyOrder = async (form) => {
    const make = await checkLazyMakeAsset(form.make, form.maker)
    const take = await checkLazyAsset(form.take)
    return {
        ...form,
        make,
        take,
    }
}

export const approve = async (ethereum, config, owner, asset, infinite = true) => {
    switch (asset.assetType.assetClass) {
        case "ERC20": {
            const contract = asset.assetType.contract
            const operator = config.erc20
            return approveErc20(ethereum, contract, owner, operator, asset.value, infinite)
        }
        case "ERC721": {
            const contract = asset.assetType.contract
            const operator = config.nft
            return approveErc721(ethereum, send, contract, owner, operator)
        }
        case "ERC1155": {
            const contract = asset.assetType.contract
            const operator = config.nft
            return approveErc1155(ethereum, send, contract, owner, operator)
        }
        case "ERC721_LAZY":
            const contract = asset.assetType.contract
            const operator = config.erc721Lazy
            return approveErc721(ethereum, send, contract, owner, operator)
        case "ERC1155_LAZY": {
            const contract = asset.assetType.contract
            const operator = config.erc1155Lazy
            return approveErc1155(ethereum, send, contract, owner, operator)
        }
        case "CRYPTO_PUNKS": {
            const contract = asset.assetType.contract
            const operator = config.cryptoPunks
            return approveCryptoPunk(ethereum, send, contract, owner, operator, asset.assetType.tokenId)
        }
        default: return undefined
    }
}

export const depositToWeth = async (ethereum, amount) => {
    const from = await ethereum.getFrom();
    const contract = new ethereum.config.web3.eth.Contract(WETH9.abi, WETH9.address);
    const balance = await contract.methods.balanceOf(from).call();

}