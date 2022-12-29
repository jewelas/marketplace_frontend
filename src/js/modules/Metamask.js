import Web3 from 'web3'
import axios from "axios"
import detectEthereumProvider from "@metamask/detect-provider"
import { sendAlert } from './utils'

class Metamask {
  signed = false
  constructor() {
    this.walletIcon = document.querySelectorAll(".js-wallet")
    this.walletModal = document.querySelector("#walletModal")
    this.events()
    this.detectMetamask()
  }

  events() {
    this.walletIcon.forEach(wallet => {
      wallet.addEventListener("click", e => this.iconOnClick(e))
    })
  }

  iconOnClick = async (e) => {
    e.preventDefault()
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
    } catch (e) {
      if (e.code == -32002)
        sendAlert("Already processing signing in")
    }
    if (!this.walletConnected) {
      console.log("Please install MetaMask!")
    } else {
      console.log("Ethereum successfully detected!")
      this.walletIcon.forEach(wallet => {
        wallet.removeAttribute("data-bs-toggle")
        wallet.removeAttribute("data-bs-target")
      })

      try {
        await this.handleAccountChanged()
      } catch (error) {
        console.log(error)
      }
    }
  }

  handleChains = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x238" }]
      })
    } catch (e) {
      if (e.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x238',
                chainName: 'Dogechain Testnet',
                rpcUrls: ['https://rpc-testnet.dogechain.dog'],
                blockExplorerUrls: ['https://explorer-testnet.dogechain.dog'],
                nativeCurrency: {
                  name: 'WDOGE',
                  symbol: 'WDOGE',
                  decimals: 18
                },
              },
            ],
          });
        } catch (e) { console.log(e) }
      }
    }
  }

  handleAccountChanged = async () => {
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
    window.web3 = new Web3(window.ethereum)
    localStorage.setItem('account', accounts[0])

    //Get user profile from DB
    const { data: { users } } = await axios.get(`/user/${accounts[0]}`)

    //Personal sign
    if (!localStorage.getItem("sign") || !users || users.length == 0) {
      const sign = await window.web3.eth.personal.sign(
        `Welcome, ${accounts[0]}`,
        accounts[0],
        ""
      )
      localStorage.setItem("sign", sign)
      const { data: { success } } = await axios.post(`/user`, {
        wallet: accounts[0].toLowerCase(),
        name: "XhibitMan",
        bio: "I make art with the simple goal of giving you something pleasing to look at for a few seconds.",
        avatar: "img/user/user_avatar.gif"
      })
      if (success) location.href = "collections.html"
    }
  }

  async detectMetamask() {
    const provider = await detectEthereumProvider({ silent: true })
    if (provider) {
      await this.handleChains()
      this.walletIcon.forEach(wallet => {
        wallet.removeAttribute("data-bs-toggle")
        wallet.removeAttribute("data-bs-target")
      })
      await window.ethereum.request({ method: "eth_requestAccounts" })
      const accounts = await ethereum.request({ method: "eth_accounts" })
      document.querySelectorAll(".my-wallet").forEach(x => x.innerHTML = accounts[0])
      this.walletConnected = true
      this.walletIcon.forEach(wallet => {
        wallet.removeAttribute("data-bs-toggle")
        wallet.removeAttribute("data-bs-target")
      })
      window.ethereum.on('accountsChanged', function (accounts) {
        localStorage.removeItem("account")
        localStorage.removeItem("sign")
        location.reload()
      })
    } else {
      this.walletConnected = false
    }
  }
}

export default Metamask
