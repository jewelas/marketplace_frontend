import axios from 'axios'

export const getOrderByHash = async (data) => {
    const res = await axios.get(`/order/${data.hash}`)
    if (res.status !== 200) {
        throw new Error(`Error: ${res.status} ${res.data}`)
    }
    return res.data;
}

export const upsertOrder = async (data) => {
    const res = await axios.put('/order', data);
    if (res.status !== 200) {
        throw new Error(`Error: ${res.status} ${res.data}`)
    }
    return res.data
}

export const getOpenOrders = async () => {
    const res = await axios.get(`/order/orders/opened`);
    return res.data;
}

export const getOrdersByItemId = async (itemId) => {
    const res = await axios.get(`/order/item/${itemId}`);
    if (res.status !== 200) {
        return null;
        throw new Error(`Error: ${res.status} ${res.data}`)
    }
    return res.data;
}

export const updateBidData = async (data) => {
    const res = await axios.put(`/order/accepted`, data);
    if (res.status !== 200) {
        throw new Error(`Error: ${res.status} ${res.data}`)
    }
    return res.data;
}

export const updateBuyData = async (data) => {
    const res = await axios.put(`/order/bought`, data);
    if (res.status !== 200) {
        throw new Error(`Error: ${res.status} ${res.data}`)
    }
    return res.data;
}