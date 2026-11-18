import { createRouter, createWebHistory } from 'vue-router';
import { useSecurityStore } from '@/stores/securityStore';
import LoginView from '@/views/LoginView.vue';
import MyTasksView from '@/views/MyTasksView.vue';
import DashboardView from '@/views/DashboardView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home'
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { guestOnly: true }
        },
        {
            path: '/tasks',
            name: 'my-tasks',
            component: MyTasksView,
            meta: { role: 'user' }
        },
        {
            path: '/admin',
            name: 'dashboard',
            component: DashboardView,
            meta: { role: 'admin' }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: { name: 'home' }
        }
    ]
});

export function startRouteFor(securityStore) {
    if (!securityStore.isLoggedIn) {
        return { name: 'login' };
    }
    return securityStore.isAdmin ? { name: 'dashboard' } : { name: 'my-tasks' };
}

let loginChecked = false;

router.beforeEach(async (to) => {
    const securityStore = useSecurityStore();

    if (!loginChecked) {
        loginChecked = true;
        try {
            await securityStore.checkLogin();
        } catch {
            // geen geldige cookie: de gebruiker is niet ingelogd
        }
    }

    if (to.name === 'home') {
        return startRouteFor(securityStore);
    }

    if (to.meta.guestOnly && securityStore.isLoggedIn) {
        return startRouteFor(securityStore);
    }

    if (to.meta.role) {
        if (!securityStore.isLoggedIn) {
            return { name: 'login', query: { redirect: to.fullPath } };
        }
        if (!securityStore.user.roles?.includes(to.meta.role)) {
            return startRouteFor(securityStore);
        }
    }
});

export default router;
