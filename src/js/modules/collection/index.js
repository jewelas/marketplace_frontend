import Web3 from "web3";
import axios from "axios";
import { BigNumber as BN } from "ethers";
import Multicall from "@dopex-io/web3-multicall";
import {
  Factory721,
  Factory1155,
  ERC721RaribleMinimal,
  ERC1155RaribleMinimal,
  ERC165,
} from "../../../interface/contracts";
import { imageTypes, sendAlert } from "../utils";

const categories = [
  "Art",
  "Collectibles",
  "Domain Names",
  "Music",
  "Photography",
  "Sports",
  "Trading Cards",
  "Utility",
  "Virtual Worlds",
];

class Collection {
  constructor(props) {
    this.props = props;
    this.web3 = new Web3(window.ethereum);
    this.createButton721 = document.getElementById("save-collection721");
    this.createButton1155 = document.getElementById("save-collection1155");
    this.fileZone = document.getElementById("filezone");
    this.fileZone1 = document.getElementById("filezone1");
    this.previewZone = document.getElementById("previewZone");
    this.previewZone1 = document.getElementById("previewZone1");
    this.collectionInputs = document.querySelectorAll(".collection-input");
    this.collectionsElement = document.getElementById("collections");
    this.collection = document.getElementById("collection");
    this.supplyInput = document.getElementById("item-supply");
    this.categoryItems = document.querySelectorAll(".category-item");
    this.categoryItemsForImport = document.querySelectorAll(".category-item-import");
    this.spinner = document.getElementById("create-spinner");
    this.supplyNum = 1;
    this.currentCategory = "Art";
    this.currentCategoryForImport = "Art";
    this.ascend = true;
    this.getCollections();
    this.events();
  }

  events() {
    this.categoryItems?.forEach((x, i) =>
      x.addEventListener("click", (e) => this.changeCategory(e, i))
    );
    this.categoryItemsForImport?.forEach((x, i) =>
      x.addEventListener("click", (e) => this.changeCategoryForImport(e, i))
    );
    this.createButton721?.addEventListener("click", (e) => this.createCollection(e, true));
    this.createButton1155?.addEventListener("click", (e) => this.createCollection(e, false));
    this.fileZone?.addEventListener("change", (e) => this.importImage(e));
    this.fileZone1?.addEventListener("change", (e) => this.importImage1(e));
    this.supplyInput?.addEventListener("change", (e) => this.changeSupply(e));

    document
      .querySelectorAll(".collections-order")
      .forEach((x, i) => x.addEventListener("click", (e) => this.changeCollectionsOrder(e, i)));
    document.getElementById("import")?.addEventListener("click", (e) => this.importCollection(e));
  }

  changeCollectionsOrder = (e, i) => {
    document.getElementById("collections-order").innerHTML = e.target.innerHTML;
    if (i == 0) this.ascend = false;
    if (i == 1) this.ascend = true;
    this.getCollections();
  };

  changeCategory = (e, i) => {
    this.currentCategory = categories[i];
    document.getElementById("category-name").innerHTML = this.currentCategory;
  };

  changeCategoryForImport = (e, i) => {
    this.currentCategoryForImport = categories[i];
    document.getElementById("category-name-import").innerHTML = this.currentCategoryForImport;
  };

  changeSupply = (e) => {
    console.log("[ Swithcing ERC protocol");
    this.supplyNum = parseInt(e.target.value);
    this.collection.innerHTML = "Select collection";
    this.collectionByProtocol = this.collections.filter(
      (x) => x.owner == localStorage.getItem("account")
    );

    this.props.itemForAdd.selectedCollection = null;
    this.props.itemForAdd.supplyNum = e.target.value;

    let str = ``;
    for (let i = 0; i < this.collectionByProtocol.length; i++)
      str += `<li>
          <a class="dropdown-item justify-between font-display dark:hover:bg-jacarta-600 hover:bg-jacarta-50 flex w-full items-center rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white collection-item" ping="${i}">
            <span class="flex items-center space-x-3">
              <img
                src="${this.collectionByProtocol[i].image}"
                class="h-8 w-8 rounded-full object-cover"
                style="min-width: 32px"
                alt="avatar"
              />
              <span class="text-jacarta-700 dark:text-white">${this.collectionByProtocol[i].name}</span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              style="display: none"
              class="fill-accent mb-[3px] h-4 w-4"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
            </svg>
          </a>
        </li>`;
    document.querySelectorAll(".collection-list")[0].innerHTML = str;
    this.collectionIndex = -1;
    document.querySelectorAll(".collection-item").forEach((each) => {
      each.addEventListener("click", (e) => this.onClickCollection(e));
    });
  };

