<script setup>
import { ref, computed } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import TaskAssignRow from '@/components/TaskAssignRow.vue';

// zoekterm: zoekt in de taak en in de naam van de gebruiker aan wie ze toegekend is
const search = defineModel('search', { type: String, default: '' });

const emit = defineEmits(['success', 'error']);

const taskStore = useTaskStore();
const userStore = useUserStore();

const statusFilter = ref('all');
const assigningTaskId = ref(null);

const tasks = computed(() => taskStore.allTasks);
const assignableUsers = computed(() => userStore.assignableUsers);

const stats = computed(() => ({
  total: tasks.value.length,
  assigned: tasks.value.filter((task) => task.userId).length,
  unassigned: tasks.value.filter((task) => !task.userId).length,
  completed: tasks.value.filter((task) => task.completed).length
}));

const filteredTasks = computed(() => {
  let result = tasks.value;
  if (statusFilter.value === 'assigned') result = result.filter((task) => task.userId);
  if (statusFilter.value === 'unassigned') result = result.filter((task) => !task.userId);
  const term = search.value.trim().toLowerCase();
  if (term) {
    result = result.filter((task) =>
      task.todo.toLowerCase().includes(term) ||
      task.userId?.username?.toLowerCase().includes(term)
    );
  }
  return result;
});

function setStatusFilter(value) {
  statusFilter.value = value;
}

async function assignTask({ task, user }) {
  assigningTaskId.value = task._id;
  try {
    await taskStore.assignTask(task._id, user);
    emit('success', `"${task.todo}" is toegekend aan ${user.username}.`);
  } catch (error) {
    emit('error', error.message);
  } finally {
    assigningTaskId.value = null;
  }
}
</script>

<template>
  <div class="row g-3 mb-4">
    <div class="col-6 col-md-3">
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <div class="small text-body-secondary"><i class="bi bi-list-task me-1"></i>Totaal</div>
          <div class="fs-3 fw-semibold">{{ stats.total }}</div>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <div class="small text-body-secondary"><i class="bi bi-person-check me-1"></i>Toegekend</div>
          <div class="fs-3 fw-semibold text-primary">{{ stats.assigned }}</div>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <div class="small text-body-secondary"><i class="bi bi-person-dash me-1"></i>Niet toegekend</div>
          <div class="fs-3 fw-semibold text-warning">{{ stats.unassigned }}</div>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <div class="small text-body-secondary"><i class="bi bi-check-circle me-1"></i>Voltooid</div>
          <div class="fs-3 fw-semibold text-success">{{ stats.completed }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-header bg-body d-flex flex-wrap gap-2 justify-content-between align-items-center">
      <div class="btn-group btn-group-sm" role="group" aria-label="Filter op toekenning">
        <button
          type="button"
          class="btn"
          :class="statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
          @click="setStatusFilter('all')"
        >Alle ({{ stats.total }})</button>
        <button
          type="button"
          class="btn"
          :class="statusFilter === 'assigned' ? 'btn-primary' : 'btn-outline-primary'"
          @click="setStatusFilter('assigned')"
        >Toegekend ({{ stats.assigned }})</button>
        <button
          type="button"
          class="btn"
          :class="statusFilter === 'unassigned' ? 'btn-primary' : 'btn-outline-primary'"
          @click="setStatusFilter('unassigned')"
        >Niet toegekend ({{ stats.unassigned }})</button>
      </div>

      <div class="input-group input-group-sm task-search">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input
          v-model="search"
          type="search"
          class="form-control"
          placeholder="Zoek op taak of gebruiker"
          aria-label="Zoek op taak of gebruiker"
        />
      </div>
    </div>

    <div v-if="filteredTasks.length" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th scope="col">Taak</th>
            <th scope="col">Status</th>
            <th scope="col">Toegekend aan</th>
            <th scope="col">Toekennen</th>
          </tr>
        </thead>
        <tbody>
          <TaskAssignRow
            v-for="task in filteredTasks"
            :key="task._id"
            :task="task"
            :users="assignableUsers"
            :assigning="assigningTaskId === task._id"
            @assign="assignTask"
          />
        </tbody>
      </table>
    </div>
    <div v-else class="text-center text-body-secondary py-5">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      Geen taken in deze selectie.
    </div>
  </div>
</template>

<style scoped>
.task-search {
  max-width: 280px;
}
</style>
