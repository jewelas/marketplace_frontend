import Web3 from 'web3'
import axios from 'axios'
import Config from '../config'
import { likeItem, likeCollection, placeABid, sendAlert, buyItem } from "../utils"
import Share from '../user/share'
import Royalties from './royalties'

class CollectionDetail {
  constructor() {
    this.web3 = new Web3(window.ethereum)
    this.collectionBid = false
    this.collectionCover = document.getElementById("collection-cover")
    this.collectionImage = document.getElementById("collection-image")
    this.collectionName = document.getElementById("collection-name")
    this.collectionOwner = document.getElementById("collection-owner")
    this.collectionItemCount = document.getElementById("collection-item-count")
    this.collectionDescription = document.getElementById("collection-description")
    this.collectionFloorPrice = document.getElementById("collection-floorprice")
    this.collectionVolume = document.getElementById("collection-volume")
    this.editCoverButton = document.getElementById("edit-cover")
    this.saveCoverButton = document.getElementById("save-cover")
    this.items = document.getElementById("items-in-collection")
    this.ascend = true
    // this.expirations = [-1, 1, 7, 30, 90]
    // this.expirationList = document.querySelectorAll(".expiration-item")
    // this.expirationShow = document.getElementById("expiration-show")
    this.itemCert = document.getElementById("verified")
    this.placeBidButton = document.getElementById("place-bid")
    this.placeBidOnCollectionButton = document.getElementById("collection-bid")
    this.buyButton = document.getElementById("confirm-checkout")
    this.likeCollectionButton = document.getElementById("like-collection")
    this.terms = document.getElementById("terms")
    this.buyNowTerms = document.getElementById("buyNowTerms")
    this.events()
  }

  events = async () => {
    await this.getCurrentCollection()
    this.terms?.addEventListener("change", e => this.changeTerm(e))
    this.buyNowTerms?.addEventListener("change", e => this.buyNowTermChange(e))
    this.buyButton?.addEventListener("click", e => this.buyItem(e))
    this.placeBidButton?.addEventListener("click", e => {
      placeABid(this.collectionBid, this.web3, this.currentSupply, this.collection.collectionId, this.currentItemId)
    })
    this.placeBidOnCollectionButton?.addEventListener("click", e => this.placeBidOnCollection(e))
    this.fileZone?.addEventListener("change", e => this.importImage(e))
    this.likeCollectionButton?.addEventListener("click", e => this.likeCollection(e))

    document.getElementById("cover-zone")?.addEventListener("change", e => this.importCoverImage(e, this.collectionCover))
    document.getElementById("refresh-metadatas").addEventListener("click", e => {
      sendAlert("Check back in a minute...", "info")
      this.refreshMetadatas()
    })
    document.querySelectorAll(".sort").forEach((x, i) => x.addEventListener("click", e => this.changeOrder(e, i)))
    document.getElementById("clear-price-range").addEventListener("click", e => this.clearPriceRange(e))
    document.getElementById("apply-price-range").addEventListener("click", e => this.applyPriceRange(e))
  }

  importCoverImage = (e, zone) => {
    e.preventDefault()
    this.coverFile = e.target.files[0]
    if (this.coverFile) {
      zone.src = URL.createObjectURL(this.coverFile)
      this.saveCoverButton.style.display = "flex"
      this.saveCoverButton.addEventListener("click", e => this.saveCover(e))
      this.editCoverButton.style.display = "none"
    }
    else
      zone.src = ""
  }

  saveCover = async (e) => {
    try {
      this.saveCoverButton.disabled = true
      const data = new FormData()
      data.append("file", this.coverFile)
      data.append("upload_preset", "ml_default")
      data.append("cloud_name", "Honeywell")
      const { url } = await fetch("https://api.cloudinary.com/v1_1/Honeywell/image/upload", {
        method: "post",
        body: data
      }).then(resp => resp.json())
      const { data: { success } } = await axios.put("/collection/savecover", {
        cover: url,
        wallet: localStorage.getItem("account"),
        collectionId: this.collection.collectionId
      })
      if (success) {
        this.saveCoverButton.style.display = "none"
        this.editCoverButton.style.display = "flex"
        this.saveCoverButton.disabled = false
      }
    } catch (e) { console.log(e) }
  }

