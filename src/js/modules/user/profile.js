import axios from "axios"
import { sendAlert } from "../utils"

class Profile {
    constructor() {
        this.avatarPreview = document.getElementById("avatar-preview")
        this.coverPreview = document.getElementById("cover-preview")
        this.saveButton = document.getElementById("update-profile")
        this.events()
        this.get()
    }

    events() {
        document.getElementById("avatar-zone")?.addEventListener("change", e => this.importImage(e, this.avatarPreview, 0))
        document.getElementById("cover-zone")?.addEventListener("change", e => this.importImage(e, this.coverPreview, 1))
        this.saveButton?.addEventListener("click", e => this.save(e))
    }

    importImage = (e, zone, file) => {
        e.preventDefault()
        if (file == 0) {
            this.avatarFile = e.target.files[0]
            if (this.avatarFile)
                zone.src = URL.createObjectURL(this.avatarFile)
            else
                zone.src = ""
        }
        if (file == 1) {
            this.coverFile = e.target.files[0]
            if (this.coverFile)
                zone.src = URL.createObjectURL(this.coverFile)
            else
                zone.src = ""
        }
    }

    get = async () => {
        const { data: { users } } = await axios.get(`/user/${localStorage.getItem("account")}`)
        if (users.length == 0) {
            sendAlert("Sign in with Metamask again", "danger")
            return
        }
        const me = users[0]
        this.saveButton.disabled = false
        this.coverPreview.src = this.coverNow = me.cover
        this.avatarPreview.src = this.avatarNow = me.avatar
        document.getElementById("profile-username").value = me.name
        document.getElementById("profile-bio").value = me.bio
        document.getElementById("profile-email").value = me.email
        document.getElementById("profile-twitter").value = me.twitter
        document.getElementById("profile-instagram").value = me.instagram
        document.getElementById("profile-website").value = me.yoursitename
        document.getElementById("profile-wallet").innerHTML = localStorage.getItem("account")
    }

    save = async (e) => {
        let avatarUrlNew = ``
        let coverUrlNew = ``
        if (document.getElementById("profile-username").value == '' || document.getElementById("profile-bio").value == '' || document.getElementById("profile-email").value == '') {
            sendAlert('Empty values in the form', "danger")
            return
        }
        this.saveButton.disabled = true
        if (this.coverFile) {
            const data = new FormData()
            data.append("file", this.coverFile)
            data.append("upload_preset", "ml_default")
            data.append("cloud_name", "Honeywell")
            const { url } = await fetch("https://api.cloudinary.com/v1_1/Honeywell/image/upload", {
                method: "post",
                body: data
            }).then(resp => resp.json())
            coverUrlNew = url
        }
        if (this.avatarFile) {
            const data = new FormData()
            data.append("file", this.avatarFile)
            data.append("upload_preset", "ml_default")
            data.append("cloud_name", "Honeywell")
            const { url } = await fetch("https://api.cloudinary.com/v1_1/Honeywell/image/upload", {
                method: "post",
                body: data
            }).then(resp => resp.json())
            avatarUrlNew = url
        }

        const { data: { success } } = await axios.put("/user", {
            avatar: this.avatarFile ? avatarUrlNew : this.avatarNow,
            cover: this.coverFile ? coverUrlNew : this.coverNow,
            name: document.getElementById("profile-username").value,
            bio: document.getElementById("profile-bio").value,
            email: document.getElementById("profile-email").value,
            twitter: document.getElementById("profile-twitter").value,
            instagram: document.getElementById("profile-instagram").value,
            yoursitename: document.getElementById("profile-website").value,
            wallet: localStorage.getItem("account")
        })
        if (success) sendAlert("Successfully updated", "info")
        this.saveButton.disabled = false
    }
}

export default Profile