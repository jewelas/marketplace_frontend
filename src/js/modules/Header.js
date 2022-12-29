import axios from "axios"
import Web3 from "web3"
import { sendAlert } from "./utils"

class Header {
  constructor(props) {
    this.props = props
    this.getItems(props.allItems)
    this.getPrice()
    this.getEthInfo()
    this.header = document.querySelector(".js-page-header")
    if (this.header) {
      this.initStickyNavbar()
      this.events()
    }
    document.querySelectorAll(".search-items").forEach(x => x.addEventListener("keyup", e => this.changeSearchInput(e)))
    this.searchResult = document.querySelectorAll(".search-result-panel")
  }

  changeSearchInput = async (e) => {
    let str = ``

    const data = this.items.filter((x, i) => {
      return (x.id.includes(e.target.value) || x.name.toLowerCase().includes(e.target.value.toLowerCase()))
    })
    const userData = this.props.allUsers.filter((x, i) => {
      return (x.name.toLowerCase().includes(e.target.value.toLowerCase())) || (x.wallet.toLowerCase().includes(e.target.value.toLowerCase()))
    })
    for (let i = 0; i < data.filter((x, i) => i >= 0 && i <= 4).length; i++) {
      const media = data[i].filetype == "image" ? `<img class="rounded-xl w-5 h-5 object-cover" src=${data[i].image} />`
        : `<video autoPlay loop muted class="rounded-xl w-5 h-5 object-cover" src=${data[i].image}></video>`
      str += `
        <button onClick="location.href='item.html?token=${data[i].collectionInfo[0].collectionId}:${data[i].id}'" class="dropdown-item font-display text-jacarta-700 dark:hover:bg-jacarta-600 hover:bg-jacarta-50 flex w-full items-center gap-x-5 rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white truncate">
          ${media}
          <span class="truncate">${data[i].name}</span>
        </button>
      `
    }
    for (let j = 0; j < userData.filter((x, i) => i >= 0 && i <= 4).length; j++)
      str += `
        <button onClick="location.href='user.html?user=${userData[j].wallet}'" class="dropdown-item font-display text-jacarta-700 dark:hover:bg-jacarta-600 hover:bg-jacarta-50 flex w-full items-center gap-x-5 rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white truncate">
          <img class="rounded-xl w-5 h-5 object-cover" src=${userData[j].avatar} />
          <span class="truncate">${userData[j].name}</span>
        </button>
      `
    this.searchResult.forEach(x => x.innerHTML = str)
  }

  getItems = async (data) => {
    this.items = await Promise.all(data.map(async (x) => {
      const { data: { name, image: img } } = await axios.get(x.tokenURI)
      const image = img.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${img.slice(7)}` : img
      return {
        ...x,
        name,
        image
      }
    }))
  }

  getEthInfo = async () => {
    const me = this.props.allUsers.filter(x => x.wallet == localStorage.getItem("account"))
    if (localStorage.getItem("account") && localStorage.getItem("sign") && me.length > 0) {
      document.getElementById("profileDropdown").style.display = "flex"
      document.getElementById("connect-wallet").style.display = "none"
      document.querySelectorAll(".js-wallet").forEach(x => x.style.display = "none")
      document.querySelectorAll(".sign-out").forEach(x => x.style.display = "flex")
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        const balance = await web3.eth.getBalance(localStorage.getItem("account"))
        document.querySelectorAll(".eth-balance").forEach(x => x.innerHTML = `${parseFloat(web3.utils.fromWei(balance)).toFixed(4)} WDOGE`)
        document.querySelectorAll(".balance-for-bid").forEach(x => x.innerHTML = `Balance: ${parseFloat(web3.utils.fromWei(balance)).toFixed(4)} WDOGE`)
      }

      document.querySelectorAll(".sign-out").forEach(x => x.addEventListener("click", e => this.signOut(e)))
      document.querySelectorAll(".eth-address").forEach(x => x.innerHTML = localStorage.getItem("account"))
      document.getElementById("bid-amount")?.addEventListener("keyup", e => this.changeAmount(e))
    } else {
      document.getElementById("profileDropdown").style.display = "none"
      document.querySelectorAll(".profile-item").forEach(x => x.style.display = "none")
      // document.getElementById("profileDropdownMobile").style.display = "none"
      document.getElementById("connect-wallet").style.display = "flex"
      document.querySelectorAll(".sign-out").forEach(x => x.style.display = "none")
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

  initStickyNavbar() {
    if (window.scrollY > 0) {
      this.header.classList.add("js-page-header--is-sticky")
    } else {
      this.header.classList.remove("js-page-header--is-sticky")
    }
  }

  events() {
    window.addEventListener("scroll", e => this.initStickyNavbar(e))
  }

  changeAmount = async (e) => {
    document.getElementById("bid-amount-usd").innerHTML = e.target.value == "" ? "$0" : `$${(parseFloat(e.target.value) * this.usdPrice).toFixed(2)}`
  }

  signOut = (e) => {
    localStorage.removeItem("account")
    localStorage.removeItem("sign")
    location.reload()
  }
}

export default Header