  verify = async (e) => {
    const { data: { success } } = await axios.put('/collection/verify_request', {
      collectionId: this.collection.collectionId,
      wallet: localStorage.getItem("account")
    })
    if (success) {
      sendAlert("Sent a request", "info")
      this.getCurrentCollection()
    }
  }

  clearPriceRange = (e) => {
    document.getElementById("price-from").value = ""
    document.getElementById("price-to").value = ""
    this.priceOn = false
    this.priceFrom = parseFloat(document.getElementById("price-from").value)
    this.priceTo = parseFloat(document.getElementById("price-to").value)
    this.refreshMetadatas()
  }

  applyPriceRange = (e) => {
    this.priceOn = true
    this.priceFrom = parseFloat(document.getElementById("price-from").value)
    this.priceTo = parseFloat(document.getElementById("price-to").value)
    this.refreshMetadatas()
  }

  changeOrder = (e, i) => {
    document.getElementById("price-order-text").innerHTML = e.target.innerHTML.trim()
    if (i == 0) this.ascend = true
    if (i == 1) this.ascend = false
    this.refreshMetadatas()
  }

  changeTerm = async (e) => {
    if (localStorage.getItem("account") && localStorage.getItem("sign"))
      this.placeBidButton.disabled = !e.currentTarget.checked
  }

  buyNowTermChange = async (e) => {
    this.buyButton.disabled = !e.currentTarget.checked
  }

