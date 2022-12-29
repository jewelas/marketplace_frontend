import axios from 'axios'
import Toastify from 'toastify-js'
import { NFTStorage } from 'nft.storage'
import { approve, getBidForm, getPreBidForm, orderFormToSimpleOrder, convertCurrency } from '../utils/bids'
import { getAccpetBidForm, getPreAcceptBidForm } from '../utils/acceptbid'
import { signOrder } from '@rarible/protocol-ethereum-sdk/build/order/sign-order'
import { Web3Ethereum } from '@rarible/web3-ethereum'
import { EthereumWallet } from '@rarible/sdk-wallet'
import { getEthereumConfig } from '../config'
import { checkLazyOrder, depositToWeth } from '../utils/common'
import { getOrderByHash, getOrdersByItemId, updateBidData, updateBuyData, upsertOrder } from '../apis/order'
import { Exchange, Factory721, WETH9 } from "../../interface/contracts"
import { getPreSellForm, getSellForm } from '../utils/sell'

const storage = new NFTStorage({
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEFCZDcyZUNhQjhEODY5QjNEMmU2QzFGYmJFNmUzNDFjMTc3RjUxNDQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MjI5OTUyNTkxOCwibmFtZSI6IkFydHdpc2UgVXBsb2FkIn0.46kPCGNhJGZrXlxriT2XVs1tMxB-TtYSkftTZKh75g4"
});

export const imageTypes = [
    "image/pjp",
    "image/jpg",
    "image/pjpeg",
    "image/jpeg",
    "image/jfif",
    "image/png",
    "image/gif",
];

export const videoTypes = [
    "video/m4v",
    "video/mp4",
];

export const toMiliseconds = (hrs, min, sec) => (hrs * 60 * 60 + min * 60 + sec) * 1000

export const getIpfsHash = async (file, mt) => {
    let metadata = mt
    metadata.image = file
    const out = await storage.store(metadata);
    return out.url.replace("ipfs://", "")
}

export const fileUpload = async (file) => {
    return `https://ipfs.io/ipfs/${await storage.storeBlob(file)}`
}

export const likeItem = async (likers, collectionId, tokenId) => {
    let suc = false
    if (localStorage.getItem("account") && localStorage.getItem("sign")) {
        document.getElementById("response-spinner").style.display = "block"
        const res = await axios.get(`user/${localStorage.getItem("account")}`)
        if (res.data.users.length > 0) {
            if (!likers.some(x => x == localStorage.getItem("account"))) {
                const { data: { success } } = await axios.post(`/item/like`, {
                    wallet: localStorage.getItem("account"),
                    collectionId,
                    id: tokenId,
                    activity: {
                        type: 2,
                        collectionId,
                        tokenId,
                        summary: `liked by ${localStorage.getItem("account").slice(0, 4) + "..." + localStorage.getItem("account").slice(localStorage.getItem("account").length - 4, localStorage.getItem("account").length)}`,
                        user: localStorage.getItem("account"),
                        price: 0
                    }
                })
                suc = success
            } else {
                const { data: { success } } = await axios.post(`/item/dislike`, {
                    wallet: localStorage.getItem("account"),
                    collectionId,
                    id: tokenId,
                    activity: {
                        type: 2,
                        collectionId,
                        tokenId,
                        summary: `disliked by ${localStorage.getItem("account").slice(0, 4) + "..." + localStorage.getItem("account").slice(localStorage.getItem("account").length - 4, localStorage.getItem("account").length)}`,
                        user: localStorage.getItem("account"),
                        price: 0
                    }
                })
                suc = success
            }
            return suc
        }
        else {
            document.getElementById("response-spinner").style.display = "none"
            sendAlert("Sign in first", "danger")
            return false
        }
    } else {
        document.getElementById("response-spinner").style.display = "none"
        sendAlert("Sign in first", "danger")
        return false
    }
}

