import axios from 'axios'

export const getNftItemById = async (data) => {
    const res = await axios.get(`/item/${data.itemId}`)
    if (res.status !== 200 || !res.data.success) {
        throw new Error(`Error: ${res.status} ${res.data}`)
    }
    console.log('((((((((())))))))))', res.data);
    return {
        lazySupply: 0,
        contract: res.data.items[0].collectionId,
        supply: res.data.items[0].supply,
        tokenId: res.data.items[0].id
    };
}

export const getNftItemByIdRaw = async (data) => {
    const res = await axios.get(`/item/${data.itemId}`)
    console.log(res);
    if (res.status !== 200 || !res.data.success) {
        return {
            status: res.status,
            value: {
                error: res.data.error
            }
        }
    }
    return {
        status: res.status,
        value: {
            lazySupply: "0",
            contract: res.data.items[0].collectionId,
            supply: res.data.items[0].supply,
            tokenId: res.data.items[0].id
        }
    };
}

export const getNftLazyItemByIdRaw = async (data) => { }