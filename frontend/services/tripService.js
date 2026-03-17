import axios from "axios";

const API = "http://localhost:5000/api";

export const getEVModels = async () => {
    const res = await axios.get(`${API}/ev/models`);
    return res.data;
};

export const planTrip = async ({ start, destination, evModelId, batteryPercent }) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(
        `${API}/trip/plan`,
        {
            start,
            destination,
            evModelId,
            batteryPercent: Number(batteryPercent),
        },
        { headers }
    );
    return res.data;
};

export const getTripHistory = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/trip/history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const seedEVModels = async () => {
    const res = await axios.post(`${API}/ev/seed`);
    return res.data;
};

