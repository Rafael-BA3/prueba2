<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <Navbar />

    <div class="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr,0.95fr] lg:items-start">
      <section class="space-y-6">
        <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Sesion local</p>
        <h1 class="text-4xl font-bold leading-tight sm:text-5xl">
          Varios usuarios, tareas separadas y sin base de datos.
        </h1>
        <p class="max-w-2xl text-xl leading-relaxed text-zinc-400">
          Para este proyecto usamos almacenamiento local del navegador. Cada cuenta conserva
          su propia lista de tareas, suficiente para una demo academica o prototipo funcional.
        </p>

        <div class="grid gap-4 sm:grid-cols-2">
          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 class="text-xl font-semibold">Login y registro</h2>
            <p class="mt-2 text-zinc-400">
              Puedes crear varias cuentas de prueba y cada una mantiene su sesion por separado.
            </p>
          </article>

          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 class="text-xl font-semibold">Sin backend</h2>
            <p class="mt-2 text-zinc-400">
              Todo se guarda en localStorage, ideal para avanzar rapido mientras defines la base de datos.
            </p>
          </article>
        </div>
      </section>

      <section class="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30">
        <div class="mb-6 flex gap-3">
          <button
            type="button"
            class="rounded-full px-5 py-3 font-semibold transition"
            :class="mode === 'login' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'"
            @click="mode = 'login'"
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            class="rounded-full px-5 py-3 font-semibold transition"
            :class="mode === 'register' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'"
            @click="mode = 'register'"
          >
            Crear cuenta
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div v-if="mode === 'register'">
            <label class="mb-2 block text-sm text-zinc-400">Nombre</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Tu nombre"
              class="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm text-zinc-400">Correo</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="correo@ejemplo.com"
              class="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm text-zinc-400">Contrasena</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Usa una clave de prueba"
              class="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <p v-if="feedback" class="rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-amber-300">
            {{ feedback }}
          </p>

          <button
            type="submit"
            class="w-full rounded-2xl bg-cyan-500 px-5 py-4 text-lg font-semibold text-zinc-950 transition hover:bg-cyan-400"
          >
            {{ mode === 'login' ? 'Entrar a V-List' : 'Crear cuenta y continuar' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mode = ref('login')
const feedback = ref('')
const form = reactive({
  name: '',
  email: '',
  password: ''
})

const getRedirectTarget = () =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '/tasks'

watch(mode, () => {
  feedback.value = ''
  if (mode.value === 'login') {
    form.name = ''
  }
})

const submitForm = () => {
  const result =
    mode.value === 'login'
      ? authStore.login({
          email: form.email,
          password: form.password
        })
      : authStore.register({
          name: form.name,
          email: form.email,
          password: form.password
        })

  if (!result.ok) {
    feedback.value = result.message
    return
  }

  router.push(getRedirectTarget())
}
</script>
