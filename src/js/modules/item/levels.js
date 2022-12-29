class Levels {
    constructor() {
        this.itemLevels = []
        this.propertyPanel = document.getElementById("level-panel")
        this.events()
    }

    events() {
        document.getElementById("add-more-levels")?.addEventListener("click", e => this.addMore(e))
        document.getElementById("save-levels")?.addEventListener("click", e => this.save(e))
    }

    addMore = (e) => {
        this.propertyPanel.insertAdjacentHTML("beforeend",
        `
            <div class="flex level-row">
                <button class="dark:bg-jacarta-700 dark:border-jacarta-600 hover:bg-jacarta-100 border-jacarta-100 bg-jacarta-50 flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-l-lg border border-r-0 remove-level-row">
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
                <div class="w-1/2">
                    <input
                        type="text"
                        class="dark:bg-jacarta-700 dark:border-jacarta-600 focus:ring-accent border-jacarta-100 dark:placeholder-jacarta-300 h-12 w-full border border-r-0 focus:ring-inset dark:text-white name-input"
                        placeholder="Speed"
                    />
                </div>
                <div class="flex w-1/2 items-end">
                    <div class="flex-1">
                        <input
                            type="number"
                            class="dark:bg-jacarta-700 dark:border-jacarta-600 focus:ring-accent border-jacarta-100 dark:placeholder-jacarta-300 h-12 w-full border focus:ring-inset dark:text-white value1"
                            placeholder="3"
                            min="0" onkeypress="return event.charCode != 45"
                        />
                    </div>
                    <div class="dark:bg-jacarta-800 dark:text-jacarta-400 dark:border-jacarta-600 bg-jacarta-50 border-jacarta-100 flex h-12 w-12 items-center justify-center self-end border-y px-2">
                        Of
                    </div>
                    <div class="flex-1 self-end">
                        <input
                            type="number"
                            class="dark:bg-jacarta-700 dark:border-jacarta-600 focus:ring-accent border-jacarta-100 dark:placeholder-jacarta-300 h-12 w-full rounded-r-lg border focus:ring-inset dark:text-white value2"
                            placeholder="10"
                            min="0" onkeypress="return event.charCode != 45"
                        />
                    </div>
                </div>
            </div>
        `)
        document.querySelectorAll(".remove-level-row").forEach(x => x.addEventListener("click", e => this.removeRow(e), { once: true }))
    }

    removeRow = (e) => {
        e.currentTarget.removeEventListener("click", this.removeRow, true)
        e.currentTarget.parentNode.remove()
    }

    save = (e) => {
        const rows = document.querySelectorAll(".level-row")
        this.itemLevels = []
        for (let i = 0; i < rows.length; i++) {
            this.itemLevels.push({
                name: rows[i].querySelectorAll(".name-input")[0].value,
                value1: rows[i].querySelectorAll(".value1")[0].value,
                value2: rows[i].querySelectorAll(".value2")[0].value
            })
        }
    }
}

export default Levels