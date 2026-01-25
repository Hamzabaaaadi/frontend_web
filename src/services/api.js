import axios from 'axios'

export const API = import.meta.env.VITE_API_URL

const instance = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' }
})

instance.interceptors.request.use((config) => {
  try {
    const basic = localStorage.getItem('basicAuth')
    if (basic) config.headers.Authorization = `Basic ${basic}`
  } catch (e) {
    // ignore
  }
  return config
})

export default instance
