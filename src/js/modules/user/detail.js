import Web3 from 'web3'
import axios from 'axios'
import { followUser, likeItem, sendAlert } from '../utils'
import Share from './share';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const categories = ["Art", "Collectibles", "Domain Names", "Music", "Photography", "Virtual Worlds"]

class UserDetail {
    constructor(props) {
        this.props = props
        this.web3 = new Web3(window.ethereum)

        this.isCollectionOn1 = false
        this.isPriceRangeOn1 = false
        this.isCategoriesOn1 = false
        this.isCollectionOn2 = false
        this.isPriceRangeOn2 = false
        this.isCategoriesOn2 = false
        this.isCollectionOn3 = false
        this.isPriceRangeOn3 = false
        this.isCategoriesOn3 = false

        this.asc = [true, true, true]

        this.searchInput1 = document.getElementById("collection-search-input1")
        this.searchInput2 = document.getElementById("collection-search-input2")
        this.searchInput3 = document.getElementById("collection-search-input3")
        this.followButton = document.getElementById("follow-user")
        this.spinner = document.getElementById("follow-spinner")

        this.getCurrentUser()
        this.getItemData()
        this.getCollections()
        this.events()
    }

    events = () => {
        this.searchInput1.addEventListener("keyup", e => this.changeCollection1(e))
        this.searchInput2.addEventListener("keyup", e => this.changeCollection2(e))
        this.searchInput3.addEventListener("keyup", e => this.changeCollection3(e))
        this.followButton?.addEventListener("click", e => this.followUser(e))

        document.getElementById("apply-price-range1").addEventListener("click", e => this.applyPriceRange1(e))
        document.getElementById("apply-price-range2").addEventListener("click", e => this.applyPriceRange2(e))
        document.getElementById("apply-price-range3").addEventListener("click", e => this.applyPriceRange3(e))
        document.querySelectorAll(".categories1").forEach((x, i) => x.addEventListener("click", e => this.applyCategory1(e, i)))
        document.querySelectorAll(".categories2").forEach((x, i) => x.addEventListener("click", e => this.applyCategory2(e, i)))
        document.querySelectorAll(".categories3").forEach((x, i) => x.addEventListener("click", e => this.applyCategory3(e, i)))

        document.getElementById("clear-collection-search1").addEventListener("click", e => this.clearCollection1(e))
        document.getElementById("clear-collection-search2").addEventListener("click", e => this.clearCollection2(e))
        document.getElementById("clear-collection-search3").addEventListener("click", e => this.clearCollection3(e))
        document.getElementById("clear-categories1").addEventListener("click", e => this.clearCategories1(e))
        document.getElementById("clear-categories2").addEventListener("click", e => this.clearCategories2(e))
        document.getElementById("clear-categories3").addEventListener("click", e => this.clearCategories3(e))
        document.getElementById("clear-price-range1").addEventListener("click", e => this.clearPriceRange1(e))
        document.getElementById("clear-price-range2").addEventListener("click", e => this.clearPriceRange2(e))
        document.getElementById("clear-price-range3").addEventListener("click", e => this.clearPriceRange3(e))

        document.querySelectorAll(".sort1").forEach((x, i) => x.addEventListener("click", e => this.changeSort1(e, i)))
        document.querySelectorAll(".sort2").forEach((x, i) => x.addEventListener("click", e => this.changeSort2(e, i)))
        document.querySelectorAll(".sort3").forEach((x, i) => x.addEventListener("click", e => this.changeSort3(e, i)))
        document.getElementById("verify-check-filter1").addEventListener("click", e => this.changeVerifyFilter(e, 0))
        document.getElementById("verify-check-filter2").addEventListener("click", e => this.changeVerifyFilter(e, 1))
        document.getElementById("verify-check-filter3").addEventListener("click", e => this.changeVerifyFilter(e, 2))

    }

    getCurrentUser = async () => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("user")
        const res = await axios.get(`user/${code != null ? code : localStorage.getItem("account")}`)
        const resMe = await axios.get(`user/${localStorage.getItem("account")}`)
        if (code != null && res.data.users.length == 0) {
            sendAlert("No user", "danger")
            return
        }
        if (code == null && res.data.users.length == 0) {
            sendAlert("Sign in with Metamask again", "danger")
            return
        }
        const userDetail = res.data.users[0]
        this.userDetail = userDetail
        this.meDetail = resMe.data.users[0]

