import { invertOrder } from '@rarible/protocol-ethereum-sdk/build/order/fill-order/invert-order'
import { hashToSign, orderToStruct } from '@rarible/protocol-ethereum-sdk/build/order/sign-order'
import { isSigner } from '@rarible/protocol-ethereum-sdk/build/common/is-signer'
import { fixSignature } from '@rarible/protocol-ethereum-sdk/build/common/fix-signature'
import { convertOrderIdToEthereumHash, convertToEthereumAddress, toEthereumParts, getEthereumItemId } from '@rarible/sdk/build/sdk-blockchains/ethereum/common/'
import { validateOrderDataV3Request } from '@rarible/sdk/build/sdk-blockchains/ethereum/common/validators'
import { toWord, toAddress, toBigNumber, ZERO_WORD } from '@rarible/types'
import { getAssetWithFee } from '@rarible/protocol-ethereum-sdk/build/order/get-asset-with-fee'
import { getBaseFee } from '@rarible/protocol-ethereum-sdk/build/common/get-base-fee'
import { waitTx } from '@rarible/protocol-ethereum-sdk/build/common/wait-tx'
import { approve } from '@rarible/protocol-ethereum-sdk/build/order/approve'

import { checkAssetType, checkLazyAssetType } from './common'
import { getOrderByHash } from '../apis/order'

export const getOrderHashFromRequest = (request) => {
    if ("order" in request) {
        return convertOrderIdToEthereumHash(request.order.id)
    } else if ("orderId" in request) {
        return convertOrderIdToEthereumHash(request.orderId)
    }
    throw new Error("OrderId has not been found in request")
}

export const hasCollectionAssetType = (order) => {
    return order.take.assetType.assetClass === "COLLECTION" || order.make.assetType.assetClass === "COLLECTION"
}

export const getFillOrderRequest = (config, order, request) => {
    let result
    switch (order.type) {
        case "RARIBLE_V1": {
            result = {
                order,
                amount: request.amount,
                infinite: request.infiniteApproval,
                originFee: request.originFees?.[0]?.value ? request.originFees[0].value : 0,
                payout: request.payouts?.[0]?.account
                    ? convertToEthereumAddress(request.payouts[0].account)
                    : undefined,
            }
            break
        }
        case "RARIBLE_V2": {
            result = {
                order,
                amount: request.amount,
                infinite: request.infiniteApproval,
                payouts: toEthereumParts(request.payouts),
                originFees: toEthereumParts(request.originFees),
            }

            switch (order.data.dataType) {
                case "RARIBLE_V2_DATA_V3_BUY":
                    validateOrderDataV3Request(request, { shouldProvideMaxFeesBasePoint: true });
                    result.maxFeesBasePoint = request.maxFeesBasePoint;
                    result.marketplaceMarker =
                        config?.marketplaceMarker ? toWord(config?.marketplaceMarker) : undefined
                    break
                case "RARIBLE_V2_DATA_V3_SELL":
                    result.marketplaceMarker =
                        config?.marketplaceMarker ? toWord(config?.marketplaceMarker) : undefined
                    validateOrderDataV3Request(request, { shouldProvideMaxFeesBasePoint: false })
                    break
                default:
            }
            break
        }
        case "OPEN_SEA_V1": {
            result = {
                order,
                originFees: order.take.assetType.assetClass === "ETH" ? toEthereumParts(request.originFees) : [],
                payouts: toEthereumParts(request.payouts),
                infinite: request.infiniteApproval,
            }
            break
        }
        case "SEAPORT_V1": {
            result = {
                order,
                originFees: toEthereumParts(request.originFees),
                amount: request.amount,
            }
            break
        }
        default: {
            throw new Error("Unsupported order type")
        }
    }

    if (request.itemId) {
        const {
            contract,
            tokenId,
        } = getEthereumItemId(request.itemId)
        result.assetType = {
            contract: toAddress(contract),
            tokenId,
        }
    }

    return result
}