export const likeCollection = async (likers, collectionId) => {
    let suc = false
    if (localStorage.getItem("account") && localStorage.getItem("sign")) {
        const res = await axios.get(`user/${localStorage.getItem("account")}`)
        if (res.data.users.length > 0) {
            if (!likers.some(x => x == localStorage.getItem("account"))) {
                const { data: { success } } = await axios.post(`/collection/like`, {
                    wallet: localStorage.getItem("account"),
                    collectionId,
                })
                suc = success
            } else {
                const { data: { success } } = await axios.post(`/collection/dislike`, {
                    wallet: localStorage.getItem("account"),
                    collectionId,
                })
                suc = success
            }
            return suc
        } else {
            sendAlert("Sign in first", "danger")
            return false
        }
    } else return false
}

export const followUser = async (followers, follower) => {
    let suc = false
    if (localStorage.getItem("account") && localStorage.getItem("sign")) {
        const res = await axios.get(`user/${localStorage.getItem("account")}`)
        if (res.data.users.length > 0) {
            console.log(followers, follower)
            if (!followers.some(x => x == follower)) {
                const { data: { success } } = await axios.put(`/user/follow`, {
                    me: localStorage.getItem("account"),
                    follower
                })
                suc = success
            } else {
                const { data: { success } } = await axios.put(`/user/unfollow`, {
                    me: localStorage.getItem("account"),
                    follower
                })
                suc = success
            }
            return suc
        } else {
            sendAlert("Sign in first", "danger")
            return false
        }
    } else return false
}

export const placeABid = async (isCollectionBid, web3, amount, collectionId, tokenId) => {
    if (document.getElementById("place-bid-item")) document.getElementById("place-bid-item").disabled = true
    if (document.getElementById("place-bid-trending-item")) document.getElementById("place-bid-trending-item").disabled = true

    if (localStorage.getItem("account") && localStorage.getItem("sign")) {
        const res = await axios.get(`user/${localStorage.getItem("account")}`)
        if (res.data.users.length > 0) {
            document.getElementById("create-spinner").style.display = "block"
            const web3Ethereum = new Web3Ethereum({ web3 });
            const ethWallet = new EthereumWallet(web3Ethereum, "ETHEREUM");

            const bidData = {
                amount,
                price: parseFloat(document.getElementById("bid-amount").value),
                currency: {
                    '@type': 'ERC20',
                    contract: `ETHEREUM:${WETH9.address}`
                }
            }
            const ordersOfItem = await getOrdersByItemId(`${collectionId}:${tokenId}`)
            if (ordersOfItem.error != 'Not Found' && ordersOfItem.filter(x => x.maker == localStorage.getItem("account")).length > 0) {
                await new web3.eth.Contract(WETH9.abi, WETH9.address).methods.withdraw(ordersOfItem.filter(x => x.maker == localStorage.getItem("account"))[0].make.value).send({ from: localStorage.getItem("account") })
                await axios.delete("/order", {
                    data: {
                        collectionId,
                        tokenId,
                        bidder: localStorage.getItem("account"),
                    }
                })
            }
            const config = getEthereumConfig("mumbai");
            await convertCurrency(ethWallet, config, bidData)
            // console.log('---bidData: ', bidData);
            const orderRequest = await getPreBidForm(bidData, !isCollectionBid ? { itemId: `ETHEREUM:${collectionId}:${tokenId}` } : { collectionId });
            // console.log('---orderRequest: ', orderRequest)
            const orderForm = await getBidForm(ethWallet.ethereum, orderRequest)
            // console.log('---orderForm: ', orderForm)
            const checked = await checkLazyOrder(orderForm);
            // console.log('---checked: ', checked);
            await approve(ethWallet.ethereum, config, "mumbai", checked, true)
            const simpleForm = await orderFormToSimpleOrder(checked);
            // console.log('---simpleForm: ', simpleForm)
            const signature = await signOrder(ethWallet.ethereum, config, simpleForm);
            // console.log('---signature: ', signature)
            const order = {
                ...checked,
                signature,
                collectionId,
                ...(!isCollectionBid && { tokenId })
            }
            // console.log('---order: ', order);
            const reOrder = await upsertOrder({
                order,
                activity: {
                    type: 1,
                    collectionId,
                    ...(!isCollectionBid && { tokenId }),
                    summary: `bid created by ${localStorage.getItem("account").slice(0, 4) + "..." + localStorage.getItem("account").slice(localStorage.getItem("account").length - 4, localStorage.getItem("account").length)}`,
                    user: localStorage.getItem("account"),
                    price: parseFloat(document.getElementById("bid-amount").value)
                }
            });
            document.getElementById("create-spinner").style.display = "none"

            if (document.getElementById("place-bid-item")) document.getElementById("place-bid-item").disabled = false
            if (document.getElementById("place-bid-trending-item")) document.getElementById("place-bid-trending-item").disabled = false
            sendAlert("Bid sent", "info")

            return true
        }
        else
            sendAlert("No user", "danger")
    }
    else
        sendAlert("Sign in first", "danger")
}

