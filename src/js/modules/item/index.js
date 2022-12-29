import Web3 from "web3";
import axios from "axios";
import { BigNumber as BN } from "ethers";
import {
  Asset721,
  Asset1155,
  NFTTransferProxy,
  ERC721RaribleMinimal,
  ERC1155RaribleMinimal,
} from "../../../interface/contracts";
import { getIpfsHash, imageTypes, putOnSale, sendAlert, videoTypes } from "../utils";
import Properties from "./properties";
import Levels from "./levels";
import Stats from "./stats";
import Saletype from "./saletype";

class Item {
  constructor(props) {
    this.props = props;
    this.web3 = new Web3(window.ethereum);
    this.saveButton = document.getElementById("save-item");
    this.itemMedia = document.getElementById("file-upload");
    this.itemName = document.getElementById("item-name");
    this.itemExternalLink = document.getElementById("item-external-link");
    this.itemDescription = document.getElementById("item-description");
    this.itemPrice = document.getElementById("item-price");
    this.itemRoyalties = document.getElementById("item-royalties");
    this.itemUnlockable = document.getElementById("item-unlockable");
    this.spinner = document.getElementById("create-spinner");
    this.unlockableCheckbox = document.getElementById("unlockable-checkbox");
    this.isAddUnlockable = false;
    this.properties = new Properties();
    this.levels = new Levels();
    this.stats = new Stats();
    this.saletype = new Saletype();
    this.events();
  }

  events() {
    this.saveButton?.addEventListener("click", (e) => this.createItem(e));
    this.itemMedia?.addEventListener("change", (e) => this.importMedia(e));
    this.unlockableCheckbox?.addEventListener("change", (e) => this.addUnlockable(e));
  }

  addUnlockable = (e) => {
    this.isAddUnlockable = e.currentTarget.checked;
    this.itemUnlockable.style.display = e.currentTarget.checked ? "block" : "none";
  };

  isFileImage(file) {
    return file && file["type"].split("/")[0] === "image";
  }

