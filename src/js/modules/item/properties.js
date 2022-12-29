class Properties {
    constructor() {
        this.itemProperties = []
        this.propertyPanel = document.getElementById("property-panel")
        document.getElementById("add-more-properties")?.addEventListener("click", e => this.addMore(e))
        document.getElementById("save-properties")?.addEventListener("click", e => this.save(e))
    }
    
    addMore = (e) => {
        this.propertyPanel.insertAdjacentHTML("beforeend",
        `
            <div class="flex property-row">
                <div class="flex flex-col self-end">
                    <button class="dark:bg-jacarta-700 dark:border-jacarta-600 hover:bg-jacarta-100 border-jacarta-100 bg-jacarta-50 flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-l-lg border border-r-0 remove-row-properties">
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
                        class="dark:bg-jacarta-700 dark:border-jacarta-600 focus:ring-accent border-jacarta-100 dark:placeholder-jacarta-300 h-12 w-full border border-r-0 focus:ring-inset dark:text-white type-input"
                        placeholder="Character"
                    />
                </div>
                <div class="flex-1">
                    <input
                        type="text"
                        class="dark:bg-jacarta-700 dark:border-jacarta-600 focus:ring-accent border-jacarta-100 dark:placeholder-jacarta-300 h-12 w-full rounded-r-lg border focus:ring-inset dark:text-white name-input"
                        placeholder="Male"
                    />
                </div>
            </div>
        `)
        document.querySelectorAll(".remove-row-properties").forEach(x => x.addEventListener("click", e => this.removeRow(e), { once: true }))
    }

    removeRow = (e) => {
        e.currentTarget.removeEventListener("click", this.removeRow, true)
        e.currentTarget.parentNode.parentNode.remove()
    }

    save = (e) => {
        const rows = document.querySelectorAll(".property-row")
        this.itemProperties = []
        for (let i = 0; i < rows.length; i++) {
            this.itemProperties.push({
                trait_type: rows[i].querySelectorAll(".type-input")[0].value,
                value: rows[i].querySelectorAll(".name-input")[0].value
            })
        }
    }
}

export default Properties