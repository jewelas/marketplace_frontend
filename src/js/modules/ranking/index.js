import Web3 from 'web3'
import axios from 'axios'
import { toMiliseconds } from '../utils'

class Ranking {
    constructor() {
        this.web3 = new Web3(window.ethereum)
        this.currentCategory = "All"
        this.timeRange = 7
        this.events()
        this.getRankings()
    }

    events() {
        document.querySelectorAll(".category").forEach((x, i) => x.addEventListener("click", e => this.changeCategory(e, i)))
    }

    changeCategory = (e, i) => {
        if (i == 0) {
            document.getElementById("category-text").innerHTML = "All Categories"
            this.currentCategory = "All"
        }
        else {
            document.getElementById("category-text").innerHTML = e.target.innerHTML.trim()
            this.currentCategory = e.target.innerHTML.trim()
        }
        this.renderRankings(this.data)
    }

    getRankings = async () => {
        const { data } = await axios.get('/collection/top/-1')
        this.data = data
        this.renderRankings(data)
    }

    renderRankings = (data) => {
        const newData = data.map(x => ({
            ...x,
            totalVolume: x.trade.filter(y => y.collectionId == x.collectionId && new Date().getTime() - new Date(y.createdAt).getTime() < toMiliseconds(24 * this.timeRange, 0, 0)).reduce((accumulator, each) => accumulator + each.amount, 0)
        })).filter(x => (this.currentCategory == "All" ? true : x.category == this.currentCategory))
        newData.sort((a, b) => b.totalVolume - a.totalVolume)
        let str = ``
        for (let i = 0; i < newData.length; i++) {
            const floorPrice = newData[i].tokenIds.length == 0 ? 0 : newData[i].tokenIds.reduce((prev, curr) => prev.price < curr.price ? prev : curr).price
            // const floorBid = newData[i]?.order.length > 0 && newData[i]?.order.status == "open" ? newData[i]?.order.reduce((prev, curr) => prev.take.value < curr.take.value ? prev : curr) : null

            //Yesterday percent
            var now1 = new Date()
            var now2 = new Date()
            var now = new Date()
            let yesterday = now1
            let lastweek = now2
            yesterday.setDate(now1.getDate() - 1)
            lastweek.setDate(now2.getDate() - 7)
            const yesterdayTrade = newData[i].trade.filter(x => yesterday.getTime() - new Date(x.createdAt).getTime() >= 0 && yesterday.getTime() - new Date(x.createdAt).getTime() <= toMiliseconds(24, 0, 0))
            const todayTrade = newData[i].trade.filter(x => now.getTime() - new Date(x.createdAt).getTime() >= 0 && now.getTime() - new Date(x.createdAt).getTime() <= toMiliseconds(24, 0, 0))
            let yesterdayAmount = yesterdayTrade.length > 0 ? (yesterdayTrade.reduce((accumulator, each) => accumulator + each.amount, 0)) / yesterdayTrade.length : 0
            let todayAmount = todayTrade.length > 0 ? (todayTrade.reduce((accumulator, each) => accumulator + each.amount, 0)) / todayTrade.length : 0
            let lastDayPercent = yesterdayAmount == 0 ? "--" : ((todayAmount - yesterdayAmount) / yesterdayAmount)

            //Last week percent
            const lastweekTrade = newData[i].trade.filter(x => lastweek.getTime() - new Date(x.createdAt).getTime() >= 0 && lastweek.getTime() - new Date(x.createdAt).getTime() <= toMiliseconds(24 * 7, 0, 0))
            const thisweekTrade = newData[i].trade.filter(x => now.getTime() - new Date(x.createdAt).getTime() >= 0 && now.getTime() - new Date(x.createdAt).getTime() <= toMiliseconds(24 * 7, 0, 0))
            let lastweekAmount = lastweekTrade.length > 0 ? (lastweekTrade.reduce((accumulator, each) => accumulator + each.amount, 0)) / lastweekTrade.length : 0
            let thisweekAmount = thisweekTrade.length > 0 ? (thisweekTrade.reduce((accumulator, each) => accumulator + each.amount, 0)) / thisweekTrade.length : 0
            let lastweekPercent = lastweekAmount == 0 ? "--" : ((thisweekAmount - lastweekAmount) / lastweekAmount)

            const verifyIcon = `<div class="dark:border-jacarta-600 bg-green absolute -right-2 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white" data-tippy-content="Verified Collection">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    class="h-[.875rem] w-[.875rem] fill-white"
                >
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                </svg>
            </div>`
            str +=
                `
                <a href="collection.html?collection=${newData[i].collectionId}" class="flex transition-shadow hover:shadow-lg" role="row">
                    <div class="dark:border-jacarta-600 border-jacarta-100 flex w-[28%] items-center border-t py-4 px-4" role="cell">
                        <span class="mr-2 lg:mr-4 w-4">${i + 1}</span>
                        <figure class="relative mr-2 w-8 shrink-0 self-start lg:mr-5 lg:w-12">
                            <img src=${newData[i].image} alt="avatar 1" class="rounded-2lg object-cover" style="width: 48px; height: 48px" />
                            ${newData[i].verified === 1 ? verifyIcon : ""}
                        </figure>
                        <span class="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                            ${newData[i].name}
                        </span>
                    </div>
                    <div class="dark:border-jacarta-600 border-jacarta-100 flex w-[12%] items-center whitespace-nowrap border-t py-4 px-4" role="cell">
                        <span class="-ml-1" data-tippy-content="WDOGE">
                            <img src="img/chains/WDOGE.png" class="rounded-full mr-1" width="20" height="20" />
                        </span>
                        <span class="text-sm font-medium tracking-tight">${newData[i].totalVolume.toFixed(2)}</span>
                    </div>
                    <div class="dark:border-jacarta-600 border-jacarta-100 flex w-[12%] items-center border-t py-4 px-4" role="cell">
                        <span class="${typeof lastDayPercent === "number" ? lastDayPercent > 0 ? "text-green" : "text-red" : ""}">${lastDayPercent}%</span>
                    </div>
                    <div class="dark:border-jacarta-600 border-jacarta-100 flex w-[12%] items-center border-t py-4 px-4" role="cell">
                        <span class="${typeof lastweekPercent == "number" ? lastweekPercent > 0 ? "text-green" : "text-red" : ""}">${lastweekPercent}%</span>
                    </div>
                    <div class="dark:border-jacarta-600 border-jacarta-100 flex w-[12%] items-center border-t py-4 px-4" role="cell">
                        <span class="-ml-1" data-tippy-content="WDOGE">
                            <img src="img/chains/WDOGE.png" class="rounded-full mr-1" width="20" height="20" />
                        </span>
                        <span class="text-sm font-medium tracking-tight">${floorPrice}</span>
                    </div>
                    <div class="dark:border-jacarta-600 border-jacarta-100 flex w-[12%] items-center border-t py-4 px-4" role="cell">
                        <span>1</span>
                    </div>
                    <div class="dark:border-jacarta-600 border-jacarta-100 flex w-[12%] items-center border-t py-4 px-4" role="cell">
                        <span>${newData[i].tokenIds.length}</span>
                    </div>
                </a>
            `
        }
        document.getElementById("ranking-table").innerHTML = str
    }
}

export default Ranking