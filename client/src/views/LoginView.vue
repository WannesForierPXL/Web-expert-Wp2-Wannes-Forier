<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSecurityStore } from '@/stores/securityStore';
import { startRouteFor } from '@/router';

const route = useRoute();
const router = useRouter();
const securityStore = useSecurityStore();

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = computed(() => securityStore.loading);

async function login() {
  errorMessage.value = '';
  try {
    await securityStore.login({ username: username.value, password: password.value });
    password.value = '';
    const redirect = route.query.redirect;
    router.push(redirect || startRouteFor(securityStore));
  } catch (error) {
    errorMessage.value = error.status === 401
      ? 'Gebruikersnaam of wachtwoord is onjuist.'
      : error.message;
  }
}
</script>

<template>
  <div class="row justify-content-center mt-5">
    <div class="col-sm-10 col-md-6 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h4 mb-4 text-center">
            <i class="bi bi-box-arrow-in-right me-2 text-primary"></i>Inloggen
          </h1>

          <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
            <i class="bi bi-exclamation-triangle me-1"></i>{{ errorMessage }}
          </div>

          <form @submit.prevent="login">
            <div class="mb-3">
              <label for="username" class="form-label">Gebruikersnaam</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
                <input
                  id="username"
                  v-model.trim="username"
                  type="text"
                  class="form-control"
                  autocomplete="username"
                  required
                  autofocus
                />
              </div>
            </div>
            <div class="mb-4">
              <label for="password" class="form-label">Wachtwoord</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-key"></i></span>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                />
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              Inloggen
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
