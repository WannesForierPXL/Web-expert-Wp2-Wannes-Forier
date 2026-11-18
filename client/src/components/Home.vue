<template>
  <div class="container">
    <div v-if="user.username && !loading">
      <h2>Welcome, {{ user.username }}!</h2>
      <button @click="logout" :disabled="loading">Log Out</button>
    </div>
    
    <div v-else-if="!loading">
      <h2>Welcome</h2>
      <p>Please log in to access your account.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useSecurityStore } from '@/stores/securityStore';

export default {
  setup() {
    const securityStore = useSecurityStore();
    
    const errorMessage = ref('');
    

    const user = computed(() => securityStore.user);
    const loading = computed(() => securityStore.loading);

    onMounted(async () => {
      try {
        await securityStore.checkLogin();
      } catch (error) {
        errorMessage.value = error.message || 'Failed to verify login status';
      }
    });

    const logout = async () => {
      try {
        await securityStore.logout();
      } catch (error) {
        errorMessage.value = error.message || 'Failed to log out';
      }
    };

    return {
      user,
      loading,
      errorMessage,
      logout,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
}

.error {
  font-size: 1rem;
  color: #d32f2f;
  margin-bottom: 1rem;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
