import axios from "axios";
import storage from "../utils/storage";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const getEVModels = async () => {
    const res = await axios.get(`${API}/ev/models`);
    // Some endpoints already return arrays, some have wrappers. 
    // To be safe and compatible with refactor:
    return res.data.success ? res.data.models : res.data;
};

export const planTrip = async ({ start, destination, evModelId, batteryPercent }) => {
    const token = storage.getItem("token");
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await axios.post(`${API}/trip/plan`, {
        start,
        destination,
        evModelId,
        batteryPercent: Number(batteryPercent),
    }, { headers });
    return res.data; // Controllers return full object including success: true
};

export const getTripHistory = async () => {
    const token = storage.getItem("token");
    if (!token) return [];

    const res = await axios.get(`${API}/trip/history`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data.success ? res.data.trips : res.data;
};

export const seedEVModels = async () => {
    const res = await axios.post(`${API}/ev/seed`);
    return res.data;
};

export const reverseGeocode = async (lat, lon) => {
    const res = await axios.get(`${API}/trip/reverse-geocode`, {
        params: { lat, lon }
    });
    return res.data; // returns { success: true, address: "..." }
};

