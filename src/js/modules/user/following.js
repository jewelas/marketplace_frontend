import Web3 from 'web3'
import axios from "axios"
import { buyItem, likeItem, placeABid } from "../utils"

class Following {
    constructor(props) {
        this.props = props
        this.web3 = new Web3(window.ethereum)
        this.placeBidButton = document.getElementById("place-bid-item")
        this.get()
        this.events()
    }

    events = () => {
        this.placeBidButton?.addEventListener("click", e => this.confirmBid(e))
    }

    confirmBid = async (e) => {
        placeABid(false, this.web3, this.followingItems[this.placeFollowingIndex].supply, this.followingItems[this.placeFollowingIndex].collectionId, this.followingItems[this.placeFollowingIndex].id)
    }

    likeFollowing = async (e, i, collectionId, tokenId) => {
        const res1 = await axios.get(`item/${collectionId}:${tokenId}`)
        const success = await likeItem(res1.data.items[0].likes, collectionId, tokenId)
        if (success) {
            const res2 = await axios.get(`item/${collectionId}:${tokenId}`)
            document.querySelectorAll(".like-following")[i].classList.toggle("js-likes--active")
            document.querySelectorAll(".like-following-num")[i].innerHTML = res2.data.items[0].likes.length
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    setFollowingIndex = async (e, i) => {
        this.placeFollowingIndex = i
    }

    initFollowing = async (data) => {
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
                                class="js-likes like-following relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0"
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
                            <span class="dark:text-jacarta-200 text-sm like-following-num">--</span>
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
        document.getElementById("following").innerHTML = str
    }

    get = async () => {
        let dataWithoutIpfs = []
        let str = ``
        const people = this.props.allUsers.filter(x => x.wallet == localStorage.getItem("account"))[0].followers
        for (let i = 0; i < people.length; i++) {
            dataWithoutIpfs = dataWithoutIpfs.concat(this.props.allItems.filter(x => x.owner == people[i]))
        }
        this.initFollowing(dataWithoutIpfs)
        const data = await Promise.all(dataWithoutIpfs.map(async (x) => {
            const { data: { name, image: img } } = await axios.get(x.tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            return {
                ...x,
                name,
                image
            }
        }))
        this.followingItems = data
        console.log(data)
        if (!data || data?.length == 0) document.getElementById("no-follow").style.display = "block"
        else document.getElementById("no-follow").style.display = "none"
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
            </a>`:''
            const ownerInfo = data[i].ownerInfo[0] ? `<a href="user.html?user=${data[i].ownerInfo[0].wallet}">
                <img
                    src=${data[i].ownerInfo[0].avatar}
                    alt="owner"
                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                    data-tippy-content="Owner: Sussygirl"
                />
            </a>`:''
            str += `
                <article>
                    <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                        <figure class="relative">
                            <a href="item.html?token=${data[i].collectionId}:${data[i].id}">
                                ${media}
                            </a>
                            <div class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2">
                                <span
                                    class="js-likes like-following relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${data[i].likes.some(x => x == localStorage.getItem("account")) ? "js-likes--active" : ""}"
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
                                <span class="dark:text-jacarta-200 text-sm like-following-num">${data[i].likes.length}</span>
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
                                    <button class="dark:hover:bg-jacarta-600 font-display hover:bg-jacarta-50 block w-full rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white disabled:opacity-20 disabled:cursor-not-allowed new-bid-following"
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
        document.getElementById("following").innerHTML = str
        document.querySelectorAll(".new-bid-following").forEach((x, i) => x.addEventListener("click", e => this.setFollowingIndex(e, i)))
        document.querySelectorAll(".buy-button").forEach((x, i) => x.addEventListener("click", () => buyItem(data[i].supply, data[i].price, this.web3, data[i].collectionId, data[i].id)))
        document.querySelectorAll(".like-following").forEach((x, i) => x.addEventListener("click", e => this.likeFollowing(e, i, data[i].collectionId, data[i].id)))
    }
}

export default Following