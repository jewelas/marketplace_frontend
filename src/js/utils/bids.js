import axios from 'axios'
import { getCurrencyAssetType } from '@rarible/sdk/build/common/get-currency-asset-type'
import * as common from '@rarible/sdk/build/sdk-blockchains/ethereum/common/'
import { randomWord, toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import { toBn } from '@rarible/utils/build/bn'
import { createErc20Contract } from '@rarible/protocol-ethereum-sdk/build/order/contracts/erc20'
import { getRequiredWallet } from '@rarible/protocol-ethereum-sdk/build/common/get-required-wallet'
import { getBaseFee } from '@rarible/protocol-ethereum-sdk/build/common/get-base-fee'
import { addFee } from '@rarible/protocol-ethereum-sdk/build/order/add-fee'
import { approve as approveFn } from '@rarible/protocol-ethereum-sdk/build/order/approve'
import { getPrice as getEthPrice } from '@rarible/protocol-ethereum-sdk/build/common/get-price'
import { getDecimals } from '@rarible/protocol-ethereum-sdk/build/common/get-decimals'
import { ConvertWeth } from '@rarible/protocol-ethereum-sdk/build/order/convert-weth'

import { getNftItemById } from '../apis/item'
import { checkAssetType } from './common'
import { Factory721, WETH9 } from '../../interface/contracts'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'


export const getOrderMaker = async (ethereum, request) => {
    if (request.maker) {
        return request.maker
    } else {
        return toAddress(await getRequiredWallet(ethereum).getFrom())
    }
}

export const prepareOrderForm = async (ethereum, request, isMakeFill) => {
    let data;
    switch (request.type) {
        case "DATA_V2":
            data = {
                dataType: "RARIBLE_V2_DATA_V2",
                payouts: request.payouts,
                originFees: request.originFees,
                isMakeFill,
            }
            break
        case "DATA_V3_BUY":
            data = {
                dataType: "RARIBLE_V2_DATA_V3_BUY",
                payout: request.payout,
                originFeeFirst: request.originFeeFirst,
                originFeeSecond: request.originFeeSecond,
                marketplaceMarker: request.marketplaceMarker,
            }
            break
        case "DATA_V3_SELL":
            data = {
                dataType: "RARIBLE_V2_DATA_V3_SELL",
                payout: request.payout,
                originFeeFirst: request.originFeeFirst,
                originFeeSecond: request.originFeeSecond,
                marketplaceMarker: request.marketplaceMarker,
                maxFeesBasePoint: request.maxFeesBasePoint,
            }
            break
        default:
            throw new Error("Unknown OrderRequest type")
    }

    return {
        maker: await getOrderMaker(ethereum, request),
        type: "RARIBLE_V2",
        data: data,
        salt: toBigNumber(toBn(randomWord(), 16).toString(10)),
        signature: toBinary("0x"),
        start: request.start,
        end: request.end,
    }
}

export const getPrice = async (ethereum, hasPrice, assetType) => {
    if ("price" in hasPrice) {
        return hasPrice.price
    } else {
        switch (assetType.assetClass) {
            case "ETH":
                return toBn(hasPrice.priceDecimal).multipliedBy(toBn(10).pow(18))
            case "ERC20":
                const decimals = await createErc20Contract(
                    getRequiredWallet(ethereum),
                    assetType.contract
                )
                    .functionCall("decimals")
                    .call()
                return toBn(hasPrice.priceDecimal).multipliedBy(toBn(10).pow(Number(decimals)))
            default:
                throw new Error(`Asset type should be either ETH or ERC-20, received=${JSON.stringify(assetType)}`)
        }
    }
}

export const getBidForm = async (ethereum, request) => {
    const form = await prepareOrderForm(ethereum, request, false)
    const price = await getPrice(ethereum, request, request.makeAssetType)
    return {
        ...form,
        make: {
            assetType: request.makeAssetType,
            value: toBigNumber(toBn(price).multipliedBy(request.amount).toString()),
        },
        take: {
            assetType: await checkAssetType(request.takeAssetType), // await this.checkAssetType(request.takeAssetType)
            value: toBigNumber(request.amount.toString()),
        },
    }
}

export const getPreBidForm = async (request, prepare) => {
    let contractAddress, item, takeAssetType

    if ("itemId" in prepare) {
        const { itemId } = common.getEthereumItemId(prepare.itemId)
        item = await getNftItemById({ itemId })
        contractAddress = item.contract

        takeAssetType = {
            tokenId: item.tokenId,
            contract: item.contract,
        }
    } else if ("collectionId" in prepare) {
        contractAddress = common.convertToEthereumAddress(prepare.collectionId)
        takeAssetType = {
            assetClass: "COLLECTION",
            contract: contractAddress,
        }
    } else {
        throw new Error("ItemId or CollectionId must be assigned")
    }

    const expirationDate = request.expirationDate instanceof Date
        ? Math.floor(request.expirationDate.getTime() / 1000)
        : undefined
    const currencyAssetType = getCurrencyAssetType(request.currency)

    return {
        type: "DATA_V2",
        makeAssetType: common.getEthTakeAssetType(currencyAssetType),
        takeAssetType: takeAssetType,
        amount: request.amount,
        priceDecimal: request.price,
        payouts: common.toEthereumParts(request.payouts),
        originFees: common.toEthereumParts(request.originFees),
        end: expirationDate,
    }
}

export const orderFormToSimpleOrder = (form) => {
    return {
        ...form,
        salt: toBinary(toBn(form.salt).toString(16))
    }
}

export const getOrderFee = (config, env, order) => {
    switch (order.type) {
        // case "RARIBLE_V1":
        //   return this.v1Handler.getOrderFee(order)
        case "RARIBLE_V2":
            return getOrderFeeV2(config, env, order)
        // case "OPEN_SEA_V1":
        //   return this.openSeaHandler.getOrderFee(order)
        // case "SEAPORT_V1":
        //   return this.seaportHandler.getOrderFee(order)
        // case "CRYPTO_PUNK":
        //   return this.punkHandler.getOrderFee()
        default:
            throw new Error(`Unsupported order: ${JSON.stringify(order)}`)
    }
}

export const getOrderFeeV2 = async (config, env, order) => {
    switch (order.data.dataType) {
        case "RARIBLE_V2_DATA_V1":
        case "RARIBLE_V2_DATA_V2":
            return order.data.originFees.map(f => f.value).reduce((v, acc) => v + acc, 0) + await getBaseFee(config, env, "RARIBLE_V2")
        case "RARIBLE_V2_DATA_V3_BUY":
        case "RARIBLE_V2_DATA_V3_SELL":
            return (order.data.originFeeFirst?.value ?? 0) +
                (order.data.originFeeSecond?.value ?? 0) +
                await getBaseFee(config, env, "RARIBLE_V2")
        default:
            throw new Error("Unsupported order dataType")
    }
}

export const send = async (functionCall, option) => {
    return functionCall.send(option);
}

export const approve = async (ethereum, config, env, checkedOrder, infinite) => {
    const simple = orderFormToSimpleOrder(checkedOrder)
    const fee = await getOrderFee(config, env, simple)
    const make = addFee(checkedOrder.make, fee)
    await approveFn(ethereum, send, config.transferProxies, checkedOrder.maker, make, infinite)
}

export const convertCurrency = async (wallet, config, request) => {
    const currency = getCurrencyAssetType(request.currency);
    if (currency['@type'] === 'ERC20' && currency.contract.split(":")[1].toLowerCase() === WETH9.address.toLowerCase()) {
        const originFeesSum = request.originFees?.reduce((acc, fee) => fee.value, 0) || 0
        const value = await getConvertableValueCommon(wallet, currency, request.price, request.amount, originFeesSum)
        await convertCurrencyType(wallet, config, value);
    }
}

export const convertCurrencyType = async (wallet, config, convertableValue) => {
    const wethContract = 'ETHEREUM:' + WETH9.address
    const wethConverter = new ConvertWeth(wallet.ethereum, send, config)
    if (!wallet) {
        throw new Error("Wallet is undefined")
    }

    if (convertableValue === undefined) {
        return
    }
    if (convertableValue.type === "insufficient") {
        throw new Error("Insufficient ETH funds")
    }

    if (convertableValue.type === "convertable") {
        const tx = wethConverter.convert(
            common.convertToEthereumAssetType({ "@type": "ETH" }),
            common.convertToEthereumAssetType({ "@type": "ERC20", contract: wethContract }),
            convertableValue.value
        )
        console.log(tx)
    }
}

export const getConvertableValueCommon = async (wallet, assetType, price, amount, originFeesSum) => {
    if (!wallet) {
        throw new Error("Wallet is undefined")
    }
    const convertedAssetType = common.convertToEthereumAssetType(assetType)
    const value = new BigNumber(price).multipliedBy(amount)
    const convertedPrice = await getEthPrice(wallet.ethereum, convertedAssetType, value)

    const baseFee = 0
    const completeFee = originFeesSum + baseFee
    const valueWithFee = addFee(
        { assetType: convertedAssetType, value: toBigNumber(convertedPrice.toString()) },
        new BigNumber(completeFee)
    )
    const assetDecimals = await getDecimals(wallet.ethereum, convertedAssetType)
    const finishValue = new BigNumber(valueWithFee.value)
        .integerValue()
        .div(new BigNumber(10).pow(assetDecimals))
    const walletAddress = await wallet.ethereum.getFrom()

    return {
        type: "convertable",
        currency: { "@type": "ETH", blockchain: "ETHEREUM" },
        value: new BigNumber(finishValue)
    }
    // return getCommonConvertableValue(
    //   balanceService.getBalance,
    //   common.convertEthereumToUnionAddress(walletAddress, "DOGECHAIN"),
    //   new BigNumber(finishValue),
    //   { "@type": "ETH", blockchain: "DOGECHAIN" },
    //   assetType,
    // )
}