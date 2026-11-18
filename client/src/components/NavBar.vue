<script setup>
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useSecurityStore } from '@/stores/securityStore';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const securityStore = useSecurityStore();
const taskStore = useTaskStore();
const userStore = useUserStore();

const user = computed(() => securityStore.user);

async function logout() {
  try {
    await securityStore.logout();
  } finally {
    taskStore.clear();
    userStore.clear();
    router.push({ name: 'login' });
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand fw-semibold" :to="{ name: 'home' }">
        <i class="bi bi-check2-square me-2"></i>TaskManager
      </RouterLink>

      <template v-if="securityStore.isLoggedIn">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Navigatie tonen"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainNav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                @click.prevent
              >
                <i class="bi bi-person-circle fs-5 me-2"></i>
                {{ user.username }}
                <i
                  v-if="securityStore.isAdmin"
                  class="bi bi-shield-lock-fill ms-2"
                  title="Administrator"
                ></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <h6 class="dropdown-header">
                    Ingelogd als <strong>{{ user.username }}</strong>
                  </h6>
                </li>
                <li>
                  <span class="dropdown-item-text small text-body-secondary">
                    <template v-if="securityStore.isAdmin">
                      <i class="bi bi-shield-lock me-1"></i>Administrator
                    </template>
                    <template v-else>
                      <i class="bi bi-person me-1"></i>Gebruiker
                    </template>
                  </span>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item text-danger" type="button" @click="logout">
                    <i class="bi bi-box-arrow-right me-2"></i>Uitloggen
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </nav>
</template>
