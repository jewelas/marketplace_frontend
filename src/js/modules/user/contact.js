import axios from "axios";
import { sendAlert } from "../utils";

class Contact {
    constructor() {
        this.submitButton = document.getElementById("report")
        this.events()
    }

    events() {
        document.getElementById("contact-form-consent-input")?.addEventListener("change", e => this.changeTerm(e))
        if (location.pathname != "/contact.html")
            this.submitButton?.addEventListener("click", e => this.report(e))
    }

    changeTerm = async (e) => {
        if (localStorage.getItem("account") && localStorage.getItem("sign")) {
            this.submitButton.disabled = !e.currentTarget.checked
            if (e.currentTarget.checked)
                this.submitButton?.addEventListener("click", e => this.report(e))
            else
                this.submitButton?.removeEventListener("click", e => this.report(e))
        }
    }

    report = async (e) => {
        if (localStorage.getItem("account") && localStorage.getItem("sign")) {
            const { data: { success } } = await axios.post("/user/contact", {
                wallet: localStorage.getItem("account"),
                msg: document.getElementById("report-message").value,
            })
            if (success) sendAlert("Sent", "info")
        }
        else
            sendAlert("Sign in first", "danger")
    }
}

export default Contact