import { API_HOST } from '@utils/consts';

const client = {
    async get(path: string, options?: RequestInit): Promise<Response> {
        return fetch(`${API_HOST}${path}`, {
            ...options,
            method: 'GET',
        });
    },

    async post(path: string, options?: RequestInit): Promise<Response> {
        return fetch(`${API_HOST}${path}`, {
            ...options,
            method: 'POST',
        });
    },
};

export default client; 