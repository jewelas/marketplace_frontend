import Web3 from 'web3'
import axios from 'axios'
import { BigNumber as BN } from "ethers"
import Toastify from 'toastify-js'
import { WETH9, Exchange } from "../../../interface/contracts"
import { buyItem, likeItem, placeABid, putOnSale, sendAlert } from '../utils'
import { approve, getBidForm, getPreBidForm, orderFormToSimpleOrder, convertCurrency, send } from '../../utils/bids'
import { getAccpetBidForm, getPreAcceptBidForm } from '../../utils/acceptbid'
import { signOrder } from '@rarible/protocol-ethereum-sdk/build/order/sign-order'
import { Web3Ethereum } from '@rarible/web3-ethereum'
import { EthereumWallet } from '@rarible/sdk-wallet'
import { getEthereumConfig } from '../../config/'
import { checkLazyOrder, depositToWeth } from '../../utils/common'
import { getAndDeleteOrderByData, getOpenOrders, getOrderByHash, getOrdersByItemId, updateBidData, upsertOrder } from '../../apis/order'
import { orderToStruct } from '@rarible/protocol-ethereum-sdk/build/order/sign-order'
import { createExchangeV2Contract } from '@rarible/protocol-ethereum-sdk/build/order/contracts/exchange-v2'
import Charts from "../../charts"

class ItemDetail {
    constructor(props) {
        this.props = props
        this.web3 = new Web3(window.ethereum)
        this.collectionInfo = document.getElementById("collection-info")
        this.itemName = document.getElementById("itemdetail-name")
        this.itemPrice = document.getElementById("item-price")
        this.highestItemPrice = document.getElementById("highest-item-price")
        this.itemDescription = document.getElementById("item-desc")
        this.itemImage = document.getElementById("item-image")
        this.itemVideo = document.getElementById("item-video")
        this.bigImage = document.getElementById("big-image")
        this.bigVideo = document.getElementById("big-video")
        this.itemOwner = document.getElementById('item-owner')
        this.itemCreator = document.getElementById("item-creator")
        this.spinner = document.getElementById("create-spinner")
        this.putOnSaleButton = document.getElementById("put-on-sale")
        this.editPriceButton = document.getElementById("edit-price")
        this.saletypeButton = document.getElementById("change-saletype")
        this.bidCollectionButton = document.getElementById("new-bid-collection")
        this.bidItemButton = document.getElementById("new-bid-item")
        this.buyItemButton = document.getElementById("buy-item")
        this.placeBidButton = document.getElementById("place-bid")
        this.acceptBidButton = document.getElementById("accept-bid-item")
        this.cancelBidButton = document.getElementById("cancel-bid-item")
        this.terms = document.getElementById("terms")
        this.likeButton = document.getElementById("like-with-heart")
        this.getPrice()
        this.events()
    }

    events = async () => {
        await this.getCurrentCollection()
        this.terms?.addEventListener("change", e => this.changeTerm(e))
        this.acceptBidButton?.addEventListener("click", e => this.acceptBidItem(e))
        this.cancelBidButton?.addEventListener("click", e => this.cancelBidItem(e))
        this.putOnSaleButton?.addEventListener("click", e => putOnSale(this.item.supply, this.item.price, this.web3, this.item.collectionId, this.item.id))
        this.bidCollectionButton?.addEventListener("click", e => this.bidType = 0)
        this.bidItemButton?.addEventListener("click", e => this.bidType = 1)
        this.placeBidButton?.addEventListener("click", e => this.doPlaceBid(e))
        this.likeButton?.addEventListener("click", e => this.like(e))
        this.buyItemButton?.addEventListener("click", e => buyItem(this.item.supply, this.item.price, this.web3, this.item.collectionId, this.item.id))

        document.getElementById("refresh-meta").addEventListener("click", e => this.refreshMetadata(e))
        document.getElementById("acttype-listing").addEventListener("click", e => this.changeActivityType(e, 0))
        document.getElementById("acttype-bids").addEventListener("click", e => this.changeActivityType(e, 1))
        document.getElementById("acttype-likes").addEventListener("click", e => this.changeActivityType(e, 2))
        document.getElementById("save-price").addEventListener("click", e => this.saveNewPrice(e))
        document.querySelectorAll(".sale-type").forEach((x, i) => x.addEventListener("click", e => this.changeSaletype(e, i)))
    }

