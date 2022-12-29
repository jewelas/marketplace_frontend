import { getCurrencyAssetType } from '@rarible/sdk/build/common/get-currency-asset-type'
import * as common from '@rarible/sdk/build/sdk-blockchains/ethereum/common/'
import { toBigNumber } from "@rarible/types"
import { toBn } from '@rarible/utils/build/bn'
import { getNftItemById } from '../apis/item'
import { checkAssetType } from './common'
import { getPrice, prepareOrderForm } from './bids'

export const getPreSellForm = async (request) => {
  const {itemId} = common.getEthereumItemId(request.itemId)
  const item = await getNftItemById({itemId})
  const expirationDate = request.expirationDate ? Math.floor(request.expirationDate.getTime() / 1000) : undefined
  const currencyAssetType = getCurrencyAssetType(request.currency)
  return {
      type: "DATA_V2",
      makeAssetType: {
          tokenId: item.tokenId,
          contract: item.contract
      },
      amount: request.amount,
      takeAssetType: common.getEthTakeAssetType(currencyAssetType),
      priceDecimal: request.price,
      payouts: common.toEthereumParts(request.payouts),
      originFees: common.toEthereumParts(request.originFees),
      end: expirationDate
  }
}

export const getSellForm = async (ethereum, request) => {
  const price = await getPrice(ethereum, request, request.takeAssetType)
  const form = await prepareOrderForm(ethereum, request, false)

  return {
    ...form,
    make: {
      assetType: await checkAssetType(request.makeAssetType),
      value: toBigNumber(request.amount.toString())
    },
    take: {
      assetType: request.takeAssetType,
      value: toBigNumber(toBn(price).multipliedBy(request.amount).toString())
    }
  }
}