  onClickCollection = (e) => {
    const elements = e.currentTarget.parentNode.parentNode.querySelectorAll("li a svg");
    for (let i = 0; i < elements.length; i++) elements[i].style.display = "none";
    e.currentTarget.querySelector("svg").style.display = "block";
    this.collectionIndex = parseInt(e.currentTarget.ping);
    this.collection.innerHTML = this.collectionByProtocol[this.collectionIndex].name;
    this.props.itemForAdd.selectedCollection = this.collectionByProtocol[this.collectionIndex];
  };

  generateRandomHash() {
    const characters = "0123456789";
    let string = "";
    for (let i = 0; i < 77; i++) {
      string += characters[Math.floor(Math.random() * characters.length)];
    }
    return string;
  }

  init = async (data) => {
    let str = ``;
    for (let i = 0; i < data.length; i++)
      str += `
      <article>
        <div
          class="h-full flex flex-col dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg"
        >
          <a class="flex-1 flex space-x-[0.625rem]">
            <span class="w-[74.5%]">
              <div class="relative h-full overflow-hidden rounded-[0.625rem] skeleton"></div>
            </span>
            <span class="flex w-1/3 flex-col space-y-[0.625rem]">
              <span class="relative h-full overflow-hidden rounded-[0.625rem] skeleton"></span>
              <span class="relative h-full overflow-hidden rounded-[0.625rem] skeleton"></span>
              <span class="relative h-full overflow-hidden rounded-[0.625rem] skeleton"></span>
            </span>
          </a>

          <a
            class="truncate font-display hover:text-accent dark:hover:text-accent text-jacarta-700 mt-4 block text-base dark:text-white"
          >
            --
          </a>

          <div class="mt-2 flex items-center justify-between text-sm font-medium tracking-tight">
            <div class="flex items-center" style="max-width: 140px;">
              <a class="mr-2 shrink-0">
                <img src="img/user/user_avatar.gif" alt="owner" class="h-5 w-5 rounded-full object-cover" />
              </a>
              <a class="max-w-full truncate text-accent">
                <span>--</span>
              </a>
            </div>
            <span class="dark:text-jacarta-300 text-sm">--</span>
          </div>
        </div>
      </article>
      `;
    if (location.pathname != "/user.html") this.collectionsElement.innerHTML = str;
  };

