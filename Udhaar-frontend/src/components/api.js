import axios from 'axios';

const api = axios.create({
    baseURL: "https://udhaar.vercel.app/api",
    // withCredentials: true,
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);