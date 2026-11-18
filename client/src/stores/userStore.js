import { defineStore } from 'pinia';
import axios from 'axios';
import { toStoreError } from '@/utils/storeError';

const userUrl = 'http://localhost:3000/user';
const axiosConfig = { withCredentials: true };

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        loading: false
    }),

    getters: {
        assignableUsers: (state) => state.users.filter((user) => user.roles?.includes('user'))
    },

    actions: {
        async retrieveUsers() {
            this.loading = true;
            try {
                const response = await axios.get(userUrl, axiosConfig);
                this.users = response.data;
            } catch (error) {
                throw toStoreError(error, 'Failed to retrieve users');
            } finally {
                this.loading = false;
            }
        },

        clear() {
            this.users = [];
        }
    }
});