  getCollections = async () => {
    const resp = await axios.get("/collection");
    const allCollections = resp.data;
    this.collections = allCollections;
    if (this.collectionsElement) {
      let str = ``;
      let data,
        dataWithoutIpfs = [];
      const urlParams = new URLSearchParams(window.location.search);
      console.log("[ Fetching collections in category :", urlParams.get("category"));

      if (!urlParams.get("category")) dataWithoutIpfs = allCollections;
      else dataWithoutIpfs = allCollections.filter((x) => x.category == urlParams.get("category"));

      if (location.pathname == "/user.html")
        dataWithoutIpfs = dataWithoutIpfs.filter((x) => x.owner == localStorage.getItem("account"));

      this.init(dataWithoutIpfs);
      data = await Promise.all(
        dataWithoutIpfs.map(async (x) => {
          let y = x;
          for (let i = 0; i < 3; i++) {
            if (y.tokenIds[i]) {
              const {
                data: { image },
              } = await axios.get(y.tokenIds[i].tokenURI);
              y.tokenIds[i].image = image.search("ipfs://") !== -1 ? `https://ipfs.io/ipfs/${image.slice(7)}` : image;
            }
          }
          return y;
        })
      );
      if (data?.length == 0)
        this.collectionsElement.innerHTML =
          "<div style='transform:translate(-50%)' class='absolute top-1/2 left-1/2 text-jacarta-700 dark:text-white'>Nothing</div>";
      else {
        data.sort((a, b) =>
          this.ascend
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        for (let i = 0; i < data.length; i++) {
          const media = `<img
            src="${data[i].image}"
            alt="item 1"
            class="w-full h-full rounded-[0.625rem] object-cover"
          />`;
          let sample = ``;
          for (let j = 0; j < 3; j++) {
            if (data[i].tokenIds[j]) {
              sample +=
                data[i].tokenIds[j].filetype == "image"
                  ? `<img
                src=${data[i].tokenIds[j].image}
                style="width: 100%; height: 100%;"
                class="h-full rounded-[0.625rem] object-cover"
              />`
                  : `<video
                src=${data[i].tokenIds[j].image}
                style="width: 100%; height: 100%;"
                class="h-full rounded-[0.625rem] object-cover"
                autoplay loop muted
              ></video>`;
            } else {
              sample += `<div class="relative h-full overflow-hidden rounded-[0.625rem] skeleton"></div>`;
            }
          }
          const ownerInfo = data[i].ownerInfo[0] ? `<a href="user.html?user=${data[i].ownerInfo[0]?.wallet}" class="mr-2 shrink-0">
            <img src="${data[i].ownerInfo[0]?.avatar}" alt="owner" class="h-5 w-5 rounded-full object-cover" />
          </a>
          <span class="dark:text-jacarta-400 mr-1">by</span>
          <a href="user.html?user=${data[i].ownerInfo[0]?.wallet}" class="max-w-full truncate text-accent">
            <span>${data[i].ownerInfo[0]?.name}</span>
          </a>` : ""
          str += `
            <article>
              <div
                class="h-full flex flex-col dark:bg-jacarta-700 dark:border-jacarta-700 border-jacarta-100 rounded-2.5xl border bg-white p-[1.1875rem] transition-shadow hover:shadow-lg"
              >
                <a class="flex-1 flex space-x-[0.625rem]" href="collection.html?collection=${data[i].collectionId
            }">
                  <span class="w-[74.5%]">
                    ${media}
                  </span>
                  <span class="flex w-1/3 flex-col space-y-[0.625rem]">
                    ${sample}
                  </span>
                </a>

                <a
                  class="truncate font-display hover:text-accent dark:hover:text-accent text-jacarta-700 mt-4 block text-base dark:text-white"
                >
                  ${data[i].name}
                </a>

                <div class="mt-2 flex items-center justify-between text-sm font-medium tracking-tight">
                  <div class="flex items-center" style="max-width: 120px;">
                    ${ownerInfo}
                  </div>
                  <span class="dark:text-jacarta-300 text-sm">${data[i]?.tokenIds?.length} Item${data[i]?.tokenIds?.length > 1 ? "s" : ""
            }</span>
                </div>
              </div>
            </article>`;
        }
        if (location.pathname == "/user.html")
          this.collectionsElement.innerHTML = `<div class="grid grid-cols-1 gap-[1.875rem] md:grid-cols-3 lg:grid-cols-4">${str}</div>`;
        else this.collectionsElement.innerHTML = str;
      }
    }
    if (document.querySelectorAll(".collection-list").length > 0) {
      console.log("[ Fetching the latest collections");
      this.collectionByProtocol = this.collections?.filter(
        (x) => x.owner == localStorage.getItem("account")
      );
      let str = "";
      for (let i = 0; i < this.collectionByProtocol.length; i++)
        str += `<li>
          <a class="dropdown-item justify-between font-display dark:hover:bg-jacarta-600 hover:bg-jacarta-50 flex w-full items-center rounded-xl px-5 py-2 text-left text-sm transition-colors dark:text-white collection-item" ping="${i}">
            <span class="flex items-center space-x-3">
              <img
                src="${this.collectionByProtocol[i].image}"
                class="h-8 w-8 rounded-full object-cover"
                style="min-width: 32px"
                alt="avatar"
              />
              <span class="text-jacarta-700 dark:text-white">${this.collectionByProtocol[i].name}</span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              style="display: none"
              class="fill-accent mb-[3px] h-4 w-4"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
            </svg>
          </a>
        </li>`;
      document.querySelectorAll(".collection-list")[0].innerHTML = str;
      this.collectionIndex = -1;
      document.querySelectorAll(".collection-item").forEach((each) => {
        each.addEventListener("click", (e) => this.onClickCollection(e));
      });
    }
  };

  createCollection = async (e, single) => {
    if (!localStorage.getItem("account")) {
      sendAlert("Please sign in with metamask", "danger", true);
      return;
    }
    const {
      data: { users },
    } = await axios.get(`/user/${localStorage.getItem("account")}`);
    if (users?.length == 0) {
      sendAlert("Signature is needed", "danger", true);
      return;
    }
    if (
      this.collectionInputs[0].value == "" ||
      this.collectionInputs[1].value == "" ||
      this.collectionInputs[2].value == "" ||
      !this.file
    ) {
      sendAlert("Empty values in the form", "danger", true);
      return;
    }
    this.createButton721.disabled = true;
    this.createButton1155.disabled = true;
    this.spinner.style.display = "block";

    console.log("[ Uploading image...");

    const data = new FormData();
    data.append("file", this.file);
    data.append("upload_preset", "ml_default");
    data.append("cloud_name", "Honeywell");
    const { url } = await fetch("https://api.cloudinary.com/v1_1/Honeywell/image/upload", {
      method: "post",
      body: data,
    }).then((resp) => resp.json());

    try {
      let collectionAddress, tx;
      if (single) {
        console.log("[ Creating ERC721 collection...");

        const contract = new this.web3.eth.Contract(Factory721.abi, Factory721.address);
        tx = await contract.methods
          .createToken(
            this.collectionInputs[0].value,
            this.collectionInputs[1].value,
            "",
            "https://localhost:8080/contractMetadata/{address}",
            [],
            BN.from(this.generateRandomHash())
          )
          .send({ from: localStorage.getItem("account") });
        collectionAddress = tx.events.Create721RaribleUserProxy.returnValues.proxy;
      } else {
        console.log("[ Creating ERC1155 collection...");

        const contract = new this.web3.eth.Contract(Factory1155.abi, Factory1155.address);
        tx = await contract.methods
          .createToken(
            this.collectionInputs[0].value,
            this.collectionInputs[1].value,
            "",
            "https://localhost:8080/contractMetadata/{address}",
            [],
            BN.from(this.generateRandomHash())
          )
          .send({ from: localStorage.getItem("account") });
        collectionAddress = tx.events.Create1155RaribleUserProxy.returnValues.proxy;
      }

      console.log(`[ New collection contract : ${collectionAddress}`);
      console.log("[ Saving your activity...");

      await axios.post("/collection", {
        blockchain: "DOGECHAIN",
        single,
        collectionId: collectionAddress,
        category: this.currentCategory,
        image: url,
        name: this.collectionInputs[0].value,
        symbol: this.collectionInputs[1].value,
        description: this.collectionInputs[2].value,
        owner: localStorage.getItem("account"),
        standard: single ? "ERC721" : "ERC1155",
        website: this.collectionInputs[3].value,
        telegram: this.collectionInputs[4].value,
        discord: this.collectionInputs[5].value,
        twitter: this.collectionInputs[6].value,
      });

      console.log("[ Collection was created");
      this.spinner.style.display = "none";
      document.getElementById("close-add-collection").click()
      document.getElementById("trigger-success-add").click()
      this.getCollections();
    } catch (e) {
      console.log(e);
      if (e.code == 4001) sendAlert("User rejected", "danger", true);
      else sendAlert("Transaction failed", "danger", true);
      this.spinner.style.display = "none";
    }

    this.createButton721.disabled = false;
    this.createButton1155.disabled = false;
  };

  importItems = async (single, address, datas) => {
    const contract = new this.web3.eth.Contract(
      single ? ERC721RaribleMinimal.abi : ERC1155RaribleMinimal.abi,
      address
    );

    const { data: res1 } = await axios.get(
      `https://explorer-testnet.dogechain.dog/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${address}&topic0=${this.web3.utils.toHex(
        this.web3.utils.sha3("TransferSingle(address,address,address,uint256,uint256)")
      )}`
    );
    const {
      data: { result },
    } = await axios.get(
      `https://explorer-testnet.dogechain.dog/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${address}&topic0=${this.web3.utils.toHex(
        this.web3.utils.sha3(single ? "Transfer(address,address,uint256)" : "URI(string,uint256)")
      )}`
    );

    const tokenIds = result.map((x) => BN.from(x.topics[single ? 3 : 1]).toString());
    const multicall = new Multicall({
      multicallAddress: "0x50AF02f8B6b7ae4f49e48E7DFDa3604Ff3F40163",
      provider: this.web3.currentProvider,
    });
    let multicallArray = [];

    tokenIds.forEach((x) => {
      single
        ? multicallArray.push(contract.methods.tokenURI(x))
        : multicallArray.push(contract.methods.uri(x));
      multicallArray.push(contract.methods.owner());
      single
        ? multicallArray.push(contract.methods.ownerOf(x))
        : multicallArray.push(contract.methods.owner());
    });
    const multiResult = await multicall.aggregate(multicallArray);
    const nfts = await Promise.all(
      tokenIds.map(async (x, i) => {
        const tokenURI = multiResult[i * 3];
        const media = (await axios.get(tokenURI)).data.image;

        let filetype = "";
        if (media.match(/\.(pjp|jpg|pjpeg|jpeg|jfif|png|gif)$/i)) filetype = "image";
        if (media.match(/\.(m4v|mp4)$/i)) filetype = "video";
        return {
          id: x,
          supply: single ? 1 : BN.from("0x" + res1.result[i].data.slice(66)).toNumber(),
          creator: multiResult[i * 3 + 1].toLowerCase(),
          owner: single ? multiResult[i * 3 + 2].toLowerCase() : "",
          collectionId: address,
          tokenURI,
          price: 1,
          likes: [],
          properties: [],
          levels: [],
          stats: [],
          filetype,
          unlockable: "",
          saletype: -1,
        };
      })
    );
    const { data: { success: success1 } } = await axios.post("/collection", datas);
    if (!success1) {
      sendAlert(`Already exists`, "danger");
      this.spinner.style.display = "none";
    }
    else {
      const { data: { success } } = await axios.post("/item/import", { items: nfts });
      if (success) {
        document.getElementById("close-import-collection").click()
        document.getElementById("trigger-success-import").click()
        this.spinner.style.display = "none";
      }
      await this.getCollections();
    }
  };

  importCollection = async (e) => {
    const address = document.getElementById("collection-address").value;
    const description = document.getElementById("collection-description").value;
    if (!this.file1 || address == "" || description == "")
      sendAlert("Empty values in the form", "danger");
    else {
      this.spinner.style.display = "block";
      const myContract = new this.web3.eth.Contract(ERC165.abi, address);
      const ERC1155InterfaceId = "0xd9b67a26";
      const ERC721InterfaceId = "0x80ac58cd";
      try {
        const isERC721 = await myContract.methods.supportsInterface(ERC721InterfaceId).call();
        const isERC1155 = await myContract.methods.supportsInterface(ERC1155InterfaceId).call();

        if ((isERC721 == true && isERC1155 == false) || (isERC721 == false && isERC1155 == true)) {
          let abi;
          if (isERC721 == true && isERC1155 == false) abi = ERC721RaribleMinimal.abi;
          if (isERC721 == false && isERC1155 == true) abi = ERC1155RaribleMinimal.abi;
          const contract = new this.web3.eth.Contract(abi, address);
          console.log("[ Uploading image...");

          const data = new FormData();
          data.append("file", this.file1);
          data.append("upload_preset", "ml_default");
          data.append("cloud_name", "Honeywell");
          const { url } = await fetch("https://api.cloudinary.com/v1_1/Honeywell/image/upload", {
            method: "post",
            body: data,
          }).then((resp) => resp.json());
          try {
            await this.importItems(isERC721, address, {
              blockchain: "DOGECHAIN",
              single: isERC721,
              collectionId: address,
              category: this.currentCategoryForImport,
              image: url,
              name: await contract.methods.name().call(),
              symbol: await contract.methods.symbol().call(),
              description: document.getElementById("collection-description").value,
              owner: (await contract.methods.owner().call()).toLowerCase(),
              standard: isERC721 ? "ERC721" : "ERC1155",
              website: document.getElementById("collection-website").value,
              telegram: document.getElementById("collection-telegram").value,
              discord: document.getElementById("collection-discord").value,
              twitter: document.getElementById("collection-twitter").value,
            });
          } catch (e) {
            console.log(e);
            sendAlert(`Error occured`, "danger");
            this.spinner.style.display = "none";
          }
        }
      } catch (e) {
        console.log(e);
        sendAlert("Invalid address", "danger");
      }
    }
  };

  importImage = async (e) => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      if (imageTypes.some((x) => x == e.target.files[0].type)) {
        this.file = e.target.files[0];
        if (this.file) this.previewZone.src = URL.createObjectURL(this.file);
        else this.previewZone.src = "";
      } else {
        sendAlert("Wrong format", "danger");
        e.target.value = null;
        this.file = undefined;
        this.previewZone.src = "";
      }
    } else {
      this.previewZone.src = "";
      this.file = undefined;
    }
  };

  importImage1 = async (e) => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      if (imageTypes.some((x) => x == e.target.files[0]?.type)) {
        this.file1 = e.target.files[0];
        if (this.file1) this.previewZone1.src = URL.createObjectURL(this.file1);
        else this.previewZone1.src = "";
      } else {
        sendAlert("Wrong format", "danger");
        e.target.value = null;
        this.file1 = undefined;
        this.previewZone1.src = "";
      }
    } else {
      this.previewZone1.src = "";
      this.file1 = undefined;
    }
  };
}

export default Collection;
