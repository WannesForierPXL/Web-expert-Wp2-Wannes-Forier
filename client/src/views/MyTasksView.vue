<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import TaskItem from '@/components/TaskItem.vue';

const taskStore = useTaskStore();

const errorMessage = ref('');
const loaded = ref(false);
const updatingTaskId = ref(null);

const tasks = computed(() => taskStore.tasks);
const completedCount = computed(() => tasks.value.filter((task) => task.completed).length);
const progress = computed(() =>
  tasks.value.length ? Math.round((completedCount.value / tasks.value.length) * 100) : 0
);

async function loadTasks() {
  errorMessage.value = '';
  try {
    await taskStore.retrieveOwnTasks();
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loaded.value = true;
  }
}

async function toggleTask({ taskId, completed }) {
  errorMessage.value = '';
  updatingTaskId.value = taskId;
  try {
    await taskStore.changeCompleted(taskId, completed);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    updatingTaskId.value = null;
  }
}

onMounted(loadTasks);
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h3 mb-0"><i class="bi bi-list-check me-2 text-primary"></i>Mijn taken</h1>
    <button class="btn btn-outline-primary btn-sm" :disabled="taskStore.loading" @click="loadTasks">
      <i class="bi bi-arrow-clockwise me-1"></i>Vernieuwen
    </button>
  </div>

  <div v-if="errorMessage" class="alert alert-danger" role="alert">
    <i class="bi bi-exclamation-triangle me-1"></i>{{ errorMessage }}
  </div>

  <div v-if="!loaded" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Laden...</span>
    </div>
  </div>

  <template v-else-if="tasks.length">
    <div class="card shadow-sm">
      <div class="card-header bg-body">
        <div class="d-flex justify-content-between small mb-1">
          <span>{{ completedCount }} van {{ tasks.length }} voltooid</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="progress" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar bg-success" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
      <ul class="list-group list-group-flush">
        <TaskItem
          v-for="task in tasks"
          :key="task._id"
          :task="task"
          :updating="updatingTaskId === task._id"
          @toggle="toggleTask"
        />
      </ul>
    </div>
  </template>

  <div v-else class="text-center text-body-secondary py-5">
    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
    Je hebt nog geen taken.
  </div>
</template>
