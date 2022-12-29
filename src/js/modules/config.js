import axios from "axios"

class Config {
    constructor() {
        axios.defaults.baseURL = "https://testserver.artwise.dog/"
        // axios.defaults.baseURL = "http://202.61.249.136:5000"
        // axios.defaults.baseURL = "http://localhost:5000"
    }
}

export default Config