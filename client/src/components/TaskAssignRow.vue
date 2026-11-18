<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  users: {
    type: Array,
    required: true
  },
  assigning: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['assign']);

const owner = computed(() => props.task.userId || null);
const selectedUserId = ref(owner.value?._id || '');

watch(owner, (newOwner) => {
  selectedUserId.value = newOwner?._id || '';
});

const canAssign = computed(() =>
  !props.assigning && selectedUserId.value && selectedUserId.value !== owner.value?._id
);

function assign() {
  const user = props.users.find((u) => u._id === selectedUserId.value);
  if (user) {
    emit('assign', { task: props.task, user });
  }
}
</script>

<template>
  <tr>
    <td class="fw-medium">{{ task.todo }}</td>
    <td>
      <span v-if="task.completed" class="badge text-bg-success">
        <i class="bi bi-check-circle-fill me-1"></i>Voltooid
      </span>
      <span v-else class="badge text-bg-secondary">
        <i class="bi bi-circle me-1"></i>Open
      </span>
    </td>
    <td>
      <span v-if="owner">
        <i class="bi bi-person-circle me-1 text-primary"></i>{{ owner.username }}
      </span>
      <span v-else class="badge text-bg-warning">
        <i class="bi bi-person-dash me-1"></i>Niet toegekend
      </span>
    </td>
    <td>
      <div class="input-group input-group-sm assign-group">
        <select
          v-model="selectedUserId"
          class="form-select"
          :disabled="assigning"
          :aria-label="`Gebruiker kiezen voor ${task.todo}`"
        >
          <option value="" disabled>Kies een gebruiker</option>
          <option v-for="user in users" :key="user._id" :value="user._id">
            {{ user.username }}
          </option>
        </select>
        <button class="btn btn-primary" type="button" :disabled="!canAssign" @click="assign">
          <span v-if="assigning" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
          <template v-else>
            <i class="bi bi-person-plus me-1"></i>Toekennen
          </template>
        </button>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.assign-group {
  min-width: 260px;
}
</style>
