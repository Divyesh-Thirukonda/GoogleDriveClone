import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const register = (username, password) => API.post('/register', { username, password });
export const login = (username, password) => API.post('/login', { username, password });
export const fetchDocuments = (token) =>
    API.get('/documents', { headers: { Authorization: `Bearer ${token}` } });