        const joinDate = new Date(userDetail?.createdAt?.slice(0, 10))
        if (code) {
            if (code != localStorage.getItem("account")) {
                document.getElementById("follow-user-button").style.display = "block"
                if (this.meDetail?.followers.some(x => x == userDetail?.wallet))
                    this.followButton.classList.add("js-likes--active")
                else
                    this.followButton.classList.remove("js-likes--active")
            }
        }
        else
            document.getElementById("follow-user-button").style.display = "none"

        document.getElementById("user-name").innerHTML = userDetail?.name
        document.getElementById("user-avatar").src = userDetail?.avatar
        document.querySelectorAll(".user-cover").forEach(x => x.src = userDetail?.cover)
        document.getElementById("user-wallet").innerHTML = code != null ? code : localStorage.getItem("account")
        document.getElementById("user-bio").innerHTML = userDetail?.bio
        document.getElementById("user-email").innerHTML = userDetail?.email
        document.getElementById("user-twitter").innerHTML = userDetail?.twitter
        document.getElementById("user-instagram").innerHTML = userDetail?.instagram
        document.getElementById("user-sitename").innerHTML = userDetail?.yoursitename
        document.getElementById("user-joindate").innerHTML = `Joined ${months[joinDate.getMonth()]} ${joinDate.getFullYear()}`
        document.getElementById("user-followers").innerHTML = `Followers: ${this.meDetail?.followers?.length ?? 0}, Followings: ${resMe.data?.followings?.length ?? 0}`

        //share
        document.getElementById("facebook").removeEventListener("click", () => { })
        document.getElementById("twitter").removeEventListener("click", () => { })
        document.getElementById("telegram").removeEventListener("click", () => { })