export const getPreAcceptBidForm = async (config, request, prepare) => {
    const orderHash = getOrderHashFromRequest(prepare);
    console.log('########', orderHash);
    const order = await getOrderByHash({ hash: orderHash }) // API function to get the order by ID (orderHash);
    console.log('########', order);

    if (hasCollectionAssetType(order) && !request.itemId) {
        throw new Error("For collection order you should pass itemId")
    }

    return getFillOrderRequest(config, order, request);

}

export const getAccpetBidForm = async (ethereum, config, request) => {
    if (!ethereum) {
        throw new Error("Wallet undefined")
    }
    if (request.order.type === "SEAPORT_V1") {
        return { request, inverted: request.order }
    }
    const from = toAddress(await ethereum.getFrom())
    console.log("**********", request);
    const inverted = await invert(request, from)
    console.log("**********", inverted);

    if (request.assetType && inverted.make.assetType.assetClass === "COLLECTION") {
        inverted.make.assetType = await checkAssetType(request.assetType)
        inverted.make.assetType = await checkLazyAssetType(inverted.make.assetType)
    }
    await approveOrder(ethereum, config, inverted, Boolean(request.infinite))

    const txOptions = await getMatchOptions(config, request.order, inverted);
    const txData = await getTxData(ethereum, config, request, inverted)
    txOptions.from = localStorage.getItem("account")

    return {data: txData, options: txOptions};
    //return this.sendTransaction(request, inverted)
}


export const getTxData = async (ethereum, config, request, inverted) => {
    switch (inverted.type) {
        case "RARIBLE_V1":
            break;
        // return this.v1Handler.sendTransaction(request.order, inverted, request)
        case "RARIBLE_V2":
            return await getTxDataV2(ethereum, config, request.order, inverted)
        // case "OPEN_SEA_V1":
        //   return this.openSeaHandler.sendTransaction(request.order, inverted, request)
        // case "SEAPORT_V1":
        //   return this.seaportHandler.fillSeaportOrder(request.order, request)
        // case "CRYPTO_PUNK":
        //   return this.punkHandler.sendTransaction(request.order, inverted)
        default:
            throw new Error(`Unsupported order: ${JSON.stringify(inverted)}`)
    }
}

export const getMatchOptions = async (config, left, right) => {
    if (left.make.assetType.assetClass === "ETH" && left.salt === ZERO_WORD) {
        const asset = await getMakeAssetWithFee(config, "mumbai", left)
        return { value: asset.value }
    } else if (right.make.assetType.assetClass === "ETH" && right.salt === ZERO_WORD) {
        const asset = await getMakeAssetWithFee(config, "mumbai", right)
        return { value: asset.value }
    } else {
        return {}
    }
}

export const getTxDataV2 = async (ethereum, config, initial, inverted) => {
    return {
        orderLeft: await fixForTx(ethereum, config, initial),
        signatureLeft: fixSignature(initial.signature) || "0x",
        orderRight: orderToStruct(ethereum, inverted),
        signatureRight: fixSignature(inverted.signature) || "0x"
    };
}

export const fixForTx = async (ethereum, config, order) => {
    const hash = hashToSign(config, ethereum, order)
    const isMakerSigner = await isSigner(ethereum, order.maker, hash, order.signature)
    return orderToStruct(ethereum, order, !isMakerSigner)
}

// export const getTxDataV1 = async (initial, inverted, request) => {
//   const buyerFeeSig = await this.orderApi.buyerFeeSignature(
//     { fee: inverted.data.fee, orderForm: fromSimpleOrderToOrderForm(initial) },
//   )
//   const exchangeContract = createExchangeV1Contract(this.ethereum, this.config.exchange.v1)
//     return {
//     toStructLegacyOrder(initial),
//     toVrs(initial.signature),
//     inverted.data.fee,
//     toVrs(buyerFeeSig),
//     inverted.take.value,
//     request.payout ?? ZERO_ADDRESS,
//   )
// }

export const invert = (request, from) => {
    switch (request.order.type) {
        case "RARIBLE_V1":
            return invertOrderV1(request, from);
        case "RARIBLE_V2":
            return invertOrderV2(request, from);
        // case "OPEN_SEA_V1":
        //   return this.openSeaHandler.invert(request, from)
        // case "SEAPORT_V1":
        //   throw new Error("Approve for Seaport orders is not implemented yet")
        // case "CRYPTO_PUNK":
        //   return this.punkHandler.invert(request, from)
        default:
            throw new Error(`Unsupported order: ${JSON.stringifyrequest}`)
    }
}

