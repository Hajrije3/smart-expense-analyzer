import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
    const user = localStorage.getItem("user");

    if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.token) {
            config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
    }

    return config;
});

export default API;