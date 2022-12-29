import axios from "axios"

import Header from "../modules/Header"
import MobileMenu from "../modules/MobileMenu"
import Sliders from "../modules/Sliders"
import Tooltips from "../modules/Tooltips"
import Metamask from "../modules/Metamask"
import CopyToClipboard from "../modules/CopyToClipboard"
import Collection from "../modules/collection"
import CollectionDetail from "../modules/collection/detail"
import ItemDetail from "../modules/item/detail"
import Item from "../modules/item"
import UserDetail from "../modules/user/detail"
import Home from "../modules/home"
import Ranking from "../modules/ranking"
import Following from "../modules/user/following"
import Profile from "../modules/user/profile"
import Contact from "../modules/user/contact"
import Activity from "../modules/user/activity"
import ItemForAdd from "../modules/collection/itemForAdd"

class AllInfos {
    constructor() {
        this.init()
    }

    init = async () => {
        const res1 = await axios.get("/item")
        const allItems = res1.data

        const res2 = await axios.get("/user")
        const allUsers = res2.data.users

        const res3 = await axios.get("/collection")
        const allCollections = res3.data

        let header = new Header({ allUsers, allItems })
        let itemForAdd = new ItemForAdd()
        let mobileMenu = new MobileMenu()
        let sliders = new Sliders()
        let tooltips = new Tooltips()
        let metamask = new Metamask()
        let copyToClipboard = new CopyToClipboard()
        let collection = new Collection({ itemForAdd })
        let item = new Item({ itemForAdd })
        let contact = new Contact()
        if (location.pathname == "/index.html" || location.pathname == "/") {
            let home = new Home({ allItems })
        }
        if (location.pathname == "/rankings.html") {
            let ranking = new Ranking()
        }
        if (location.pathname == "/collection.html") {
            let collectionDetail = new CollectionDetail()
        }
        if (location.pathname == "/item.html") {
            let itemDetail = new ItemDetail({ allUsers })
        }
        if (location.pathname == "/user.html") {
            let userDetail = new UserDetail({ allUsers, allItems, allCollections })
        }
        if (location.pathname == "/following.html") {
            let userDetail = new Following({ allUsers, allItems, allCollections })
        }
        if (location.pathname == "/edit-profile.html") {
            let profile = new Profile()
        }
        if (location.pathname == "/activity.html" || location.pathname == "/user.html") {
            let activity = new Activity()
        }

    }
}

export default AllInfos