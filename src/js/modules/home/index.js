import Web3 from 'web3'
import axios from 'axios'
import Toastify from 'toastify-js'
import { placeABid, likeItem, toMiliseconds, buyItem } from "../utils"

class Home {
    constructor(props) {
        this.props = props
        this.web3 = new Web3(window.ethereum)
        this.placeBidButton = document.getElementById("place-bid-item")
        this.timeRange = 7
        this.ascend = true
        this.categoryName = "All"
        this.events()
        this.getHotBidItems()
        this.getTopCollections()
        this.getAllTrendings()
    }

    events() {
        this.placeBidButton?.addEventListener("click", e => this.confirmBid(e))

        document.getElementById("terms").addEventListener("change", e => this.changeTerm(e))
        document.getElementById("category-all").addEventListener("click", e => this.getTrendingsByCategory("All"))
        document.getElementById("category-art").addEventListener("click", e => this.getTrendingsByCategory("Art"))
        document.getElementById("category-collectibles").addEventListener("click", e => this.getTrendingsByCategory("Collectibles"))
        document.getElementById("category-domain").addEventListener("click", e => this.getTrendingsByCategory("Domain Names"))
        document.getElementById("category-music").addEventListener("click", e => this.getTrendingsByCategory("Music"))
        document.getElementById("category-photography").addEventListener("click", e => this.getTrendingsByCategory("Photography"))
        document.getElementById("category-virtualworld").addEventListener("click", e => this.getTrendingsByCategory("Virtual Worlds"))

        document.getElementById("time-range1").addEventListener("click", e => this.changeTimeRange(e, 1))
        document.getElementById("time-range2").addEventListener("click", e => this.changeTimeRange(e, 7))
        document.getElementById("time-range3").addEventListener("click", e => this.changeTimeRange(e, 30))

        document.querySelectorAll(".price-sort").forEach((x, i) => x.addEventListener("click", e => this.changePriceSort(e, i)))

        document.getElementById("verify-check-filter").addEventListener("change", e => this.changeVerifyFilter(e))
    }

    changePriceSort = (e, i) => {
        if (i == 0) this.ascend = true
        if (i == 1) this.ascend = false
        document.getElementById("price-sort-text").innerHTML = e.target.innerHTML.trim()
        const data = this.data.sort((a, b) => this.ascend ? a.price - b.price : b.price - a.price)
        if (this.categoryName == "All")
            this.renderTrendings(data)
        else
            this.renderTrendings(data.filter(x => x.collectionInfo[0].category == this.categoryName))
    }

    changeTimeRange = async (e, value) => {
        this.timeRange = value
        document.getElementById("collectionSort").innerHTML = e.currentTarget.innerHTML
        this.getTopCollections()
    }

    changeTerm = async (e) => {
        if (localStorage.getItem("account") && localStorage.getItem("sign")) {
            if (this.placeBidButton) this.placeBidButton.disabled = !e.currentTarget.checked
        }
    }

    changeVerifyFilter = (e) => {
        this.showVerified = e.currentTarget.checked
        this.getTrendingsByCategory(this.categoryName)
    }

    confirmBid = async (e) => {
        if (this.bidType == 0)
            placeABid(false, this.web3, this.hotBids[this.placeHotbidIndex].details[0].supply, this.hotBids[this.placeHotbidIndex].collectionId, this.hotBids[this.placeHotbidIndex].tokenId)
        if (this.bidType == 1)
            placeABid(false, this.web3, this.trendingItems[this.placeTrendingIndex].supply, this.trendingItems[this.placeTrendingIndex].collectionId, this.trendingItems[this.placeTrendingIndex].id)
    }

