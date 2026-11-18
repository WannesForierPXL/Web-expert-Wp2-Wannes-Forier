<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  updating: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle']);

function toggle(event) {
  emit('toggle', { taskId: props.task._id, completed: event.target.checked });
}
</script>

<template>
  <li class="list-group-item d-flex align-items-center gap-3 py-3">
    <input
      :id="`completed-${task._id}`"
      class="form-check-input m-0 fs-5"
      type="checkbox"
      :checked="task.completed"
      :disabled="updating"
      @change="toggle"
    />
    <label
      :for="`completed-${task._id}`"
      class="flex-grow-1 mb-0"
      :class="{ 'text-decoration-line-through text-body-secondary': task.completed }"
    >
      {{ task.todo }}
    </label>
    <span v-if="updating" class="spinner-border spinner-border-sm text-primary" aria-hidden="true"></span>
    <span v-else-if="task.completed" class="badge text-bg-success">
      <i class="bi bi-check-circle-fill me-1"></i>Voltooid
    </span>
    <span v-else class="badge text-bg-secondary">
      <i class="bi bi-circle me-1"></i>Open
    </span>
  </li>
</template>
