import axios from "axios"

class Activity {
    constructor() {
        this.activities = []
        this.type = -1
        this.searchVal = ""
        this.get()
        this.events()

    }

    events() {
        document.getElementById("search-input").addEventListener("keyup", e => this.searchName(e))
        document.getElementById("listing").addEventListener("click", e => this.filter(e, 0))
        document.getElementById("bids").addEventListener("click", e => this.filter(e, 1))
        document.getElementById("likes").addEventListener("click", e => this.filter(e, 2))
    }

    searchName = async (e) => {
        this.searchVal = e.target.value
        this.render()
    }

    filter = async (e, i) => {
        this.type = i
        document.querySelectorAll(".filter-button").forEach(x => {
            x.classList.remove("bg-accent")
            x.classList.remove("text-white")
            x.classList.add("dark:bg-jacarta-700")
            x.querySelector("svg").classList.remove("fill-white")
        })
        const selected = document.querySelectorAll(".filter-button")[i]
        selected.classList.add("bg-accent")
        selected.classList.add("text-white")
        selected.classList.remove("dark:bg-jacarta-700")
        selected.querySelector("svg").classList.add("fill-white")
        this.render()
    }

    render = async () => {
        if (this.type != -1)
            this.activities = this.activitiesTemp.filter(x => (x.summary.toLowerCase().search(this.searchVal.toLowerCase()) != -1 || x.collection[0].name.toLowerCase().search(this.searchVal.toLowerCase()) != -1) && x.type == this.type)
        else
            this.activities = this.activitiesTemp.filter(x => x.summary.toLowerCase().search(this.searchVal.toLowerCase()) != -1 || x.collection[0].name.toLowerCase().search(this.searchVal.toLowerCase()) != -1)
        let str = ``
        for (let i = 0; i < this.activities.length; i++) {
            const collection = this.activities[i].collection[0]
            const ago = this.activities[i].createdAt.slice(0, 10)
            let typeIcon
            if (this.activities[i].type == 0)
                typeIcon = `
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            class="fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                    `
            if (this.activities[i].type == 1)
                typeIcon = `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        class="fill-jacarta-700 dark:fill-white"
                    >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                        d="M14 20v2H2v-2h12zM14.586.686l7.778 7.778L20.95 9.88l-1.06-.354L17.413 12l5.657 5.657-1.414 1.414L16 13.414l-2.404 2.404.283 1.132-1.415 1.414-7.778-7.778 1.415-1.414 1.13.282 6.294-6.293-.353-1.06L14.586.686zm.707 3.536l-7.071 7.07 3.535 3.536 7.071-7.07-3.535-3.536z"
                        />
                    </svg>
                `
            if (this.activities[i].type == 2)
                typeIcon = `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        class="fill-jacarta-700 dark:fill-white"
                    >
                        <path fill="none" d="M0 0H24V24H0z" />
                        <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" />
                    </svg>
                `
            if (this.activities[i].type == 3)
                typeIcon = `
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            class="fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" />
                        </svg>
                    `
            if (this.activities[i].type == 4)
                typeIcon = `
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            class="fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z" />
                        </svg>
                        `
            str += `
                <a href="collection.html?collection=${collection.collectionId}" class="dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl relative flex items-center border bg-white p-8 transition-shadow hover:shadow-lg truncate">
                    <figure class="mr-5 self-start">
                        <img src=${collection.image} style="width: 48px; height: 48px; min-width: 48px; min-height: 48px" alt="avatar 2" class="rounded-2lg object-cover" />
                    </figure>
                    <div class="truncate">
                        <h3 class="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white truncate">
                            ${collection.name}
                        </h3>
                        <span class="dark:text-jacarta-200 text-jacarta-500 mb-3 block text-sm">${this.activities[i].summary}</span>
                        <span class="text-jacarta-300 block text-xs">Date: ${ago}</span>
                    </div>
                    <div class="dark:border-jacarta-600 border-jacarta-100 ml-auto rounded-full border p-3">${typeIcon}</div>
                </a>
            `
        }
        document.getElementById("activities").innerHTML = str
    }

    get = async () => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("user")
        const { data } = await axios.get(`/activity/${code ? code : localStorage.getItem("account")}`)
        this.activities = this.activitiesTemp = data
        this.render()
    }
}

export default Activity