    likeItem = async (i, e) => {
        const item = this.hotBids[i].details[0]
        const success = await likeItem(item.likes, item.collectionId, item.id)

        if (success) {
            const res = await axios.get(`item/${item.collectionId}:${item.id}`)
            document.querySelectorAll(".js-likes")[i].classList.toggle("js-likes--active")
            document.querySelectorAll(".like-num")[i].innerHTML = res.data.items[0].likes.length
            this.hotBids[i].details[0].likes = res.data.items[0].likes
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    initHotBidItems = async (data) => {
        let str = ``
        for (let i = 0; i < data.length; i++) {
            str += `
            <div class="swiper-slide">
                <article>
                    <div
                        class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg"
                    >
                        <div class="relative overflow-hidden w-full rounded-[0.625rem] skeleton" style="min-height: 270px"></div>
                        <div class="mt-4 flex items-center justify-between truncate">
                            <a class="truncate">
                                <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">--</span>
                            </a>
                            <span class="dark:border-jacarta-600 border-jacarta-100 flex items-center whitespace-nowrap rounded-md border py-1 px-2">
                                <span data-tippy-content="WDOGE">
                                <img src="img/chains/WDOGE.png" class="rounded-full mr-1" style="min-width:20px; min-height:20px" width="20" height="20" />
                            </span>
                            <span class="text-green text-sm font-medium tracking-tight">-- WDOGE</span>
                        </span>
                    </div>
                    <div class="mt-2 text-sm">
                        <span class="dark:text-jacarta-300">Highest Bid</span>
                        <span class="dark:text-jacarta-100 text-jacarta-700">-- </span>
                    </div>

                    <div class="mt-8 flex items-center justify-between">
                        <div class="flex items-center space-x-1">
                            <span
                                class="js-likes like-item relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0"
                                data-tippy-content="Favorite"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    class="dark:fill-jacarta-200 fill-jacarta-500 hover:fill-red dark:hover:fill-red h-4 w-4"
                                >
                                    <path fill="none" d="M0 0H24V24H0z" />
                                    <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" />
                                </svg>
                            </span>
                            <span class="dark:text-jacarta-200 text-sm like-num">--</span>
                        </div>
                    </div>
                </div>
            </article>
        </div>
        `
        }
        document.getElementById("hot-bid-items").innerHTML = str
    }

    getHotBidItems = async () => {
        const res = await axios.get("/order/hotbids")
        const dataWithoutIpfs = res.data.filter(x => x.details[0].saletype == 1)
        this.initHotBidItems(dataWithoutIpfs)
        const data = await Promise.all(dataWithoutIpfs.map(async (x) => {
            const { data: { name, image: img } } = await axios.get(x.details[0].tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            return {
                ...x,
                name,
                image
            }
        }))
        this.hotBids = data
        let str = ``
        if (!data || data?.length == 0) document.getElementById("hot-bid-items").innerHTML = "<div class='text-jacarta-700 dark:text-white text-center w-full'>No items</div>"
        else {
            for (let i = 0; i < data.length; i++) {
                const itemDe = await axios.get(`collection/${data[i].collectionId}`)
                const media = data[i].details[0].filetype == "image" ? `<img
                    src="${data[i].image}"
                    alt="item 1"
                    width="270"
                    style="height: 270px"
                    class="w-full rounded-[0.625rem] object-cover"
                />` : `<video
                    src="${data[i].image}"
                    width="270"
                    style="height: 270px"
                    class="w-full rounded-[0.625rem] object-cover"
                    autoPlay loop muted
                />`
                const placeButtonContent = `<button
                        type="button"
                        class="text-accent font-display text-sm font-semibold place-bid-item ${data[i].saletype == 0 || data[i].owner == localStorage.getItem("account") ? 'hidden' : ''}"
                        data-bs-toggle="modal"
                        data-bs-target="#placeBidModal"
                    >
                        Place bid
                    </button>
                `
                str += `<div class="swiper-slide" style="width: 311px; margin-right: 30px">
                    <article>
                        <div
                            class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg"
                        >
                            <figure>
                                <a href="item.html?token=${data[i].collectionId}:${data[i].tokenId}">
                                    ${media}
                                </a>
                            </figure>
                            <div class="mt-4 flex items-center justify-between truncate">
                                <a href="item.html?token=${data[i].collectionId}:${data[i].tokenId}" class="truncate">
                                    <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">${data[i].name}</span>
                                </a>
                                <span class="dark:border-jacarta-600 border-jacarta-100 flex items-center whitespace-nowrap rounded-md border py-1 px-2">
                                    <span data-tippy-content="WDOGE">
                                    <img src="img/chains/WDOGE.png" class="rounded-full mr-1" style="min-width:20px; min-height:20px" width="20" height="20" />
                                </span>
                                <span class="text-green text-sm font-medium tracking-tight">${data[i].details[0].price} WDOGE</span>
                            </span>
                        </div>
                        <div class="mt-2 flex justify-between items-center">
                            <div class="text-sm">
                                <span class="dark:text-jacarta-300">Highest Bid</span>
                                <span class="dark:text-jacarta-100 text-jacarta-700">${parseFloat(this.web3.utils.fromWei(data[i].make.value)).toFixed(2)} </span>
                            </div>
                            <div class="text-sm text-white dark:text-jacarta-100">${data[i].details[0].saletype == 0 ? 'Fixed' : 'Bids'}</div>
                        </div>

                        <div class="mt-8 flex items-center justify-between">
                            ${itemDe.data[0].owner != localStorage.getItem("account") ? placeButtonContent : ""}
                            <div class="flex items-center space-x-1">
                                <span
                                    class="js-likes like-item relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${data[i].details[0].likes.some(x => x == localStorage.getItem("account")) ? "js-likes--active" : ""}"
                                    data-tippy-content="Favorite"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        class="dark:fill-jacarta-200 fill-jacarta-500 hover:fill-red dark:hover:fill-red h-4 w-4"
                                    >
                                        <path fill="none" d="M0 0H24V24H0z" />
                                        <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" />
                                    </svg>
                                </span>
                                <span class="dark:text-jacarta-200 text-sm like-num">${data[i].details[0].likes.length}</span>
                            </div>
                        </div>
                    </div>
                    </article>
                </div>
                `
            }
            document.getElementById("hot-bid-items").innerHTML = str
            document.querySelectorAll(".place-bid-item").forEach((x, i) => x.addEventListener("click", e => this.setHotBidIndex(e, i)))
            document.querySelectorAll(".like-item").forEach((x, i) => x.addEventListener("click", e => this.likeItem(i, e)))
        }
    }

    initTopCollections = async (data) => {
        let str = ``
        for (let i = 0; i < data.length; i++)
            str += `
            <div class="border-jacarta-100 dark:bg-jacarta-700 rounded-2.5xl flex border bg-white py-3 px-3 transition-shadow hover:shadow-lg dark:border-transparent truncate">
                <figure class="mr-4 shrink-0">
                    <a class="relative block h-full">
                        <div class="relative h-full rounded-2lg overflow-hidden skeleton" style="width: 80px"></div>
                        <div class="dark:border-jacarta-600 bg-jacarta-700 absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-2/4 items-center justify-center rounded-full border-2 border-white text-xs text-white">
                            ${i + 1}
                        </div>
                    </a>
                </figure>
                <div class="truncate">
                    <a class="block truncate">
                        <span class="font-display text-jacarta-700 hover:text-accent font-semibold dark:text-white truncate">--</span>
                    </a>
                    <span class="dark:text-jacarta-300 text-sm">-- WDOGE </span>
                    <div class="mt-2 flex items-center">
                        <img src="img/user/user_avatar.gif" alt="owner" class="h-5 w-5 rounded-full object-cover" />
                        <span class="ml-2 dark:text-jacarta-300 text-sm truncate">--</span>
                    </div>
                </div>
            </div>
            `
        document.getElementById("top-collections").innerHTML = str
    }

    getTopCollections = async () => {
        const { data } = await axios.get('/collection/top/10')
        this.initTopCollections(data)
        const newData = data.map(x => ({
            ...x,
            totalVolume: x.trade.filter(y => y.collectionId == x.collectionId && new Date().getTime() - new Date(y.createdAt).getTime() < toMiliseconds(24 * this.timeRange, 0, 0)).reduce((accumulator, each) => accumulator + each.amount, 0)
        }))
        newData.sort((a, b) => b.totalVolume - a.totalVolume)
        let str = ``
        if (!newData || newData?.length == 0) {
            document.getElementById("top-collections").style.display = "flex"
            document.getElementById("top-collections").innerHTML = "<div class='text-jacarta-700 dark:text-white text-center w-full'>No collections</div>"
        }
        else {
            for (let i = 0; i < newData.length; i++) {
                const media = `<img src=${newData[i].image} alt="avatar 1" class="h-full rounded-2lg object-cover" style="width: 80px;" />`
                const verifyIcon = `<div class="dark:border-jacarta-600 bg-green absolute -left-0 bottom-[0%] -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white" data-tippy-content="Verified Collection">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        class="h-[.875rem] w-[.875rem] fill-white"
                    >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                    </svg>
                </div>`
                const ownerInfo = newData[i].ownerInfo[0] ? `<a href="user.html?user=${newData[i].ownerInfo[0].wallet}" class="mt-2 flex items-center">
                    <img src=${newData[i].ownerInfo[0].avatar} alt="owner" class="h-5 w-5 rounded-full object-cover" />
                    <span class="ml-2 dark:text-jacarta-300 text-sm truncate">${newData[i].ownerInfo[0].name}</span>
                </a>`: ""
                str +=
                    `<div class="border-jacarta-100 dark:bg-jacarta-700 rounded-2.5xl flex border bg-white py-3 px-3 transition-shadow hover:shadow-lg dark:border-transparent truncate">
                        <figure class="mr-4 shrink-0">
                            <a href="collection.html?collection=${newData[i].collectionId}" class="relative block h-full">
                                ${media}
                                <div class="dark:border-jacarta-600 bg-jacarta-700 absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-2/4 items-center justify-center rounded-full border-2 border-white text-xs text-white">
                                    ${i + 1}
                                </div>
                                ${newData[i].verified === 1 ? verifyIcon : ""}
                            </a>
                        </figure>
                        <div class="truncate">
                            <a href="collection.html?collection=${newData[i].collectionId}" class="block truncate">
                                <span class="font-display text-jacarta-700 hover:text-accent font-semibold dark:text-white truncate">${newData[i].name}</span>
                            </a>
                            <span class="dark:text-jacarta-300 text-sm">${newData[i].totalVolume.toFixed(1)} WDOGE </span>
                            ${ownerInfo}
                        </div>
                    </div>
            `
            }
            document.getElementById("top-collections").innerHTML = str
        }
    }

    likeTrending = async (e, i, collectionId, tokenId) => {
        const res1 = await axios.get(`item/${collectionId}:${tokenId}`)
        const success = await likeItem(res1.data.items[0].likes, collectionId, tokenId)
        if (success) {
            const res2 = await axios.get(`item/${collectionId}:${tokenId}`)
            document.querySelectorAll(".like-trending")[i].classList.toggle("js-likes--active")
            document.querySelectorAll(".like-trending-num")[i].innerHTML = res2.data.items[0].likes.length
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    setHotBidIndex = async (e, i) => {
        this.bidType = 0
        this.placeHotbidIndex = i
    }

    setTrendingIndex = async (e, i) => {
        this.bidType = 1
        this.placeTrendingIndex = i
    }

    refreshMetadata = (data, e) => {
        e.currentTarget.parentNode.parentNode.parentNode.querySelector("a span").innerHTML = data.name
        e.currentTarget.parentNode.parentNode.parentNode.parentNode.querySelector("figure a img").src = data.image
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
    }

    getTrendingsByCategory = async (categoryName) => {
        this.categoryName = categoryName
        this.data = this.props.allItems
        if (categoryName == "All")
            this.renderTrendings(this.data.filter(x => this.showVerified ? x.collectionInfo[0].verified == 1 : true))
        else
            this.renderTrendings(this.data.filter(x => (this.showVerified ? x.collectionInfo[0].verified == 1 : true) && x.collectionInfo[0].category == categoryName))
    }

    getAllTrendings = async () => {
        this.data = this.props.allItems.sort((a, b) => this.ascend ? a.price - b.price : b.price - a.price)
        this.renderTrendings(this.data)
    }

    initTrendings = async (data) => {
        let str = ``
        for (let i = 0; i < data.length; i++)
            str += `
            <article>
                <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                    <figure class="relative">
                        <a>
                            <div class="relative w-full overflow-hidden rounded-[0.625rem] skeleton" style="height: 198px"></div>
                        </a>
                        <div class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2">
                            <span
                                class="js-likes like-trending relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0"
                                data-tippy-content="Favorite"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    class="dark:fill-jacarta-200 fill-jacarta-500 hover:fill-red dark:hover:fill-red h-4 w-4"
                                >
                                    <path fill="none" d="M0 0H24V24H0z" />
                                    <path
                                        d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z"
                                    />
                                </svg>
                            </span>
                            <span class="dark:text-jacarta-200 text-sm like-trending-num">--</span>
                        </div>
                        <div class="absolute left-3 -bottom-3">
                            <div class="flex -space-x-2">
                                <a>
                                    <img
                                        src="img/avatars/creator_1.png"
                                        alt="creator"
                                        class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                        data-tippy-content="Creator: Sussygirl"
                                    />
                                </a>
                                <a>
                                    <img
                                        src="img/avatars/owner_1.png"
                                        alt="owner"
                                        class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                        data-tippy-content="Owner: Sussygirl"
                                    />
                                </a>
                            </div>
                        </div>
                    </figure>
                    <div class="mt-7 flex items-center justify-between truncate">
                        <a class="truncate">
                            <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">--</span>
                        </a>
                        <div class="dark:hover:bg-jacarta-600 dropup hover:bg-jacarta-100 rounded-full">
                            <a
                                href="#"
                                class="dropdown-toggle inline-flex h-8 w-8 items-center justify-center text-sm"
                                role="button"
                                id="itemActions"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <svg
                                    width="16"
                                    height="4"
                                    viewBox="0 0 16 4"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="dark:fill-jacarta-200 fill-jacarta-500"
                                >
                                    <circle cx="2" cy="2" r="2" />
                                    <circle cx="8" cy="2" r="2" />
                                    <circle cx="14" cy="2" r="2" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div class="mt-2 text-sm">
                        <span class="dark:text-jacarta-200 text-jacarta-700 mr-1">-- WDOGE</span>
                    </div>

                    <div class="mt-8 flex items-center justify-between">
                        <button
                            class="text-accent font-display text-sm font-semibold disabled:opacity-20 disabled:cursor-not-allowed buy-button" disabled
                        >
                            Buy now
                        </button>
                        <a class="group flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                class="group-hover:fill-accent dark:fill-jacarta-200 fill-jacarta-500 mr-1 mb-[3px] h-4 w-4"
                            >
                                <path fill="none" d="M0 0H24V24H0z" />
                                <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12h2c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8C9.25 4 6.824 5.387 5.385 7.5H8v2H2v-6h2V6c1.824-2.43 4.729-4 8-4zm1 5v4.585l3.243 3.243-1.415 1.415L11 12.413V7h2z" />
                            </svg>
                            <span class="group-hover:text-accent font-display dark:text-jacarta-200 text-sm font-semibold">View History</span>
                        </a>
                    </div>
                </div>
            </article>
            `
        document.getElementById("trendings").innerHTML = str
    }

    renderTrendings = async (dataWithoutIpfs) => {
        let str = ``
        this.initTrendings(dataWithoutIpfs)
        const data = await Promise.all(dataWithoutIpfs.map(async (x) => {
            const { data: { name, image: img } } = await axios.get(x.tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            return {
                ...x,
                name,
                image
            }
        }))
        this.trendingItems = data
        if (!data || data?.length == 0) document.getElementById("trendings-no-item").style.display = "block"
        else document.getElementById("trendings-no-item").style.display = "none"
        for (let i = 0; i < data.length; i++) {
            const media = data[i].filetype == "image" ? `<img
                src=${data[i].image}
                alt="item 5"
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
            />`: `<video
                src=${data[i].image}
                alt="item 5"
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
                autoPlay loop muted
            />`
            const creatorInfo = data[i].creatorInfo[0] ? `<a href="user.html?user=${data[i].creatorInfo[0].wallet}">
                <img
                    src=${data[i].creatorInfo[0].avatar}
                    alt="creator"
                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                    data-tippy-content="Creator: Sussygirl"
                />
            </a>`: ''
            const ownerInfo = data[i].ownerInfo[0] ? `<a href="user.html?user=${data[i].ownerInfo[0].wallet}">
                <img
                    src=${data[i].ownerInfo[0].avatar}
                    alt="owner"
                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                    data-tippy-content="Owner: Sussygirl"
                />
            </a>`: ''

            str += `
                <article>
                    <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                        <figure class="relative">
                            <a href="item.html?token=${data[i].collectionId}:${data[i].id}">
                                ${media}
                            </a>
                            <div class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2">
                                <span
                                    class="js-likes like-trending relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${data[i].likes.some(x => x == localStorage.getItem("account")) ? "js-likes--active" : ""}"
                                    data-tippy-content="Favorite"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        class="dark:fill-jacarta-200 fill-jacarta-500 hover:fill-red dark:hover:fill-red h-4 w-4"
                                    >
                                        <path fill="none" d="M0 0H24V24H0z" />
                                        <path
                                            d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z"
                                        />
                                    </svg>
                                </span>
                                <span class="dark:text-jacarta-200 text-sm like-trending-num">${data[i].likes.length}</span>
                            </div>
                            <div class="absolute left-3 -bottom-3">
                                <div class="flex -space-x-2">
                                    ${creatorInfo}
                                    ${ownerInfo}
                                </div>
                            </div>
                        </figure>
                        <div class="mt-7 flex items-center justify-between truncate">
                            <a class="truncate">
                                <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">${data[i].name}</span>
                            </a>
                            <div class="dark:hover:bg-jacarta-600 dropup hover:bg-jacarta-100 rounded-full">
                                <a
                                    href="#"
                                    class="dropdown-toggle inline-flex h-8 w-8 items-center justify-center text-sm"
                                    role="button"
                                    id="itemActions"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <svg
                                        width="16"
                                        height="4"
                                        viewBox="0 0 16 4"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="dark:fill-jacarta-200 fill-jacarta-500"
                                    >
                                        <circle cx="2" cy="2" r="2" />
                                        <circle cx="8" cy="2" r="2" />
                                        <circle cx="14" cy="2" r="2" />
                                    </svg>
                                </a>
                                <div
                                    class="dropdown-menu dropdown-menu-end dark:bg-jacarta-800 z-10 hidden min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl"
                                    aria-labelledby="itemActions"
                                >
                                    <button class="dark:hover:bg-jacarta-600 font-display hover:bg-jacarta-50 block w-full rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white disabled:opacity-20 disabled:cursor-not-allowed new-bid-trend"
                                        data-bs-toggle="modal"
                                        data-bs-target="#placeBidModal"
                                        ${data[i].saletype != 1 || data[i].owner == localStorage.getItem("account") ? "disabled" : ""}
                                    >
                                        New bid
                                    </button>
                                    <hr class="dark:bg-jacarta-600 bg-jacarta-100 my-2 mx-4 h-px border-0" />
                                    <button class="dark:hover:bg-jacarta-600 font-display hover:bg-jacarta-50 block w-full rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white refresh-meta">
                                        Refresh Metadata
                                    </button>
                                    <button class="dark:hover:bg-jacarta-600 font-display hover:bg-jacarta-50 block w-full rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                                        data-bs-toggle="modal"
                                        data-bs-target="#reportModal"
                                    >
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="mt-2 flex justify-between items-center">
                            <span class="dark:text-jacarta-200 text-jacarta-700 mr-1">${data[i].price} WDOGE</span>
                            <span class="text-sm text-white dark:text-jacarta-100">${data[i].saletype == 0 ? 'Fixed' : 'Bids'}</span>
                        </div>

                        <div class="mt-8 flex items-center justify-between">
                            <button
                                class="text-accent font-display text-sm font-semibold disabled:opacity-20 disabled:cursor-not-allowed buy-button"
                                ${data[i].onsale && data[i].saletype == 0 && localStorage.getItem("account") && data[i].owner != localStorage.getItem("account") ? '' : 'disabled'}
                            >
                                Buy now
                            </button>
                            <a href="item.html?token=${data[i].collectionId}:${data[i].id}" class="group flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    class="group-hover:fill-accent dark:fill-jacarta-200 fill-jacarta-500 mr-1 mb-[3px] h-4 w-4"
                                >
                                    <path fill="none" d="M0 0H24V24H0z" />
                                    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12h2c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8C9.25 4 6.824 5.387 5.385 7.5H8v2H2v-6h2V6c1.824-2.43 4.729-4 8-4zm1 5v4.585l3.243 3.243-1.415 1.415L11 12.413V7h2z" />
                                </svg>
                                <span class="group-hover:text-accent font-display dark:text-jacarta-200 text-sm font-semibold">View History</span>
                            </a>
                        </div>
                    </div>
                </article>
            `
        }
        document.getElementById("trendings").innerHTML = str
        document.querySelectorAll(".new-bid-trend").forEach((x, i) => x.addEventListener("click", e => this.setTrendingIndex(e, i)))
        document.querySelectorAll(".buy-button").forEach((x, i) => x.addEventListener("click", () => buyItem(data[i].supply, data[i].price, this.web3, data[i].collectionId, data[i].id)))
        document.querySelectorAll(".like-trending").forEach((x, i) => x.addEventListener("click", e => this.likeTrending(e, i, data[i].collectionId, data[i].id)))
        document.querySelectorAll(".refresh-meta").forEach(async (x, i) => {
            const { data: { name, image: img } } = await axios.get(data[i].tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            x.addEventListener("click", e => this.refreshMetadata({ name, image }, e))
        })
    }
}

export default Home