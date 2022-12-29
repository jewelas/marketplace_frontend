class Saletype {
    constructor() {
        this.saleType = -1
        document.querySelectorAll(".sale-type").forEach((x, i) => x.addEventListener("click", e => this.clickSaleType(e, i)))
    }

    clickSaleType = async (e, i) => {
        this.saleType = i
        document.querySelectorAll(".sale-type").forEach(x => {
            x.classList.remove("border-accent")
            x.classList.add("border-jacarta-100")
            x.classList.add("dark:border-jacarta-600")
        })
        e.currentTarget.classList.remove("border-jacarta-100")
        e.currentTarget.classList.remove("dark:border-jacarta-600")
        e.currentTarget.classList.add("border-accent")
    }
}

export default Saletype