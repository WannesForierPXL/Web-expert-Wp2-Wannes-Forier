import { defineStore } from 'pinia';
import axios from 'axios';
import { toStoreError } from '@/utils/storeError';

const securityUrl = 'http://localhost:3000/security';
const axiosConfig = { withCredentials: true };

export const useSecurityStore = defineStore('security', {
    state: () => ({
        user: {},
        loading: false
    }),

    getters: {
        isLoggedIn: (state) => !!state.user.username,
        isAdmin: (state) => state.user.roles?.includes('admin') ?? false,
        isUser: (state) => state.user.roles?.includes('user') ?? false
    },

    actions: {
        async login(credentials) {
            this.loading = true;
            this.user = {};
            try {
                const { username, password } = credentials;
                const response = await axios.post(`${securityUrl}/login`, { username, password }, axiosConfig);
                this.user = response.data;
            } catch (error) {
                throw toStoreError(error, 'Login failed');
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            this.loading = true;
            try {
                await axios.post(`${securityUrl}/logout`, {}, axiosConfig);
            } catch (error) {
                throw toStoreError(error, 'Logout failed');
            } finally {
                this.user = {};
                this.loading = false;
            }
        },

        async checkLogin() {
            this.loading = true;
            try {
                const response = await axios.post(`${securityUrl}/login/check`, {}, axiosConfig);
                this.user = response.data;
            } catch (error) {
                this.user = {};
                throw toStoreError(error, 'Login check failed');
            } finally {
                this.loading = false;
            }
        }
    }
});
