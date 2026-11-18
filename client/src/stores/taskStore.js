import { defineStore } from 'pinia';
import axios from 'axios';
import { toStoreError } from '@/utils/storeError';

const taskUrl = 'http://localhost:3000/task';
const axiosConfig = { withCredentials: true };

export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [],
        loading: false
    }),

    actions: {
        async retrieveOwnTasks() {
            this.loading = true;
            this.tasks = [];
            try {
                const response = await axios.get(`${taskUrl}/me`, axiosConfig);
                this.tasks = response.data;
            } catch (error) {
                throw toStoreError(error, 'Failed to retrieve tasks');
            } finally {
                this.loading = false;
            }
        },

        async changeCompleted(taskId, completed) {
            this.loading = true;
            try {
                const response = await axios.patch(`${taskUrl}/${taskId}`, { completed }, axiosConfig);
                const index = this.tasks.findIndex((task) => task._id === taskId);
                if (index !== -1) {
                    this.tasks[index] = response.data;
                }
            } catch (error) {
                throw toStoreError(error, 'Failed to update task');
            } finally {
                this.loading = false;
            }
        },

        clear() {
            this.tasks = [];
        }
    }
});
