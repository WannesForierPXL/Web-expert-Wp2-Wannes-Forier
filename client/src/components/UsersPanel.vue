<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useTaskStore } from '@/stores/taskStore';

const emit = defineEmits(['show-tasks']);

const userStore = useUserStore();
const taskStore = useTaskStore();

const search = ref('');

const users = computed(() => {
  const term = search.value.trim().toLowerCase();
  return userStore.users
    .filter((user) => user.username.toLowerCase().includes(term))
    .sort((a, b) => a.username.localeCompare(b.username));
});

function tasksOf(user) {
  return taskStore.allTasks.filter((task) => task.userId?._id === user._id);
}

function completedOf(user) {
  return tasksOf(user).filter((task) => task.completed).length;
}

function isUser(user) {
  return user.roles?.includes('user');
}
</script>

<template>
  <div class="card shadow-sm">
    <div class="card-header bg-body d-flex flex-wrap gap-2 justify-content-between align-items-center">
      <div class="input-group input-group-sm search-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input
          v-model="search"
          type="search"
          class="form-control"
          placeholder="Zoek op gebruikersnaam"
          aria-label="Zoek op gebruikersnaam"
        />
      </div>
      <span class="small text-body-secondary">{{ users.length }} van {{ userStore.users.length }} gebruikers</span>
    </div>

    <div v-if="users.length" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th scope="col">Gebruiker</th>
            <th scope="col">Rol</th>
            <th scope="col">Taken</th>
            <th scope="col" class="text-end">Acties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>
              <i class="bi bi-person-circle me-2 text-primary"></i>
              <span class="fw-medium">{{ user.username }}</span>
            </td>
            <td>
              <span
                v-for="role in user.roles"
                :key="role"
                class="badge me-1"
                :class="role === 'admin' ? 'text-bg-dark' : 'text-bg-info'"
              >
                <i class="bi me-1" :class="role === 'admin' ? 'bi-shield-lock' : 'bi-person'"></i>{{ role }}
              </span>
            </td>
            <td>
              <template v-if="isUser(user)">
                {{ completedOf(user) }} / {{ tasksOf(user).length }} voltooid
              </template>
              <span v-else class="text-body-secondary">–</span>
            </td>
            <td class="text-end">
              <button
                v-if="isUser(user)"
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="emit('show-tasks', user)"
              >
                <i class="bi bi-list-task me-1"></i>Bekijk taken
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center text-body-secondary py-5">
      <i class="bi bi-search fs-1 d-block mb-2"></i>
      Geen gebruikers gevonden.
    </div>
  </div>
</template>

<style scoped>
.search-group {
  max-width: 320px;
}
</style>