    refreshMetadata = async () => {
        Toastify({
            text: "Check back in a minute...",
            duration: 7000,
            newWindow: true,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "rgb(53,56,64)",
                boxShadow: "none",
                fontWeight: "bolder",
                display: "flex",
                alignItems: "center",
                gap: "32px"
            },
            onClick: function () { } // Callback after click
        }).showToast()

        const urlParams = new URLSearchParams(window.location.search)
        const { data: { items } } = await axios.get(`/item/${urlParams.get("token")}`)
        const item = items[0]
        const { data: { name, image: img, description } } = await axios.get(item.tokenURI)
        const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img

        this.itemName.innerHTML = name
        if (item.filetype == "image") this.itemImage.src = image
        if (item.filetype == "video") this.itemVideo.src = image
        this.itemDescription.innerHTML = description
    }

    like = async () => {
        const success = await likeItem(this.likes, this.item.collectionId, this.item.id)
        if (success) {
            this.likeButton.classList.toggle("js-likes--active")
            await this.getCurrentCollection()
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    getPrice = async () => {
        try {
            const { data: { "wrapped-wdoge": { usd } } } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=wrapped-wdoge&vs_currencies=usd`)
            this.usdPrice = usd
        } catch (e) {
            console.log(e)
            this.usdPrice = 0
        }
    }

    saveNewPrice = async (e) => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("token").split(":")
        const { data: { success } } = await axios.put("/item/saveprice", {
            collectionId: code[0],
            tokenId: code[1],
            value: parseFloat(document.getElementById("new-price").value)
        })
        if (success) {
            await axios.delete("/order", {
                data: {
                    collectionId: code[0],
                    tokenId: code[1],
                    bidder: localStorage.getItem("account"),
                }
            })
            await putOnSale(
                this.item.supply,
                parseFloat(document.getElementById("new-price").value),
                this.web3,
                code[0],
                code[1],
            );
            sendAlert(success ? "Saved new price" : "Failed", success ? "info" : "danger")
            setTimeout(() => location.reload(), 3000)
        }
    }

    changeTerm = async (e) => {
        if (localStorage.getItem("account") && localStorage.getItem("sign"))
            this.placeBidButton.disabled = !e.currentTarget.checked
    }

    initMoreFromCollection = async (data) => {
        let str = ``
        for (let i = 0; i < data.length; i++) {
            str += `
            <div class="swiper-slide">
                <article>
                    <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                        <figure>
                            <a>
                                <div class="relative w-full overflow-hidden rounded-[0.625rem] skeleton" style="height: 230px;"></div>
                            </a>
                        </figure>
                        <div class="mt-4 flex items-center justify-between truncate gap-x-2">
                            <a class="truncate">
                                <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">--</span>
                            </a>
                            <span class="dark:border-jacarta-600 border-jacarta-100 flex items-center whitespace-nowrap rounded-md border py-1 px-2 gap-x-2">
                                <span data-tippy-content="WDOGE">
                                    <img src="img/chains/WDOGE.png" class="rounded-full mr-1" style="min-width: 20px; min-height:20px; width: 20px; height: 20px;" />
                                </span>
                                <span class="text-green text-sm font-medium tracking-tight">-- WDOGE</span>
                            </span>
                        </div>
                        <div class="mt-2 text-sm">
                            <span class="dark:text-jacarta-300">Highest Bid</span>
                            <span class="dark:text-jacarta-100 text-jacarta-700">-- WDOGE</span>
                        </div>
                    </div>
                </article>
            </div>
            `
        }
        document.getElementById("more-items").innerHTML = str
    }

    moreFromCollection = async (currentTokenId) => {
        const dataWithoutIpfs = this.collection.tokenIds.filter(x => x.id != currentTokenId)
        this.initMoreFromCollection(dataWithoutIpfs)
        const data = await Promise.all(dataWithoutIpfs.map(async (x) => {
            const { data: { name, image: img } } = await axios.get(x.tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            return {
                ...x,
                name,
                image
            }
        }))

        let str = ``
        if (!data || data?.length == 0)
            document.getElementById("more-items").innerHTML = "<div class='text-white text-center w-full'>Nothing</div>"
        else {
            for (let i = 0; i < data.length; i++) {
                const itemOrder = this.allOrders?.filter(x => x.take.assetType.contract = data[i].collectionId && x.take.assetType.tokenId == data[i].id)
                const highestOrder = itemOrder?.length > 0 ? itemOrder.reduce((prev, curr) => BN.from(prev.make.value).gt(BN.from(curr.make.value)) ? prev : curr) : null
                const media = data[i].filetype == "image" ? `<img
                    src="${data[i].image}"
                    alt="item 1"
                    width="230"
                    style="height: 230px"
                    class="w-full rounded-[0.625rem] object-cover"
                />` : `<video
                    src=${data[i].image}
                    width="230"
                    style="height: 230px"
                    class="w-full rounded-[0.625rem] object-cover"
                    autoPlay loop muted
                />`
                str += `
                <div class="swiper-slide" style="width: 311px; margin-right: 30px">
                    <article>
                        <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                            <figure>
                                <a href="item.html?token=${data[i].collectionId}:${data[i].id}">
                                    ${media}
                                </a>
                            </figure>
                            <div class="mt-4 flex items-center justify-between truncate gap-x-2">
                                <a class="truncate">
                                    <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">${data[i].name}</span>
                                </a>
                                <span class="dark:border-jacarta-600 border-jacarta-100 flex items-center rounded-md border py-1 px-2 gap-x-2">
                                    <span data-tippy-content="WDOGE">
                                        <img src="img/chains/WDOGE.png" class="rounded-full mr-1" style="min-width: 20px; min-height:20px; width: 20px; height: 20px;" />
                                    </span>
                                    <span class="text-green text-sm font-medium tracking-tight">${data[i].price} WDOGE</span>
                                </span>
                            </div>
                            <div class="mt-2 flex justify-between items-center">
                            </div>

                            <div class="mt-2 flex justify-between items-center">
                                <div class="text-sm">
                                    <span class="dark:text-jacarta-300">Highest Bid</span>
                                    <span class="dark:text-jacarta-100 text-jacarta-700">${highestOrder?.take.value ?? "--"} WDOGE</span>
                                </div>
                                <span class="text-sm text-white dark:text-jacarta-100">${data[i].saletype == 0 ? 'Fixed' : 'Bids'}</span>
                            </div>
                        </div>
                    </article>
                </div>
                `
            }
            document.getElementById("more-items").innerHTML = str
        }
    }

    getOrders = async () => this.allOrders = await getOpenOrders()

    getCurrentCollection = async () => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("token").split(":")
        const { data: { items } } = await axios.get(`/item/${urlParams.get("token")}`)
        const res = await axios.get(`/collection/${code[0]}`)
        const collection = res.data[0]
        const item = items[0]
        const { data: { name, image: img, description } } = await axios.get(item.tokenURI)
        const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img

        await this.getOrders()
        this.collection = collection
        this.moreFromCollection(code[1])
        this.item = item
        this.likes = item.likes
        this.collectionInfo.innerHTML = collection.name
        this.collectionInfo.href = `collection.html?collection=${collection.collectionId}`
        this.itemName.innerHTML = name
        this.highItemPriceV = item.price
        this.itemPrice.innerHTML = `${item.price} WDOGE`
        this.itemDescription.innerHTML = description
        if (item.likes.some(x => x == localStorage.getItem("account"))) {
            this.likeButton.classList.add("js-likes--active")
        }

        if (item.filetype == "image") {
            this.itemImage.src = image
            this.itemImage.style.display = "block"
            this.itemVideo.style.display = "none"

            this.bigImage.src = image
            this.bigImage.style.display = "block"
            this.bigVideo.style.display = "none"
            document.getElementById("loading-media").style.display = "none"
        }
        else if (item.filetype == "video") {
            this.itemVideo.src = image
            this.itemVideo.style.display = "block"
            this.itemImage.style.display = "none"

            this.bigVideo.src = image
            this.bigVideo.style.display = "block"
            this.bigImage.style.display = "none"
            document.getElementById("loading-media").style.display = "none"
        }
        this.itemOwner.href = `user.html?user=${item.owner}`
        this.itemOwner.querySelector("span").innerHTML = item.ownerInfo[0]?.name ?? ""
        this.itemCreator.href = item.creatorInfo[0] ? `user.html?user=${item.creatorInfo[0]?.wallet}` : ""
        this.itemCreator.querySelector("span").innerHTML = item.creatorInfo[0]?.name ?? ""

        document.getElementById("like-num").innerHTML = this.likes.length
        document.getElementById("creator-avatar").src = item.creatorInfo[0]?.avatar ?? "img/products/item_21_sm.jpg"
        document.getElementById("creator-link").href = item.creatorInfo[0] ? `user.html?user=${item.creatorInfo[0].wallet}` : ""
        document.getElementById("owner-avatar").src = item.ownerInfo[0]?.avatar ?? "img/products/item_21_sm.jpg"
        document.getElementById("owner-link").href = item.ownerInfo[0] ? `user.html?user=${item.ownerInfo[0].wallet}` : ""
        document.getElementById("contract-address").href = `https://https://explorer-testnet.dogechain.dog/address/${collection.collectionId}`
        document.getElementById("contract-address").innerHTML = collection.collectionId
        document.getElementById("token-id").innerHTML = item.id
        document.getElementById("token-standard").innerHTML = collection.standard
        document.getElementById("blockchain").innerHTML = collection.blockchain
        document.getElementById("unlockable").innerHTML = item?.owner?.toLowerCase() == localStorage.getItem("account") ? item.unlockable : `you are not owner`
        if (item?.owner?.toLowerCase() != localStorage.getItem("account")) document.getElementById("unlockable").classList.add("text-accent")

        if (item.stats.length == 0) document.getElementById("properties-content-root").innerHTML = "<div class='text-white text-center'>No property</div>"
        else {
            let str = ``
            for (let i = 0; i < item.stats.length; i++)
                str +=
                    `
                <a class="dark:bg-jacarta-800 dark:border-jacarta-600 bg-light-base rounded-2lg border-jacarta-100 flex flex-col space-y-2 border p-5 text-center transition-shadow hover:shadow-lg">
                    <span class="text-accent text-sm uppercase">${item.stats[i].name}</span>
                    <span class="text-jacarta-700 text-base dark:text-white">${item.stats[i].value1}</span>
                    <span class="text-jacarta-400 text-sm">${(item.stats[i].value1 / item.stats[i].value2).toFixed(2)}% have this trait</span>
                </a>
            `
            document.getElementById("properties-content").innerHTML = str
        }

        const itemOrder = this.allOrders.filter(x => x.take.assetType.contract == this.collection.collectionId && x.take.assetType.tokenId == this.item.id)
        this.highestOrder = itemOrder?.length > 0 ? itemOrder.reduce((prev, curr) => BN.from(prev.make.value).gt(BN.from(curr.make.value)) ? prev : curr) : null

        let highestItemPriceDecimal = 0
        if (this.highestOrder) {
            document.getElementById("bid-info").style.display = "block"
            highestItemPriceDecimal = itemOrder?.length > 0 && this.highestOrder ? this.web3.utils.fromWei(this.highestOrder.make.value) : ""
            this.highestItemPrice.innerHTML = itemOrder?.length > 0 ? `${highestItemPriceDecimal} WDOGE` : "--"
        }

        if (this.highestOrder) {
            const bidderInfo = this.props.allUsers.filter(x => x.wallet == this.highestOrder.maker)[0]
            document.getElementById("highest-bidder-avatar").src = bidderInfo.avatar
            document.getElementById("highest-bidder-wallet").innerHTML = this.highestOrder.maker
            document.getElementById("highest-bidder-wallet").href = `user.html?user=${this.highestOrder.maker}`
            document.getElementById("highest-item-price-in-usd").innerHTML = `~${(this.usdPrice * highestItemPriceDecimal).toFixed(2)} USD`
        }
        else
            document.getElementById("highest-item-price-in-usd").innerHTML = "--"

        if (item?.owner?.toLowerCase() == localStorage.getItem("account")) {
            this.editPriceButton.disabled = false
        }

        if (item?.saletype == -1) {
            if (item?.owner?.toLowerCase() == localStorage.getItem("account")) {
                this.saletypeButton.disabled = false
            }
        }
        if (item?.saletype == 0) {
            if (item?.owner?.toLowerCase() == localStorage.getItem("account")) {
                this.putOnSaleButton.disabled = item?.onsale
            }
            if (item?.owner?.toLowerCase() != localStorage.getItem("account")) {
                if (this.item.onsale == true)
                    this.buyItemButton.style.display = "block"
            }
            else
                this.buyItemButton.style.display = "none"
        }
        if (item?.saletype == 1) {
            this.putOnSaleButton.disabled = true
            const bidStatus = this.allOrders.filter(x => x.collectionId == code[0] && x.tokenId == code[1] && x.maker == localStorage.getItem("account"))
            if (item?.owner?.toLowerCase() == localStorage.getItem("account")) {
                this.cancelBidButton.style.display = "none"
                if (itemOrder?.length > 0)
                    this.acceptBidButton.style.display = "block"
                else
                    this.acceptBidButton.style.display = "none"
                this.getOffers(itemOrder)
            } else {
                document.querySelectorAll(".new-bid-modal").forEach(x => x.disabled = false)
                if (bidStatus?.length > 0)
                    this.cancelBidButton.style.display = "block"
                else
                    this.cancelBidButton.style.display = "none"
                this.bidItemButton.style.display = "block"
            }
        }
        this.getActivities(code[1])
        this.getPriceHistory()
    }

    getOffers = async (offers) => {
        const users = this.props.allUsers
        let str = ``
        await this.getPrice()
        for (let i = 0; i < offers.length; i++) {
            str +=
                `
            <div class="contents" role="row">
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex items-center whitespace-nowrap border-t py-4 px-4"
                    role="cell"
                >
                    <span class="-ml-1" data-tippy-content="WDOGE">
                        <img src="img/chains/WDOGE.png" class="rounded-full mr-1" width="20" height="20" />
                    </span>
                    <span class="text-green text-sm font-medium tracking-tight">${parseFloat(this.web3.utils.fromWei(offers[i].make.value)).toFixed(2)} WDOGE</span>
                </div>
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex items-center border-t py-4 px-4"
                    role="cell"
                >
                    $${(parseFloat(this.web3.utils.fromWei(offers[i].make.value)) * this.usdPrice).toFixed(2)}
                </div>
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex items-center border-t py-4 px-4 truncate"
                    role="cell"
                >
                    <a href="user.html?user=${offers[i].maker}" class="text-accent truncate">${users.find(x => x.wallet == offers[i].maker).name}</a>
                </div>
            </div>
            `
        }
        document.getElementById("offers-content").innerHTML = str
    }

    renderActivities = async (data) => {
        const activityName = ["List", "Bid", "Like"]
        const users = this.props.allUsers

        let str = ``
        for (let i = 0; i < data.length; i++) {
            const ago = data[i].createdAt.slice(0, 10)
            str += `
            <div class="flex" role="row">
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex w-[17%] items-center border-t py-4 px-4"
                    role="cell"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        class="fill-jacarta-700 mr-2 h-4 w-4 group-hover:fill-white dark:fill-white"
                    >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M14 20v2H2v-2h12zM14.586.686l7.778 7.778L20.95 9.88l-1.06-.354L17.413 12l5.657 5.657-1.414 1.414L16 13.414l-2.404 2.404.283 1.132-1.415 1.414-7.778-7.778 1.415-1.414 1.13.282 6.294-6.293-.353-1.06L14.586.686zm.707 3.536l-7.071 7.07 3.535 3.536 7.071-7.07-3.535-3.536z"></path>
                    </svg>
                    ${activityName[data[i].type]}
                </div>
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex w-[17%] items-center whitespace-nowrap border-t py-4 px-4"
                    role="cell"
                >
                    <span class="-ml-1" data-tippy-content="WDOGE">
                        <img src="img/chains/WDOGE.png" class="rounded-full mr-1" width="20" height="20" />
                    </span>
                    <span class="text-green text-sm font-medium tracking-tight">${data[i].price} WDOGE</span>
                </div>
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex w-[22%] items-center border-t py-4 px-4 truncate"
                    role="cell"
                >
                    <a href="user.html?user=${data[i].user}" class="text-accent truncate">${users.find(x => x.wallet == data[i].user).name}</a>
                </div>
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex w-[22%] items-center border-t py-4 px-4 truncate"
                    role="cell"
                >
                    <a href="user.html?user=${data[i].user}" class="text-accent truncate">${users.find(x => x.wallet == data[i].user).name}</a>
                </div>
                <div
                    class="dark:border-jacarta-600 border-jacarta-100 flex w-[22%] items-center border-t py-4 px-4"
                    role="cell"
                >
                    <a
                        href="#"
                        class="text-accent flex flex-wrap items-center"
                        target="_blank"
                        rel="nofollow noopener"
                        title="Opens in a new window"
                        data-tippy-content="March 13 2022, 2:32 pm"
                    >
                        <span class="mr-1">${ago}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            class="h-4 w-4 fill-current"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"
                            />
                        </svg>
                    </a>
                </div>
            </div>
            `
        }
        document.getElementById("activities").innerHTML = str
    }

    getActivities = async (tokenId) => {
        const res = await axios.get(`/activity/bytokenId/${tokenId}`)
        this.renderActivities(res.data)
    }

    getPriceHistory = async () => {
        if (this.item && this.item.priceHistory) {
            // document.getElementById('activityChart')?.remove()
            new Charts({ data: this.item.priceHistory })
        }
    }

    changeSaletype = async (e, value) => {
        document.getElementById("response-spinner").style.display = "block"
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("token").split(":")
        const { data: { success } } = await axios.put("/item/change_saletype", {
            collectionId: code[0],
            tokenId: code[1],
            value
        })
        if (success) location.reload()
        else {
            sendAlert("Failed", "danger")
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    changeActivityType = async (e, type) => {
        document.querySelectorAll(".filter-button").forEach(x => {
            x.classList.remove("bg-accent")
            x.classList.remove("text-white")
            x.classList.add("dark:bg-jacarta-700")
            x.querySelector("svg").classList.remove("fill-white")
        })
        const selected = document.querySelectorAll(".filter-button")[type]
        selected.classList.add("bg-accent")
        selected.classList.add("bg-accent")
        selected.classList.add("text-white")
        selected.classList.remove("dark:bg-jacarta-700")
        selected.querySelector("svg").classList.add("fill-white")

        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("token").split(":")
        const res = await axios.get(`/activity/bytokenId/${code[1]}`)
        this.renderActivities(res.data.filter(x => x.type == type))
    }

    doPlaceBid = async (e) => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("token").split(":")

        this.spinner.style.display = "block"

        try {
            const res = await placeABid(false, this.web3, this.item.supply, code[0], code[1])
            if (res) this.getCurrentCollection()
        } catch (e) {
            console.log(e)
        }

        this.spinner.style.display = "none"
    }

    acceptBidItem = async (e) => {
        this.cancelBidButton.disabled = true
        this.acceptBidButton.disabled = true
        this.spinner.style.display = "block"

        const contract = new this.web3.eth.Contract(Exchange.abi, Exchange.address)
        try {
            const acceptBidData = {
                amount: 1,
                itemId: `ETHEREUM:${this.collection.collectionId}:${this.item.id}`,
            };
            const config = getEthereumConfig("mumbai");
            const web3 = new Web3(window.ethereum);
            const web3Ethereum = new Web3Ethereum({ web3 });
            const ethWallet = new EthereumWallet(web3Ethereum, "ETHEREUM");

            const preAcceptBidForm = await getPreAcceptBidForm(config, acceptBidData, { orderId: `ETHEREUM:${this.highestOrder.hash}` });
            console.log(preAcceptBidForm)
            console.log('-------preAccountBidForm: ', preAcceptBidForm);
            const { data: txData, options: txOption } = await getAccpetBidForm(ethWallet.ethereum, config, preAcceptBidForm);
            console.log('-------acceptBidForm: ', txData, txOption)
            console.log(contract)

            const wrapped = await new this.web3.eth.Contract(WETH9.abi, WETH9.address)
            const balance1 = await wrapped.methods.balanceOf(localStorage.getItem("account")).call()

            await contract.methods.matchOrders(
                txData.orderLeft, txData.signatureLeft, txData.orderRight, txData.signatureRight
            ).send(txOption)

            const balance2 = await wrapped.methods.balanceOf(localStorage.getItem("account")).call()
            console.log("withdraw amount", balance1, balance2)

            await wrapped.methods.withdraw(BN.from(balance2).sub(BN.from(balance1))).send({ from: localStorage.getItem("account") })

            await updateBidData({
                from: preAcceptBidForm.order.maker,
                to: preAcceptBidForm.order.maker,
                orderHash: this.highestOrder.hash,
                itemId: `${this.collection.collectionId}:${this.item.id}`,
                amount: this.item.supply,
                price: parseFloat(this.web3.utils.fromWei(txData.orderRight.takeAsset.value))
            });
            setTimeout(() => location.reload(), 3000)
        } catch (e) {
            console.log(e)
            if (e.code == 4001)
                sendAlert("User rejected", "danger", true)
            else
                sendAlert("Transaction failed", "danger", true)
        }

        this.cancelBidButton.disabled = false
        this.acceptBidButton.disabled = false
        this.spinner.style.display = "none"
    }

    cancelBidItem = async (e) => {
        this.cancelBidButton.disabled = true
        this.acceptBidButton.disabled = true
        this.spinner.style.display = "block"

        try {
            console.log("[ Cancelling bid...")
            const config = getEthereumConfig("mumbai");
            const web3 = new Web3(window.ethereum);
            const web3Ethereum = new Web3Ethereum({ web3 });
            const ethWallet = new EthereumWallet(web3Ethereum, "ETHEREUM");
            const v2 = createExchangeV2Contract(ethWallet.ethereum, config.exchange.v2)
            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get("token").split(":")
            const order = await axios.get(`/order/item/${urlParams.get("token")}`)
            // await send(v2.functionCall("cancel", orderToStruct(ethWallet.ethereum, order.data[0])))
            await new this.web3.eth.Contract(WETH9.abi, WETH9.address).methods.withdraw(order.data[0].make.value).send({ from: localStorage.getItem("account") })
            console.log("[ Saving activity...")

            const { data: { success } } = await axios.delete("/order", {
                data: {
                    collectionId: code[0],
                    tokenId: code[1],
                    bidder: localStorage.getItem("account"),
                    activity: {
                        type: 1,
                        collectionId: this.collection.collectionId,
                        tokenId: code[1],
                        summary: `bid cancelled by ${localStorage.getItem("account").slice(0, 4) + "..." + localStorage.getItem("account").slice(localStorage.getItem("account").length - 4, localStorage.getItem("account").length)}`,
                        user: localStorage.getItem("account"),
                        price: 0
                    }
                }
            })
            if (success) {
                setTimeout(() => location.reload(), 3000)
            }
        } catch (e) {
            console.log(e)
            if (e.code == 4001)
                sendAlert("User rejected", "danger", true)
            else
                sendAlert("Transaction failed", "danger", true)
        }

        this.cancelBidButton.disabled = false
        this.acceptBidButton.disabled = false
        this.spinner.style.display = "none"
    }
}

export default ItemDetail