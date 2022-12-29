import axios from 'axios'

export const getNftCollectionById = async (data) => {
    const res = await axios.get(`/collection/${data.collection}`)
    if (res.status !== 200) {
        throw new Error(`Error: ${res.status} ${res.data}`)
    }
    console.log('<<<<<<<>>>>>>>>', res.data);
    return {
        type: res.data[0].standard,
    };
}

export const getNftCollectionByIdRaw = async (data) => {
    const res = await axios.get(`/collection/${data.collection}`)
    if (res.status !== 200) {
        return {
            status: res.status,
            value: {
                error: res.data
            }
        }
    }
    return {
        status: res.status,
        value: {
            type: res.data[0].standard,
        }
    };
}