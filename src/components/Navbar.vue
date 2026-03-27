<template>
  <nav class="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
      <router-link to="/" class="flex items-center gap-3">
        <img :src="logo" alt="Logo V-List" class="h-12 w-auto" />
      </router-link>

      <div class="flex flex-wrap items-center gap-3 text-sm text-zinc-200 md:text-base">
        <router-link to="/" class="rounded-full px-4 py-2 transition hover:bg-zinc-800">
          Inicio
        </router-link>
        <router-link to="/tasks" class="rounded-full px-4 py-2 transition hover:bg-zinc-800">
          Tareas
        </router-link>
        <router-link to="/about" class="rounded-full px-4 py-2 transition hover:bg-zinc-800">
          Requisitos
        </router-link>

        <div
          v-if="authStore.isAuthenticated"
          class="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 leading-tight"
        >
          <p class="font-semibold text-zinc-100">{{ authStore.currentUser.name }}</p>
          <p class="text-xs text-zinc-400">{{ accountLabel }}</p>
        </div>

        <router-link
          v-if="!authStore.isAuthenticated"
          to="/auth"
          class="rounded-full bg-cyan-500 px-4 py-2 font-semibold text-zinc-950 transition hover:bg-cyan-400"
        >
          Entrar
        </router-link>

        <button
          v-else
          type="button"
          class="rounded-full bg-zinc-800 px-4 py-2 font-semibold transition hover:bg-zinc-700"
          @click="handleLogout"
        >
          Salir
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/vlist-logo.png'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const accountLabel = computed(() => {
  if (!authStore.currentUser) return ''

  if (authStore.currentUser.accountType === 'personal') {
    return 'Cuenta personal'
  }

  const role = authStore.currentUser.role === 'admin' ? 'Admin de empresa' : 'Empleado'
  const company = authStore.currentUser.companyName || 'Empresa demo'

  return `${role} - ${company}`
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Auth' })
}
</script>
