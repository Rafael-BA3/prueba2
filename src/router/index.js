import { createRouter, createWebHistory } from 'vue-router'
import { SESSION_STORAGE_KEY } from '../constants/storageKeys'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
    { path: '/auth', name: 'Auth', component: () => import('../views/AuthView.vue') },
    {
      path: '/tasks',
      name: 'Tasks',
      component: () => import('../views/TasksView.vue'),
      meta: { requiresAuth: true }
    },
    { path: '/about', name: 'About', component: () => import('../views/AboutView.vue') }
  ]
})

router.beforeEach((to) => {
  const hasSession =
    typeof window !== 'undefined' && Boolean(localStorage.getItem(SESSION_STORAGE_KEY))

  if (to.meta.requiresAuth && !hasSession) {
    return {
      name: 'Auth',
      query: { redirect: to.fullPath }
    }
  }

  if (to.name === 'Auth' && hasSession) {
    return { name: 'Tasks' }
  }

  return true
})

export default router
