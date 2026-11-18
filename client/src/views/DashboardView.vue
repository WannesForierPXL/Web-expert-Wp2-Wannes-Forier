<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import AllTasksPanel from '@/components/AllTasksPanel.vue';
import UsersPanel from '@/components/UsersPanel.vue';

const route = useRoute();
const router = useRouter();
const taskStore = useTaskStore();
const userStore = useUserStore();

const errorMessage = ref('');
const successMessage = ref('');
const loaded = ref(false);
const taskSearch = ref('');

// de actieve tab staat in de URL (?tab=users), zodat een refresh op dezelfde tab blijft
const activeTab = computed({
  get: () => (route.query.tab === 'users' ? 'users' : 'tasks'),
  set: (tab) => router.replace({ query: tab === 'tasks' ? {} : { tab } })
});

let successTimer;
function showSuccess(message) {
  errorMessage.value = '';
  successMessage.value = message;
  clearTimeout(successTimer);
  successTimer = setTimeout(() => (successMessage.value = ''), 4000);
}

function showError(message) {
  successMessage.value = '';
  errorMessage.value = message;
}

function showTasksOf(user) {
  taskSearch.value = user.username;
  activeTab.value = 'tasks';
}

async function loadData() {
  errorMessage.value = '';
  try {
    await Promise.all([taskStore.retrieveAllTasks(), userStore.retrieveUsers()]);
  } catch (error) {
    showError(error.message);
  } finally {
    loaded.value = true;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h3 mb-0"><i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard</h1>
    <button
      class="btn btn-outline-primary btn-sm"
      :disabled="taskStore.loading || userStore.loading"
      @click="loadData"
    >
      <i class="bi bi-arrow-clockwise me-1"></i>Vernieuwen
    </button>
  </div>

  <ul class="nav nav-tabs mb-4">
    <li class="nav-item">
      <button
        type="button"
        class="nav-link"
        :class="{ active: activeTab === 'tasks' }"
        @click="activeTab = 'tasks'"
      >
        <i class="bi bi-kanban me-1"></i>Alle taken
        <span class="badge rounded-pill text-bg-secondary ms-1">{{ taskStore.allTasks.length }}</span>
      </button>
    </li>
    <li class="nav-item">
      <button
        type="button"
        class="nav-link"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        <i class="bi bi-people me-1"></i>Gebruikers
        <span class="badge rounded-pill text-bg-secondary ms-1">{{ userStore.users.length }}</span>
      </button>
    </li>
  </ul>

  <div v-if="errorMessage" class="alert alert-danger alert-dismissible" role="alert">
    <i class="bi bi-exclamation-triangle me-1"></i>{{ errorMessage }}
    <button type="button" class="btn-close" aria-label="Sluiten" @click="errorMessage = ''"></button>
  </div>
  <div v-if="successMessage" class="alert alert-success alert-dismissible" role="status">
    <i class="bi bi-check-circle me-1"></i>{{ successMessage }}
    <button type="button" class="btn-close" aria-label="Sluiten" @click="successMessage = ''"></button>
  </div>

  <div v-if="!loaded" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Laden...</span>
    </div>
  </div>

  <template v-else>
    <AllTasksPanel
      v-if="activeTab === 'tasks'"
      v-model:search="taskSearch"
      @success="showSuccess"
      @error="showError"
    />
    <UsersPanel
      v-else
      @show-tasks="showTasksOf"
    />
  </template>
</template>