        document.getElementById("facebook").addEventListener("click", e => window.open(`https://www.facebook.com/sharer/sharer.php?u=${location.href}&quote=${code != null ? code : localStorage.getItem("account")}'s profile`, 'targetWindow', 'width=700px,height=700px'))
        document.getElementById("twitter").addEventListener("click", e => window.open(`https://twitter.com/share/?url=${location.href}&text=${code != null ? code : localStorage.getItem("account")}'s profile&hashtags=ethereum,polygon,flow,tezos,CleanNFT,solana,immutablex,nonfungible,digitalasset,nft&via=xhibiter`, 'targetWindow', 'width=700px,height=700px'))
        document.getElementById("telegram").addEventListener("click", e => window.open(`https://telegram.me/share/url?url=${location.href}&title=${code != null ? code : localStorage.getItem("account")}'s profile`, 'targetWindow', 'width=700px,height=700px'))
    }

    getItemData = async () => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("user")
        const itemRes = this.props.allItems
        this.ownedFiltered = itemRes.filter(x => x.owner == (code != null ? code : localStorage.getItem("account")))
        this.createdFiltered = itemRes.filter(x => x.creator == (code != null ? code : localStorage.getItem("account")))
        this.onsaleFiltered = this.ownedFiltered.filter(x => x.onsale == true && x.saletype == 0)

        this.owned = itemRes.filter(x => x.owner == localStorage.getItem("account"))
        this.created = itemRes.filter(x => x.creator == localStorage.getItem("account"))
        this.onsale = this.ownedFiltered.filter(x => x.onsale == true && x.saletype == 0)
        await this.getOnSale()
        await this.getOwned()
        await this.getCreated()
    }

    getOnSale = async () => {
        let str = ``
        this.onsaleFiltered = await Promise.all(this.onsaleFiltered.map(async (x) => {
            const { data: { name, image: img } } = await axios.get(x.tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            return {
                ...x,
                name,
                image
            }
        }))
        for (let i = 0; i < this.onsaleFiltered.length; i++) {
            const media = this.onsaleFiltered[i].filetype == "image" ? `<img
                src=${this.onsaleFiltered[i].image}
                alt="item 5"
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
            />`: `<video
                src=${this.onsaleFiltered[i].image}
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
                autoPlay loop muted
            />`
            str += `<article>
                <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                    <figure class="relative">
                        <a href="item.html?token=${this.onsaleFiltered[i].collectionId}:${this.onsaleFiltered[i].id}">
                            ${media}
                        </a>
                        <div class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2">
                            <span
                                class="js-likes like-onsale relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${this.onsaleFiltered[i].likes.some(x => x == localStorage.getItem("account")) ? "js-likes--active" : ""}"
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
                        <span class="dark:text-jacarta-200 text-sm like-num">${this.onsaleFiltered[i].likes.length}</span>
                    </div>
                    <div class="absolute left-3 -bottom-3">
                        <div class="flex -space-x-2">
                            <a href="user.html?user=${this.onsaleFiltered[i].creatorInfo[0].wallet}">
                                <img
                                    src=${this.onsaleFiltered[i].creatorInfo[0].avatar}
                                    alt="creator"
                                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                    data-tippy-content="Creator: Sussygirl"
                                />
                            </a>
                            <a href="user.html?user=${this.onsaleFiltered[i].ownerInfo[0].wallet}">
                                <img
                                    src=${this.onsaleFiltered[i].ownerInfo[0].avatar}
                                    alt="owner"
                                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                    data-tippy-content="Owner: Sussygirl"
                                />
                            </a>
                        </div>
                    </div>
                </figure>
                <div class="mt-7 flex items-center justify-between truncate">
                    <a href="item.html" class="truncate">
                        <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white">${this.onsaleFiltered[i].name}</span>
                    </a>
                </div>
                <div class="mt-2 flex justify-between items-center text-sm">
                    <span class="dark:text-jacarta-200 text-jacarta-700 mr-1">${this.onsaleFiltered[i].price} WDOGE</span>
                    <span class="text-white dark:text-jacarta-100">${this.onsaleFiltered[i].saletype == 0 ? 'Fixed' : 'Bids'}</span>
                </div>

                <div class="mt-8 flex items-center justify-between">
                    <a href="item.html?token=${this.onsaleFiltered[i].collectionId}:${this.onsaleFiltered[i].id}" class="group flex items-center">
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
        document.getElementById("items-on-sale").innerHTML = str
        document.getElementById("sale-count").innerHTML = `On Sale (${this.onsaleFiltered.length})`
        document.querySelectorAll(".like-onsale").forEach((x, i) => x.addEventListener("click", e => this.likeOnSale(e, i, this.onsaleFiltered[i].collectionId, this.onsaleFiltered[i].id)))
    }
    getOwned = async () => {
        let str = ``
        this.ownedFiltered = await Promise.all(this.ownedFiltered.map(async (x) => {
            const { data: { name, image: img } } = await axios.get(x.tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            return {
                ...x,
                name,
                image
            }
        }))
        for (let i = 0; i < this.ownedFiltered.length; i++) {
            const media = this.ownedFiltered[i].filetype == "image" ? `<img
                src=${this.ownedFiltered[i].image}
                alt="item 5"
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
            />` : `<video
                src=${this.ownedFiltered[i].image}
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
                autoPlay loop muted
            />`
            str += `<article>
                    <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                    <figure class="relative">
                        <a href="item.html?token=${this.ownedFiltered[i].collectionId}:${this.ownedFiltered[i].id}">
                            ${media}
                        </a>
                        <div
                        class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2"
                        >
                        <span
                            class="js-likes like-owned relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${this.ownedFiltered[i].likes.some(x => x == localStorage.getItem("account")) ? "js-likes--active" : ""}"
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
                        <span class="dark:text-jacarta-200 text-sm like-num">${this.ownedFiltered[i].likes.length}</span>
                        </div>
                        <div class="absolute left-3 -bottom-3">
                        <div class="flex -space-x-2">
                            <a href="user.html?user=${this.ownedFiltered[i].creatorInfo[0].wallet}">
                                <img
                                    src=${this.ownedFiltered[i].creatorInfo[0].avatar}
                                    alt="creator"
                                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                    data-tippy-content="Creator: Sussygirl"
                                />
                            </a>
                            <a href="user.html?user=${this.ownedFiltered[i].ownerInfo[0].wallet}">
                                <img
                                    src=${this.ownedFiltered[i].ownerInfo[0].avatar}
                                    alt="owner"
                                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                    data-tippy-content="Owner: Sussygirl"
                                />
                            </a>
                        </div>
                        </div>
                    </figure>
                    <div class="mt-7 flex items-center justify-between truncate">
                        <a href="item.html" class="truncate">
                            <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">${this.ownedFiltered[i].name}</span>
                        </a>
                    </div>
                    <div class="mt-2 flex justify-between items-center text-sm">
                        <span class="dark:text-jacarta-200 text-jacarta-700 mr-1">${this.ownedFiltered[i].price} WDOGE</span>
                        <span class="text-white dark:text-jacarta-100">${this.ownedFiltered[i].saletype == 0 ? 'Fixed' : 'Bids'}</span>
                    </div>
                    <div class="mt-8 flex items-center justify-between">
                        <a href="item.html?token=${this.ownedFiltered[i].collectionId}:${this.ownedFiltered[i].id}" class="group flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            class="group-hover:fill-accent dark:fill-jacarta-200 fill-jacarta-500 mr-1 mb-[3px] h-4 w-4"
                        >
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path
                            d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12h2c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8C9.25 4 6.824 5.387 5.385 7.5H8v2H2v-6h2V6c1.824-2.43 4.729-4 8-4zm1 5v4.585l3.243 3.243-1.415 1.415L11 12.413V7h2z"
                            />
                        </svg>
                        <span class="group-hover:text-accent font-display dark:text-jacarta-200 text-sm font-semibold">View History</span>
                        </a>
                    </div>
                    </div>
                </article>
            `
        }
        document.getElementById("items-ownedby-user").innerHTML = str
        document.getElementById("owned-count").innerHTML = `Owned (${this.ownedFiltered.length})`
        document.querySelectorAll(".like-owned").forEach((x, i) => x.addEventListener("click", e => this.likeOwned(e, i, this.ownedFiltered[i].collectionId, this.ownedFiltered[i].id)))
    }
    getCreated = async () => {
        let str = ``
        this.createdFiltered = await Promise.all(this.createdFiltered.map(async (x) => {
            const { data: { name, image: img } } = await axios.get(x.tokenURI)
            const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
            return {
                ...x,
                name,
                image
            }
        }))
        for (let i = 0; i < this.createdFiltered.length; i++) {
            const media = this.createdFiltered[i].filetype == "image" ? `<img
                src=${this.createdFiltered[i].image}
                alt="item 5"
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
            />`: `<video
                src=${this.createdFiltered[i].image}
                style="height: 198px"
                class="w-full rounded-[0.625rem] object-cover"
            />`
            str += `<article>
                    <div class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg">
                    <figure class="relative">
                        <a href="item.html?token=${this.createdFiltered[i].collectionId}:${this.createdFiltered[i].id}">
                            ${media}
                        </a>
                        <div
                        class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2"
                        >
                        <span
                            class="js-likes like-created relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${this.createdFiltered[i].likes.some(x => x == localStorage.getItem("account")) ? "js-likes--active" : ""}"
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
                        <span class="dark:text-jacarta-200 text-sm like-num">${this.createdFiltered[i].likes.length}</span>
                        </div>
                        <div class="absolute left-3 -bottom-3">
                        <div class="flex -space-x-2">
                            <a href="user.html?user=${this.createdFiltered[i].creatorInfo[0].wallet}">
                                <img
                                    src=${this.createdFiltered[i].creatorInfo[0].avatar}
                                    alt="creator"
                                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                    data-tippy-content="Creator: Sussygirl"
                                />
                            </a>
                            <a href="user.html?user=${this.createdFiltered[i].ownerInfo[0].wallet}">
                                <img
                                    src=${this.createdFiltered[i].ownerInfo[0].avatar}                                alt="owner"
                                    class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
                                    data-tippy-content="Owner: Sussygirl"
                                />
                            </a>
                        </div>
                        </div>
                    </figure>
                    <div class="mt-7 flex items-center justify-between truncate">
                        <a href="item.html" class="truncate">
                            <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white truncate">${this.createdFiltered[i].name}</span>
                        </a>
                    </div>
                    <div class="mt-2 flex justify-between items-center text-sm">
                        <span class="dark:text-jacarta-200 text-jacarta-700 mr-1">${this.createdFiltered[i].price} WDOGE</span>
                        <span class="text-white dark:text-jacarta-100">${this.createdFiltered[i].saletype == 0 ? 'Fixed' : 'Bids'}</span>
                    </div>

                    <div class="mt-8 flex items-center justify-between">
                        <a href="item.html?token=${this.createdFiltered[i].collectionId}:${this.createdFiltered[i].id}" class="group flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            class="group-hover:fill-accent dark:fill-jacarta-200 fill-jacarta-500 mr-1 mb-[3px] h-4 w-4"
                        >
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path
                            d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12h2c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8C9.25 4 6.824 5.387 5.385 7.5H8v2H2v-6h2V6c1.824-2.43 4.729-4 8-4zm1 5v4.585l3.243 3.243-1.415 1.415L11 12.413V7h2z"
                            />
                        </svg>
                        <span class="group-hover:text-accent font-display dark:text-jacarta-200 text-sm font-semibold">View History</span>
                        </a>
                    </div>
                    </div>
                </article>
            `
        }
        document.getElementById("items-createdby-user").innerHTML = str
        document.getElementById("created-count").innerHTML = `Created (${this.createdFiltered.length})`
        document.querySelectorAll(".like-created").forEach((x, i) => x.addEventListener("click", e => this.likeCreated(e, i, this.createdFiltered[i].collectionId, this.createdFiltered[i].id)))
    }

    likeCreated = async (e, i, collectionId, tokenId) => {
        const res1 = await axios.get(`item/${collectionId}:${tokenId}`)
        const success = await likeItem(res1.data.items[0].likes, collectionId, tokenId)
        if (success) {
            const res2 = await axios.get(`item/${collectionId}:${tokenId}`)
            document.querySelectorAll(".like-created")[i].classList.toggle("js-likes--active")
            document.querySelectorAll(".like-num")[i].innerHTML = res2.data.items[0].likes.length
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    likeOnSale = async (e, i, collectionId, tokenId) => {
        const res1 = await axios.get(`item/${collectionId}:${tokenId}`)
        const success = await likeItem(res1.data.items[0].likes, collectionId, tokenId)
        if (success) {
            const res2 = await axios.get(`item/${collectionId}:${tokenId}`)
            document.querySelectorAll(".like-onsale")[i].classList.toggle("js-likes--active")
            document.querySelectorAll(".like-num")[i].innerHTML = res2.data.items[0].likes.length
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    likeOwned = async (e, i, collectionId, tokenId) => {
        const res1 = await axios.get(`item/${collectionId}:${tokenId}`)
        const success = await likeItem(res1.data.items[0].likes, collectionId, tokenId)
        if (success) {
            const res2 = await axios.get(`item/${collectionId}:${tokenId}`)
            document.querySelectorAll(".like-owned")[i].classList.toggle("js-likes--active")
            document.querySelectorAll(".like-num")[i].innerHTML = res2.data.items[0].likes.length
            document.getElementById("response-spinner").style.display = "none"
        }
    }

    //Filter
    changeCollection1 = (e) => this.getCollections(e.target.value)
    changeCollection2 = (e) => this.getCollections(e.target.value)
    changeCollection3 = (e) => this.getCollections(e.target.value)
    changeSort1 = (e, i) => {
        document.getElementById("asc-text1").innerHTML = e.target.innerHTML.trim()
        if (i == 0) this.asc[0] = true
        if (i == 1) this.asc[0] = false
        this.apply1()
    }
    changeSort2 = (e, i) => {
        document.getElementById("asc-text2").innerHTML = e.target.innerHTML.trim()
        if (i == 0) this.asc[1] = true
        if (i == 1) this.asc[1] = false
        this.apply2()
    }
    changeSort3 = (e, i) => {
        document.getElementById("asc-text3").innerHTML = e.target.innerHTML.trim()
        if (i == 0) this.asc[2] = true
        if (i == 1) this.asc[2] = false
        this.apply3()
    }

    changeVerifyFilter = (e, type) => {
        if (type == 0) {
            this.showVerified1 = e.currentTarget.checked
            this.apply1()
        }
        if (type == 1) {
            this.showVerified2 = e.currentTarget.checked
            this.apply2()
        }
        if (type == 2) {
            this.showVerified3 = e.currentTarget.checked
            this.apply3()
        }
    }

    applyCollection1 = (e, collectionId) => {
        this.isCollectionOn1 = true
        this.curCollectionId = collectionId
        this.apply1()
    }
    applyCollection2 = (e, collectionId) => {
        this.isCollectionOn2 = true
        this.curCollectionId = collectionId
        this.apply2()
    }
    applyCollection3 = (e, collectionId) => {
        this.isCollectionOn3 = true
        this.curCollectionId = collectionId
        this.apply3()
    }

    applyCategory1 = (e, i) => {
        this.curCategoryId1 = i
        this.isCategoriesOn1 = true
        this.apply1()
    }
    applyCategory2 = (e, i) => {
        this.curCategoryId2 = i
        this.isCategoriesOn2 = true
        this.apply2()
    }
    applyCategory3 = (e, i) => {
        this.curCategoryId3 = i
        this.isCategoriesOn3 = true
        this.apply3()
    }

    applyPriceRange1 = (e) => {
        this.priceFrom1 = parseFloat(document.getElementById("price-from1").value)
        this.priceTo1 = parseFloat(document.getElementById("price-to1").value)
        this.isPriceRangeOn1 = true
        this.apply1()
    }
    applyPriceRange2 = (e) => {
        this.priceFrom2 = parseFloat(document.getElementById("price-from2").value)
        this.priceTo2 = parseFloat(document.getElementById("price-to2").value)
        this.isPriceRangeOn2 = true
        this.apply2()
    }
    applyPriceRange3 = (e) => {
        this.priceFrom3 = parseFloat(document.getElementById("price-from3").value)
        this.priceTo3 = parseFloat(document.getElementById("price-to3").value)
        this.isPriceRangeOn3 = true
        this.apply3()
    }

    clearCollection1 = (e) => {
        this.searchInput1.value = ""
        this.getCollections()

        this.isCollectionOn1 = false
        this.apply1()
    }
    clearCollection2 = (e) => {
        this.searchInput2.value = ""
        this.getCollections()

        this.isCollectionOn2 = false
        this.apply2()
    }
    clearCollection3 = (e) => {
        this.searchInput3.value = ""
        this.getCollections()

        this.isCollectionOn3 = false
        this.apply3()
    }

    clearPriceRange1 = (e) => {
        document.getElementById("price-from1").value = ""
        document.getElementById("price-to1").value = ""
        this.isPriceRangeOn1 = false
        this.apply1()
    }
    clearPriceRange2 = (e) => {
        document.getElementById("price-from2").value = ""
        document.getElementById("price-to2").value = ""
        this.isPriceRangeOn2 = false
        this.apply2()
    }
    clearPriceRange3 = (e) => {
        document.getElementById("price-from3").value = ""
        document.getElementById("price-to3").value = ""
        this.isPriceRangeOn3 = false
        this.apply3()
    }

    clearCategories1 = (e) => {
        this.isCategoriesOn1 = false
        this.apply1()
    }
    clearCategories2 = (e) => {
        this.isCategoriesOn2 = false
        this.apply2()
    }
    clearCategories3 = (e) => {
        this.isCategoriesOn3 = false
        this.apply3()
    }

    apply1 = () => {
        this.onsaleFiltered = this.onsale.filter(x =>
            (this.isCollectionOn1 ? (x.collectionId.search(this.curCollectionId) != -1) : true) &&
            (this.isCategoriesOn1 ? (x.collectionInfo[0].category == categories[this.curCategoryId1]) : true) &&
            (this.isPriceRangeOn1 ? (x.price >= this.priceFrom1 && x.price <= this.priceTo1) : true) &&
            (this.showVerified1 ? x.collectionInfo[0].verified == 1 : true)
        ).sort((a, b) => this.asc[0] ? a.price - b.price : b.price - a.price)
        this.getOnSale()
    }
    apply2 = () => {
        this.ownedFiltered = this.owned.filter(x =>
            (this.isCollectionOn2 ? (x.collectionId.search(this.curCollectionId) != -1) : true) &&
            (this.isCategoriesOn2 ? (x.collectionInfo[0].category == categories[this.curCategoryId2]) : true) &&
            (this.isPriceRangeOn2 ? (x.price >= this.priceFrom2 && x.price <= this.priceTo2) : true) &&
            (this.showVerified2 ? x.collectionInfo[0].verified == 1 : true)
        ).sort((a, b) => this.asc[1] ? a.price - b.price : b.price - a.price)
        this.getOwned()
    }
    apply3 = () => {
        this.createdFiltered = this.created.filter(x =>
            (this.isCollectionOn3 ? (x.collectionId.search(this.curCollectionId) != -1) : true) &&
            (this.isCategoriesOn3 ? (x.collectionInfo[0].category == categories[this.curCategoryId3]) : true) &&
            (this.isPriceRangeOn3 ? (x.price >= this.priceFrom3 && x.price <= this.priceTo3) : true) &&
            (this.showVerified3 ? x.collectionInfo[0].verified == 1 : true)
        ).sort((a, b) => this.asc[2] ? a.price - b.price : b.price - a.price)
        this.getCreated()
    }

    getCollections = async (name) => {
        const data = this.props.allCollections.filter((x, i) => x.name.toLowerCase().search((name ?? "").toLowerCase()) != -1 && i < 5)
        let str1 = ``
        let str2 = ``
        let str3 = ``
        for (let i = 0; i < data.length; i++) {
            str1 += `
            <li>
                <a class="name-item1 cursor-pointer dropdown-item font-display dark:hover:bg-jacarta-600 hover:bg-jacarta-50 flex w-full items-center justify-between rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white">
                    <span class="flex items-center space-x-3">
                        <img
                            src=${data[i].image}
                            class="h-8 w-8 rounded-full"
                            style="min-width: 32px"
                            alt="avatar"
                        />
                        <span class="text-jacarta-700 dark:text-white truncate" style="max-width: 140px">${data[i].name}</span>
                    </span>
                </a>
            </li>
            `
            str2 += `
            <li>
                <a class="name-item2 cursor-pointer dropdown-item font-display dark:hover:bg-jacarta-600 hover:bg-jacarta-50 flex w-full items-center justify-between rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white">
                    <span class="flex items-center space-x-3">
                        <img
                            src=${data[i].image}
                            class="h-8 w-8 rounded-full"
                            style="min-width: 32px"
                            alt="avatar"
                        />
                        <span class="text-jacarta-700 dark:text-white truncate" style="max-width: 140px">${data[i].name}</span>
                    </span>
                </a>
            </li>
            `
            str3 += `
            <li>
                <a class="name-item3 cursor-pointer dropdown-item font-display dark:hover:bg-jacarta-600 hover:bg-jacarta-50 flex w-full items-center justify-between rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white">
                    <span class="flex items-center space-x-3">
                        <img
                            src=${data[i].image}
                            class="h-8 w-8 rounded-full"
                            style="min-width: 32px"
                            alt="avatar"
                        />
                        <span class="text-jacarta-700 dark:text-white truncate" style="max-width: 140px">${data[i].name}</span>
                    </span>
                </a>
            </li>
            `
        }
        document.getElementById("collection-filter1").innerHTML = str1
        document.getElementById("collection-filter2").innerHTML = str2
        document.getElementById("collection-filter3").innerHTML = str3
        document.querySelectorAll(".name-item1").forEach((x, i) => x.addEventListener("click", e => this.applyCollection1(e, data[i].collectionId)))
        document.querySelectorAll(".name-item2").forEach((x, i) => x.addEventListener("click", e => this.applyCollection2(e, data[i].collectionId)))
        document.querySelectorAll(".name-item3").forEach((x, i) => x.addEventListener("click", e => this.applyCollection3(e, data[i].collectionId)))
    }

    followUser = async (e) => {
        if (localStorage.getItem("account") && localStorage.getItem("sign")) {
            this.spinner.style.display = "block"
            const success = await followUser(this.meDetail?.followers, this.userDetail?.wallet)
            if (success) await this.getCurrentUser()
            this.spinner.style.display = "none"
        }
        else {
            sendAlert("Sign in with Metamask", "danger")
        }
    }
}
new Share()
export default UserDetail