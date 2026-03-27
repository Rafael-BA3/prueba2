<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <Navbar />
    <div class="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
      <section>
        <img :src="logo" alt="Logo de V-List" class="mb-8 h-auto w-full max-w-sm" />
        <p class="max-w-2xl text-2xl leading-relaxed text-zinc-300">
          Organiza tareas, separa cuentas personales y empresariales, simula admins y empleados,
          importa ejemplos desde una API y exporta recordatorios al calendario desde una sola app hecha con Vue 3.
        </p>

        <div class="mt-8 flex flex-wrap gap-4">
          <router-link
            :to="primaryRoute"
            class="rounded-full bg-cyan-500 px-8 py-4 text-lg font-semibold text-zinc-950 transition hover:bg-cyan-400"
          >
            {{ authStore.isAuthenticated ? 'Ir a mi panel' : 'Crear cuenta o entrar' }}
          </router-link>

          <router-link
            to="/about"
            class="rounded-full border border-zinc-700 px-8 py-4 text-lg font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
          >
            Ver requisitos
          </router-link>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2">
        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Cuentas</p>
          <h2 class="mt-3 text-2xl font-semibold">Personal o empresa</h2>
          <p class="mt-3 text-zinc-400">
            La demo ahora distingue usuarios normales de usuarios empresariales con flujos pensados para produccion futura.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Roles</p>
          <h2 class="mt-3 text-2xl font-semibold">Admins y empleados</h2>
          <p class="mt-3 text-zinc-400">
            Los administradores crean empresas y cargan tareas; los empleados se unen con codigo y exportan su jornada.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Estado</p>
          <h2 class="mt-3 text-2xl font-semibold">Todo local</h2>
          <p class="mt-3 text-zinc-400">
            Usuarios, empresas, sesiones y tareas viven en el navegador para que la presentacion no dependa de backend.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">API</p>
          <h2 class="mt-3 text-2xl font-semibold">Demo conectada</h2>
          <p class="mt-3 text-zinc-400">
            Los admins de empresa pueden importar tareas de ejemplo desde JSONPlaceholder para simular integracion externa.
          </p>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Navbar from '../components/Navbar.vue'
import logo from '../assets/vlist-logo.png'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const primaryRoute = computed(() => (authStore.isAuthenticated ? '/tasks' : '/auth'))
</script>