  initItemsOfCollection = async (data) => {
    let str = ``
    for (let i = 0; i < data.length; i++)
      str += `
      <article>
        <div 
          class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg"
        >
          <figure class="relative">
            <a>
              <div class="relative h-full overflow-hidden rounded-[0.625rem] skeleton" style="height: 198px"></div>
            </a>
            <div
              class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2"
            >
              <span
                class="favorites relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0"
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
              <span class="dark:text-jacarta-200 text-sm">--</span>
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
          <div class="mt-7 flex items-center justify-between">
            <a class="max-w-full truncate">
              <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white">--</span>
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
    this.items.innerHTML = str
  }

  getCurrentCollection = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("collection")
    const { data } = await axios.get(`/collection/${code}`)
    this.collection = data[0]
    if (data[0]) {
      this.collection.tokenIds = await Promise.all(data[0].tokenIds.map(async (x) => {
        const { data: { name, image: img } } = await axios.get(x.tokenURI)
        const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
        return {
          ...x,
          name,
          image
        }
      }))

      this.collectionCover.src = this.collection.cover
      this.collectionImage.src = this.collection.image
      this.collectionName.innerHTML = this.collection.name
      this.collectionOwner.innerHTML = this.collection.ownerInfo[0]?.name ?? ""
      this.collectionOwner.href = this.collection.ownerInfo[0] ? `user.html?user=${this.collection.ownerInfo[0].wallet}` : ""
      this.collectionItemCount.innerHTML = this.collection.tokenIds.length
      this.collectionDescription.innerHTML = this.collection.description
      this.collectionVolume.innerHTML = this.collection.volume.toFixed(2)
      this.collectionFloorPrice.innerHTML = this.collection.tokenIds.length == 0 ? "--" : this.collection.tokenIds.reduce((prev, curr) => prev.price < curr.price ? prev : curr).price

      this.royalties = new Royalties({ collectionId: this.collection.collectionId })
      if (this.collection?.owner == localStorage.getItem("account"))
        this.editCoverButton.style.display = "flex"

      if (this.collection.verified == 1) {
        this.itemCert.style.display = "none"
        document.getElementById("verify-icon").style.display = "flex"
      }
      else
        if (this.collection?.owner == localStorage.getItem("account")) {
          this.itemCert.style.display = "flex"
          this.itemCert.querySelector("span").innerHTML = "Click here to verify if you're a human"
          document.getElementById("verify-request").addEventListener("click", e => this.verify(e))
          document.getElementById("recaptcha").style.display = "block"
        }
      if (this.collection?.owner != localStorage.getItem("account") && this.collection.verified != 1) {
        this.itemCert.style.display = "flex"
        document.getElementById("verify-request").disabled = this.collection.verified
      }

      document.getElementById("scan-link").href = `https://explorer-testnet.dogechain.dog/address/${code}`
      if(this.collection.website && this.collection.website != "") document.getElementById("website-div").style.display = "block"
      if(this.collection.telegram && this.collection.telegram != "") document.getElementById("telegram-div").style.display = "block"
      if(this.collection.discord && this.collection.discord != "") document.getElementById("discord-div").style.display = "block"
      if(this.collection.twitter && this.collection.twitter != "") document.getElementById("twitter-div").style.display = "block"
      document.getElementById("website-link").href = this.collection.website
      document.getElementById("telegram-link").href = `https://t.me/${this.collection.telegram}`
      document.getElementById("discord-link").href = `https://discord.gg/${this.collection.discord}`
      document.getElementById("twitter-link").href = `https://www.twitter.com/${this.collection.twitter}`
      //share
      document.getElementById("facebook").removeEventListener("click", () => { })
      document.getElementById("twitter").removeEventListener("click", () => { })
      document.getElementById("telegram").removeEventListener("click", () => { })

      document.getElementById("facebook").addEventListener("click", e => window.open(`https://www.facebook.com/sharer/sharer.php?u=${location.href}&quote=${this.collection.name}'s profile`, 'targetWindow', 'width=700px,height=700px'))
      document.getElementById("twitter").addEventListener("click", e => window.open(`https://twitter.com/share/?url=${location.href}&text=${this.collection.name}'s profile&hashtags=ethereum,polygon,flow,tezos,CleanNFT,solana,immutablex,nonfungible,digitalasset,nft&via=xhibiter`, 'targetWindow', 'width=700px,height=700px'))
      document.getElementById("telegram").addEventListener("click", e => window.open(`https://telegram.me/share/url?url=${location.href}`, 'targetWindow', 'width=700px,height=700px'))

      if (this.collection.likes.some(x => x == localStorage.getItem("account")))
        this.likeCollectionButton.classList.add("js-likes--active")

      //Get items of collection
      this.refreshMetadatas()
    }
  }

  fetchItemInfoForBuy = async (i, e) => {
    document.getElementById("buy-item-name").innerHTML = this.collection.tokenIds[i].name
    document.getElementById("buy-collection-name").innerHTML = this.collection.name
    document.getElementById("buy-collection-name").href = `collection.html?collection=${this.collection.collectionId}`
    document.getElementById("buy-item-img").src = this.collection.tokenIds[i].image
    document.querySelectorAll(".buy-item-price").forEach(x => x.innerHTML = `${this.collection.tokenIds[i].price} WDOGE`)
  }

  placeBidOnItem = async (itemData, e) => {
    this.currentItemId = itemData.id
    this.currentSupply = itemData.supply
    this.collectionBid = false
  }

  placeBidOnCollection = async (e) => {
    sendAlert("We're still working on floor bids for Dogechain", "danger")
    this.collectionBid = true
  }

  like = async (e, i, data) => {
    const success = await likeItem(data[i].likes, this.collection.collectionId, data[i].id)
    if (success) {
      await this.getCurrentCollection()
      document.getElementById("response-spinner").style.display = "none"
    }
  }

  likeCollection = async (e) => {
    const success = await likeCollection(this.collection.likes, this.collection.collectionId)
    if (success) {
      this.likeCollectionButton.classList.toggle("js-likes--active")
      this.getCurrentCollection()
    }
  }

  refreshMetadata = async (data, e) => {
    e.currentTarget.parentNode.parentNode.parentNode.querySelector("a span").innerHTML = data.name
    e.currentTarget.parentNode.parentNode.parentNode.parentNode.querySelector("figure a img").src = data.image
    sendAlert("Check back in a minute...", "info")
  }

  refreshMetadatas = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("collection")
    let str = ``
    const dataWithoutIpfs = this.collection.tokenIds.filter(x => (this.priceOn ? (x.price >= this.priceFrom && x.price <= this.priceTo) : true)).sort((a, b) => this.ascend ? (a.price - b.price) : (b.price - a.price))
    console.log(this.collection)
    this.initItemsOfCollection(dataWithoutIpfs)
    const data = await Promise.all(dataWithoutIpfs.map(async (x) => {
      const { data: { name, image: img } } = await axios.get(x.tokenURI)
      const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
      return {
        ...x,
        name,
        image
      }
    }))
    if (!data || data?.length == 0) document.getElementById("no-item").style.display = "block"
    else document.getElementById("no-item").style.display = "none"
    for (let i = 0; i < data.length; i++) {
      const media = data[i].filetype === "image" ? `<img
        src="${data[i].image}"
        alt="item ${i}"
        style="height: 198px"
        class="w-full rounded-[0.625rem] object-cover"
      />` : `<video src=${data[i].image} style="height: 198px" class="w-full rounded-[0.625rem] object-cover" autoPlay muted loop />`
      const creatorInfo = data[i].creatorInfo[0] ? `<a href="user.html?user=${data[i].creatorInfo[0].wallet}">
        <img
          src=${data[i].creatorInfo[0].avatar}
          alt="creator"
          class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
          data-tippy-content="Creator: Sussygirl"
        />
      </a>`: ""
      const ownerInfo = data[i].ownerInfo[0] ? `<a href="user.html?user=${data[i].ownerInfo[0].wallet}">
        <img
          src=${data[i].ownerInfo[0].avatar}
          alt="owner"
          class="dark:border-jacarta-600 h-6 w-6 rounded-full border-2 border-white"
          data-tippy-content="Owner: Sussygirl"
        />
      </a>` : ""

      str += `<article>
        <div 
          class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl block border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg"
        >
          <figure class="relative">
            <a href="item.html?token=${code}:${data[i].id}">
              ${media}
            </a>
            <div
              class="dark:bg-jacarta-700 absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2"
            >
              <span
                class="favorites relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${data[i].likes.some(x => x == localStorage.getItem("account")) ? 'js-likes--active' : ''}"
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
              <span class="dark:text-jacarta-200 text-sm">${data[i].likes.length}</span>
            </div>
            <div class="absolute left-3 -bottom-3">
              <div class="flex -space-x-2">
                ${creatorInfo}
                ${ownerInfo}
              </div>
            </div>
          </figure>
          <div class="mt-7 flex items-center justify-between">
            <a href="item.html?token=${code}:${data[i].id}" class="max-w-full truncate">
              <span class="font-display text-jacarta-700 hover:text-accent text-base dark:text-white">${data[i].name}</span>
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
                <button
                  class="dark:hover:bg-jacarta-600 font-display hover:bg-jacarta-50 block w-full rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white disabled:opacity-20 disabled:cursor-not-allowed new-bid-modal item-bid"
                  data-bs-toggle="modal"
                  data-bs-target="#placeBidModal"
                  ${data[i].saletype != 1 || data[i].owner == localStorage.getItem("account") ? 'disabled' : ''}
                >
                  New bid
                </button>
                <hr class="dark:bg-jacarta-600 bg-jacarta-100 my-2 mx-4 h-px border-0" />
                <button
                  class="dark:hover:bg-jacarta-600 font-display hover:bg-jacarta-50 block w-full rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white refresh-meta"
                >
                  Refresh Metadata
                </button>
                <button
                  class="dark:hover:bg-jacarta-600 font-display hover:bg-jacarta-50 block w-full rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white"
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
            <a href="item.html?token=${code}:${data[i].id}" class="group flex items-center">
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
      </article>`
    }
    this.items.innerHTML = str

    document.querySelectorAll(".favorites").forEach((x, i) => x.addEventListener("click", e => this.like(e, i, data)))
    document.querySelectorAll(".buy-button").forEach((x, i) => x.addEventListener("click", () => buyItem(data[i].supply, data[i].price, this.web3, code, data[i].id)))
    document.querySelectorAll(".buy-modal").forEach((x, i) => x.addEventListener("click", e => this.fetchItemInfoForBuy(i, e)))
    document.querySelectorAll(".item-bid").forEach((x, i) => x.addEventListener("click", e => this.placeBidOnItem(data[i], e)))
    document.querySelectorAll(".refresh-meta").forEach(async (x, i) => {
      const { data: { name, image: img } } = await axios.get(this.collection.tokenIds[i].tokenURI)
      x.addEventListener("click", e => this.refreshMetadata({ name, image: img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img }, e))
    })
  }
}

new Config()
new Share()

export default CollectionDetail