  createItem = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("account")) {
      sendAlert("Please sign in with metamask", "danger", true);
      return;
    }
    if (!localStorage.getItem("sign")) {
      sendAlert("Signature is needed", "danger", true);
      return;
    }
    if (!this.props.itemForAdd.selectedCollection) {
      sendAlert("Select a collection", "danger", true);
      return;
    }
    if (localStorage.getItem("account") != this.props.itemForAdd.selectedCollection.owner) {
      sendAlert("You are not minter or creator", "danger", true);
      return;
    }

    if (
      this.itemName.value == "" ||
      !this.file ||
      this.itemRoyalties.value == "" ||
      parseInt(this.itemRoyalties.value) <= 0 ||
      this.itemPrice.value == "" ||
      parseFloat(this.itemPrice.value) <= 0 ||
      this.saletype.saleType == -1
    ) {
      sendAlert("Empty values in the form", "danger", true);
      return;
    }

    if (parseFloat(this.itemRoyalties.value) > 50) {
      sendAlert("Royalties must be less than or equal to 50", "danger", true);
      return;
    }

    if (this.props.itemForAdd.supplyNum >= 2 && this.props.itemForAdd.selectedCollection.single) {
      sendAlert("Check your supply again", "danger", true);
      return;
    }

    this.saveButton.disabled = true;
    this.spinner.style.display = "block";

    try {
      console.log("[ Uploading metadata on IPFS ...");

      const metadata = {
        name: this.itemName.value,
        description: this.itemDescription.value,
        external_url: this.itemExternalLink.value,
        attributes: this.properties.itemProperties,
      };

      const IpfsHash = await getIpfsHash(this.file, metadata);
      const collection = this.props.itemForAdd.selectedCollection.collectionId;
      let tx;

      if (this.props.itemForAdd.selectedCollection.single) {
        console.log("[ Creating ERC721 NFT...");

        tx = await new this.web3.eth.Contract(ERC721RaribleMinimal.abi, collection).methods
          .mintAndTransfer(
            {
              tokenId: BN.from(localStorage.getItem("account"))
                .mul(BN.from(2).pow(96))
                .add(BN.from(Math.round(Math.random() * 100000))),
              tokenURI: `https://ipfs.io/ipfs/${IpfsHash}`,
              creators: [
                {
                  account: localStorage.getItem("account"),
                  value: BN.from("10000"),
                },
              ],
              royalties: [
                {
                  account: localStorage.getItem("account"),
                  value: BN.from(100).mul(BN.from(parseInt(this.itemRoyalties.value))),
                },
              ],
              signatures: ["0x"],
            },
            localStorage.getItem("account")
          )
          .send({ from: localStorage.getItem("account") });

        console.log("[ Approving created token...");

        await new this.web3.eth.Contract(Asset721.abi, Asset721.address).methods
          .setApprovalForAll(NFTTransferProxy.address, true)
          .send({ from: localStorage.getItem("account") });
      } else {
        console.log("[ Creating ERC1155 NFT...");

        tx = await new this.web3.eth.Contract(ERC1155RaribleMinimal.abi, collection).methods
          .mintAndTransfer(
            {
              tokenId: BN.from(localStorage.getItem("account"))
                .mul(BN.from(2).pow(96))
                .add(BN.from(Math.round(Math.random() * 100000))),
              tokenURI: `https://ipfs.io/ipfs/${IpfsHash}`,
              supply: BN.from(this.props.itemForAdd.supplyNum),
              creators: [
                {
                  account: localStorage.getItem("account"),
                  value: BN.from("10000"),
                },
              ],
              royalties: [
                {
                  account: localStorage.getItem("account"),
                  value: BN.from(100).mul(BN.from(parseInt(this.itemRoyalties.value))),
                },
              ],
              signatures: ["0x"],
            },
            localStorage.getItem("account"),
            BN.from(this.props.itemForAdd.supplyNum)
          )
          .send({ from: localStorage.getItem("account") });

        console.log("[ Approving created token...");

        await new this.web3.eth.Contract(Asset1155.abi, Asset1155.address).methods
          .setApprovalForAll(NFTTransferProxy.address, true)
          .send({ from: localStorage.getItem("account") });
      }

      console.log(
        `[ Created token id : ${this.props.itemForAdd.selectedCollection.single
          ? tx.events.Transfer.returnValues.tokenId
          : tx.events.Supply.returnValues.tokenId
        }`
      );
      console.log("[ Saving your activity...");

      await axios.post("/item", {
        id: this.props.itemForAdd.selectedCollection.single
          ? tx.events.Transfer.returnValues.tokenId
          : tx.events.Supply.returnValues.tokenId,
        supply: this.props.itemForAdd.selectedCollection.single
          ? 1
          : parseInt(tx.events.Supply.returnValues.value),
        creator: localStorage.getItem("account"),
        owner: this.props.itemForAdd.selectedCollection.single ? localStorage.getItem("account") : "",
        collectionId: collection,
        tokenURI: `https://ipfs.io/ipfs/${IpfsHash}`,
        price: parseFloat(this.itemPrice.value),
        likes: [],
        properties: this.properties.itemProperties,
        levels: this.levels.itemLevels,
        stats: this.stats.itemStats,
        filetype: this.isFileImage(this.file) ? "image" : "video",
        unlockable: this.isAddUnlockable ? this.itemUnlockable.value : "",
        saletype: this.saletype.saleType,
        activity: {
          type: 0,
          collectionId: collection,
          tokenId: this.props.itemForAdd.selectedCollection.single
            ? tx.events.Transfer.returnValues.tokenId
            : tx.events.Supply.returnValues.tokenId,
          summary: `listed by ${localStorage.getItem("account").slice(0, 4) +
            "..." +
            localStorage
              .getItem("account")
              .slice(
                localStorage.getItem("account").length - 4,
                localStorage.getItem("account").length
              )
            }`,
          user: localStorage.getItem("account"),
          price: parseFloat(this.itemPrice.value),
        },
      });

      console.log("[ NFT item was created");
      sendAlert("Successfully created", "info", true);

      if (this.saletype.saleType == 0)
        putOnSale(
          this.props.itemForAdd.selectedCollection.single
            ? 1
            : parseInt(tx.events.Supply.returnValues.value),
          parseFloat(this.itemPrice.value),
          this.web3,
          collection,
          this.props.itemForAdd.selectedCollection.single
            ? tx.events.Transfer.returnValues.tokenId
            : tx.events.Supply.returnValues.tokenId
        );
    } catch (e) {
      console.log(e);
      if (e.code == 4001) sendAlert("User rejected", "danger", true);
      else sendAlert("Transaction failed", "danger", true);
    }
    this.spinner.style.display = "none";
    this.saveButton.disabled = false;
  };

  importMedia = async (e) => {
    e.preventDefault();
    if (e.target.files.length > 0 && e.target.files[0].size <= 100 * 1024 * 1024) {
      if (
        imageTypes.some((x) => x == e.target.files[0].type) ||
        videoTypes.some((x) => x == e.target.files[0].type)
      ) {
        this.file = e.target.files[0];
        document.getElementById("filezone-empty").style.opacity = 0;
        if (e.target.files[0].type.search("video") !== -1) {
          document.getElementById("item-preview-video").src = URL.createObjectURL(
            e.target.files[0]
          );
          document.getElementById("item-preview-image").style.backgroundImage = "";
        } else {
          document.getElementById("item-preview-video").src = "";
          document.getElementById(
            "item-preview-image"
          ).style.backgroundImage = `url(${URL.createObjectURL(e.target.files[0])}`;
        }
      } else {
        sendAlert("Wrong format", "danger");
        e.target.value = null;
        this.file = undefined;
        document.getElementById("filezone-empty").style.opacity = 1;
        document.getElementById("item-preview-image").style.backgroundImage = "";
        document.getElementById("item-preview-video").src = "";
      }
    } else {
      document.getElementById("filezone-empty").style.opacity = 1;
      document.getElementById("item-preview-image").style.backgroundImage = "";
      document.getElementById("item-preview-video").src = "";
    }
  };
}

export default Item;
