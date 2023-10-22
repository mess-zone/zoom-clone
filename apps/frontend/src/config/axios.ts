import axios from 'axios'

const serverAPI = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}/api/`,
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
});

export { serverAPI }