export const putOnSale = async (amount, price, web3, collectionId, tokenId) => {
    const web3Ethereum = new Web3Ethereum({ web3 });
    const ethWallet = new EthereumWallet(web3Ethereum, "ETHEREUM");
    console.log(ethWallet.ethereum)

    const sellData = {
        itemId: `ETHEREUM:${collectionId}:${tokenId}`,
        amount, price,
        currency: {
            '@type': 'ETH',
            blockchain: 'ETHEREUM'
        },
    }

    const config = getEthereumConfig("mumbai");
    console.log(ethWallet);

    try {
        console.log('---sellData: ', sellData);
        const orderRequest = await getPreSellForm(sellData);
        console.log('---orderRequest: ', orderRequest)
        const orderForm = await getSellForm(ethWallet.ethereum, orderRequest)
        console.log('---orderForm: ', orderForm)
        const checked = await checkLazyOrder(orderForm);
        console.log('---checked: ', checked);
        await approve(ethWallet.ethereum, config, "mumbai", checked, true)
        const simpleForm = await orderFormToSimpleOrder(checked);
        console.log('---simpleForm: ', simpleForm)
        const signature = await signOrder(ethWallet.ethereum, config, simpleForm);
        console.log('---signature: ', signature)
        const order = {
            ...checked,
            signature,
            collectionId,
            tokenId
        }
        console.log('---order: ', order);
        const reOrder = await upsertOrder({ order })
    } catch (e) {
        console.log(e)
    }
}

export const buyItem = async (amount, price, web3, collectionId, tokenId) => {
    const contract = new web3.eth.Contract(Exchange.abi, Exchange.address)
    document.getElementById("create-spinner").style.display = "block"
    try {
        const buyData = {
            amount,
            itemId: `ETHEREUM:${collectionId}:${tokenId}`,
        };
        const config = getEthereumConfig("mumbai");
        const web3Ethereum = new Web3Ethereum({ web3 });
        const ethWallet = new EthereumWallet(web3Ethereum, "ETHEREUM");

        const res = await axios.post(`/order/byitem`, { collectionId, tokenId })
        const orderHash = res.data.data[0].hash;
        console.log(res.data)

        const preBuyForm = await getPreAcceptBidForm(config, buyData, { orderId: `ETHEREUM:${orderHash}` });
        console.log('-------preSellForm: ', preBuyForm);
        const { data: txData, options: txOption } = await getAccpetBidForm(ethWallet.ethereum, config, preBuyForm);
        console.log('-------buyForm: ', txData, txOption)
        console.log(contract)
        await contract.methods.matchOrders(
            txData.orderLeft, txData.signatureLeft, txData.orderRight, txData.signatureRight
        ).send(txOption)

        await updateBuyData({
            from: preBuyForm.order.maker,
            to: localStorage.getItem("account"),
            orderHash: orderHash,
            itemId: `${collectionId}:${tokenId}`,
            amount: parseFloat(txData.orderRight.takeAsset.value),
            price
        });
        setTimeout(() => location.reload(), 3000)
    } catch (e) {
        console.log(e)
        if (e.code == 4001)
            sendAlert("User rejected", "danger")
        else
            sendAlert("Transaction failed", "danger")
    }
    document.getElementById("create-spinner").style.display = "none"
}

export const sendAlert = (text, type, isTop = false) => {
    Toastify({
        text,
        duration: 7000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: type == "danger" ? "#EF4444" : "rgb(53,56,64)",
            boxShadow: "none",
            fontWeight: "bolder",
            display: "flex",
            alignItems: "center",
            gap: "32px"
        },
        onClick: function () { } // Callback after click
    }).showToast()
}