export const invertOrderV1 = (request, maker) => {
    const inverted = invertOrder(request.order, request.amount, maker)
    inverted.data = {
        dataType: "LEGACY",
        fee: request.originFee,
    }
    return inverted
}

export const invertOrderV2 = (request, maker) => {
    const inverted = invertOrder(request.order, request.amount, maker)
    switch (request.order.data.dataType) {
        case "RARIBLE_V2_DATA_V1": {
            inverted.data = {
                dataType: "RARIBLE_V2_DATA_V1",
                originFees: request.originFees || [],
                payouts: request.payouts || [],
            }
            break
        }
        case "RARIBLE_V2_DATA_V2": {
            inverted.data = {
                dataType: "RARIBLE_V2_DATA_V2",
                originFees: request.originFees || [],
                payouts: request.payouts || [],
                isMakeFill: !request.order.data.isMakeFill,
            }
            break
        }
        case "RARIBLE_V2_DATA_V3_BUY": {
            inverted.data = {
                dataType: "RARIBLE_V2_DATA_V3_SELL",
                payout: request.payout,
                originFeeFirst: request.originFeeFirst,
                originFeeSecond: request.originFeeSecond,
                maxFeesBasePoint: request.maxFeesBasePoint,
                marketplaceMarker: request.marketplaceMarker,
            }
            break
        }
        case "RARIBLE_V2_DATA_V3_SELL": {
            inverted.data = {
                dataType: "RARIBLE_V2_DATA_V3_BUY",
                payout: request.payout,
                originFeeFirst: request.originFeeFirst,
                originFeeSecond: request.originFeeSecond,
                marketplaceMarker: request.marketplaceMarker,
            }
            break
        }
        default: throw new Error("Unsupported order dataType")
    }
    return inverted
}

export const approveOrder = (ethereum, config, inverted, isInfinite) => {
    switch (inverted.type) {
        // case "RARIBLE_V1":
        //   return this.v1Handler.approve(inverted, isInfinite)
        case "RARIBLE_V2":
            return approveV2(ethereum, config, inverted, isInfinite)
        // case "OPEN_SEA_V1":
        //   return this.openSeaHandler.approve(inverted, isInfinite)
        // case "SEAPORT_V1":
        //   throw new Error("Approve for Seaport orders is not implemented yet")
        // case "CRYPTO_PUNK":
        //   return this.punkHandler.approve(inverted, isInfinite)
        default:
            throw new Error(`Unsupported order: ${JSON.stringify(inverted)}`)
    }
}

export const send = async (functionCall, option) => {
    return functionCall.send(option);
}

export const approveV2 = async (ethereum, config, order, infinite) => {
    const withFee = await getMakeAssetWithFee(config, "mumbai", order);
    console.log(ethereum, config, withFee)
    const tx = await approve(ethereum, send, config.transferProxies, order.maker, withFee, infinite);
    console.log('%%%%%%%%%%%', tx)
    await waitTx(tx)
}

export const getMakeAssetWithFee = async (config, env, order) => {
    return getAssetWithFee(order.make, await getOrderFee(config, env, order))
}

export const getOrderFee = async (config, env, order) => {
    switch (order.data.dataType) {
        case "RARIBLE_V2_DATA_V1":
        case "RARIBLE_V2_DATA_V2":
            return order.data.originFees.map(f => f.value).reduce((v, acc) => v + acc, 0) + await getBaseOrderFee(config, env)
        case "RARIBLE_V2_DATA_V3_BUY":
        case "RARIBLE_V2_DATA_V3_SELL":
            return (order.data.originFeeFirst?.value ?? 0) +
                (order.data.originFeeSecond?.value ?? 0) +
                await getBaseOrderFee(config, env)
        default:
            throw new Error("Unsupported order dataType")
    }
}

export const getBaseOrderFee = (config, env) => {
    return getBaseFee(config, env, "RARIBLE_V2");
}