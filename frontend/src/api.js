import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
};

export const studentAPI = {
    getAll: () => api.get('/students'),
    add: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    admit: (id, data) => api.patch(`/students/admit/${id}`, data),
};

export const postAPI = {
    getAll: () => api.get('/posts'),
    create: (data) => api.post('/posts', data),
    delete: (id) => api.delete(`/posts/${id}`),
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

export const courseAPI = {
    getAll: () => api.get('/courses'),
};

export default api;
