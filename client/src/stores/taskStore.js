import { defineStore } from 'pinia';
import axios from 'axios';
import { toStoreError } from '@/utils/storeError';

const taskUrl = 'http://localhost:3000/task';
const axiosConfig = { withCredentials: true };

export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [],
        allTasks: [],
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

        async retrieveAllTasks() {
            this.loading = true;
            try {
                const response = await axios.get(taskUrl, axiosConfig);
                this.allTasks = response.data;
            } catch (error) {
                throw toStoreError(error, 'Failed to retrieve all tasks');
            } finally {
                this.loading = false;
            }
        },

        async assignTask(taskId, user) {
            try {
                const response = await axios.patch(`${taskUrl}/${taskId}/user`, { userId: user._id }, axiosConfig);
                const index = this.allTasks.findIndex((task) => task._id === taskId);
                if (index !== -1) {
                    // de server geeft userId als uuid terug; voor de lijst tonen we dezelfde vorm als bij populate
                    this.allTasks[index] = {
                        ...response.data,
                        userId: { _id: user._id, username: user.username }
                    };
                }
            } catch (error) {
                throw toStoreError(error, 'Failed to assign task');
            }
        },

        clear() {
            this.tasks = [];
            this.allTasks = [];
        }
    }
});
