import Web3 from "web3"
import { BigNumber as BN } from "ethers"
import { ExternalRoyalties } from "../../../interface/contracts"
import { sendAlert } from "../utils"

class Royalties {
    constructor(props) {
        this.web3 = new Web3(window.ethereum)
        this.royalties = []
        this.props = props
        this.royaltiesPanel = document.getElementById("royalties-panel")
        document.getElementById("add-more-royalties")?.addEventListener("click", e => this.addMore(e))
        document.getElementById("save-royalties")?.addEventListener("click", e => this.save(e))
    }

    addMore = (e) => {
        this.royaltiesPanel.insertAdjacentHTML("beforeend",
            `
            <div class="flex royalties-row">
                <div class="flex flex-col self-end">
                    <button class="dark:bg-jacarta-700 dark:border-jacarta-600 hover:bg-jacarta-100 border-jacarta-100 bg-jacarta-50 flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-l-lg border border-r-0 remove-row-royalties">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            class="fill-jacarta-500 dark:fill-jacarta-300 h-6 w-6"
                        >
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path
                                d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div class="flex-1">
                    <input
                        type="text"
                        class="dark:bg-jacarta-700 dark:border-jacarta-600 focus:ring-accent border-jacarta-100 dark:placeholder-jacarta-300 h-12 w-full border border-r-0 focus:ring-inset dark:text-white address-input"
                        placeholder="Address"
                    />
                </div>
                <div class="flex-1">
                    <input
                        type="number"
                        class="dark:bg-jacarta-700 dark:border-jacarta-600 focus:ring-accent border-jacarta-100 dark:placeholder-jacarta-300 h-12 w-full rounded-r-lg border focus:ring-inset dark:text-white percent-input"
                        placeholder="%"
                        min="0" onkeypress="return event.charCode != 45"
                    />
                </div>
            </div>
        `)
        document.querySelectorAll(".remove-row-royalties").forEach(x => x.addEventListener("click", e => this.removeRow(e), { once: true }))
    }

    removeRow = (e) => {
        e.currentTarget.removeEventListener("click", this.removeRow, true)
        e.currentTarget.parentNode.parentNode.remove()
    }

    save = async (e) => {
        const rows = document.querySelectorAll(".royalties-row")
        this.royalties = []
        for (let i = 0; i < rows.length; i++) {
            this.royalties.push({
                account: rows[i].querySelectorAll(".address-input")[0].value,
                value: parseFloat(parseFloat(rows[i].querySelectorAll(".percent-input")[0].value).toFixed(2))
            })
        }

        const sumRoyalties = this.royalties.reduce((a, each) => a + each.value, 0)
        if (this.royalties.length == 0) sendAlert("Input any royalties and address", "danger")
        else {
            if (sumRoyalties >= 50) sendAlert("Sum of all royalties cannot be over 50%.", "danger")
            else {
                const contract = new this.web3.eth.Contract(ExternalRoyalties.abi, ExternalRoyalties.address)
                await contract.methods.setRoyaltiesByToken(this.props.collectionId,
                    this.royalties.map(x => {
                        return {
                            ...x,
                            value: BN.from(100 * x.value)
                        }
                    })
                ).send({ from: localStorage.getItem("account") })
            }
        }
    }
}

export default Royalties