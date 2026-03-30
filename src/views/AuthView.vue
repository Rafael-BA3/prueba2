<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <Navbar />

    <div class="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr,0.95fr] lg:items-start">
      <section class="space-y-6">
        <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Demo local</p>
        <h1 class="text-4xl font-bold leading-tight sm:text-5xl">
          Cuentas personales y empresariales sin base de datos.
        </h1>
        <p class="max-w-2xl text-xl leading-relaxed text-zinc-400">
          Todo se guarda en <code>localStorage</code> para la presentacion: usuarios, empresas,
          sesiones y tareas compartidas por empresa dentro del mismo navegador.
        </p>

        <div class="grid gap-4 sm:grid-cols-2">
          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 class="text-xl font-semibold">Cuenta personal</h2>
            <p class="mt-2 text-zinc-400">
              Ideal para la demo basica. Gestiona tus propias tareas sin flujo empresarial.
            </p>
          </article>

          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 class="text-xl font-semibold">Cuenta empresa</h2>
            <p class="mt-2 text-zinc-400">
              Los admins crean la empresa y cargan tareas; los empleados se unen con codigo y las exportan.
            </p>
          </article>

          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:col-span-2">
            <h2 class="text-xl font-semibold">Sin backend</h2>
            <p class="mt-2 text-zinc-400">
              Es una version demostrativa pensada para exponer el flujo completo antes de llevarlo a produccion.
            </p>
          </article>
        </div>
      </section>

      <section class="rounded-4xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30">
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
          <div v-if="mode === 'register'" class="space-y-4">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p class="text-sm font-semibold text-zinc-200">Tipo de cuenta</p>
              <div class="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-sm font-semibold transition"
                  :class="form.accountType === 'personal' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'"
                  @click="form.accountType = 'personal'"
                >
                  Personal
                </button>
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-sm font-semibold transition"
                  :class="form.accountType === 'company' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'"
                  @click="form.accountType = 'company'"
                >
                  Empresa
                </button>
              </div>
            </div>

            <div
              v-if="form.accountType === 'company'"
              class="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
            >
              <p class="text-sm font-semibold text-zinc-200">Rol empresarial</p>
              <div class="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-sm font-semibold transition"
                  :class="form.role === 'admin' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'"
                  @click="form.role = 'admin'"
                >
                  Administrador
                </button>
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-sm font-semibold transition"
                  :class="form.role === 'employee' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'"
                  @click="form.role = 'employee'"
                >
                  Empleado
                </button>
              </div>
            </div>
          </div>

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

          <div v-if="mode === 'register' && form.accountType === 'company' && form.role === 'admin'">
            <label class="mb-2 block text-sm text-zinc-400">Nombre de la empresa</label>
            <input
              v-model="form.companyName"
              type="text"
              placeholder="Ejemplo: Nova Logistics"
              class="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <div v-if="mode === 'register' && form.accountType === 'company' && form.role === 'admin'">
            <label class="mb-2 block text-sm text-zinc-400">Area o giro</label>
            <input
              v-model="form.companyIndustry"
              type="text"
              placeholder="Logistica, ventas, soporte..."
              class="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <div v-if="mode === 'register' && form.accountType === 'company' && form.role === 'employee'">
            <label class="mb-2 block text-sm text-zinc-400">Codigo de empresa</label>
            <input
              v-model="form.companyAccessCode"
              type="text"
              placeholder="Ejemplo: NOVA-AB12"
              class="w-full rounded-2xl bg-zinc-800 px-5 py-4 uppercase text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <div
            v-if="mode === 'register' && form.accountType === 'company' && form.role === 'employee' && availableCompanies.length"
            class="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <p class="text-sm font-semibold text-zinc-200">Empresas demo creadas en este navegador</p>
            <div class="mt-3 space-y-3">
              <div
                v-for="company in availableCompanies"
                :key="company.id"
                class="rounded-2xl bg-zinc-900 px-4 py-3"
              >
                <p class="font-semibold text-white">{{ company.name }}</p>
                <p class="mt-1 text-sm text-zinc-400">{{ company.industry }}</p>
                <p class="mt-2 text-sm text-cyan-300">Codigo: {{ company.accessCode }}</p>
              </div>
            </div>
          </div>

          <p v-if="feedback" class="rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-amber-300">
            {{ feedback }}
          </p>

          <button
            type="submit"
            class="w-full rounded-2xl bg-cyan-500 px-5 py-4 text-lg font-semibold text-zinc-950 transition hover:bg-cyan-400"
          >
            {{ mode === 'login' ? 'Entrar a V-List' : submitLabel }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
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
  password: '',
  accountType: 'personal',
  role: 'admin',
  companyName: '',
  companyIndustry: '',
  companyAccessCode: ''
})

const availableCompanies = computed(() => authStore.companies)
const submitLabel = computed(() => {
  if (form.accountType === 'personal') {
    return 'Crear cuenta personal'
  }

  return form.role === 'admin' ? 'Crear empresa y entrar' : 'Unirme como empleado'
})

const getRedirectTarget = () =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '/tasks'

watch(
  [mode, () => form.accountType, () => form.role],
  () => {
    feedback.value = ''

    if (mode.value === 'login') {
      form.name = ''
      form.accountType = 'personal'
      form.role = 'admin'
      form.companyName = ''
      form.companyIndustry = ''
      form.companyAccessCode = ''
      return
    }

    if (form.accountType === 'personal') {
      form.role = 'admin'
      form.companyName = ''
      form.companyIndustry = ''
      form.companyAccessCode = ''
      return
    }

    if (form.role === 'admin') {
      form.companyAccessCode = ''
      return
    }

    form.companyName = ''
    form.companyIndustry = ''
  },
  { immediate: true }
)

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
          password: form.password,
          accountType: form.accountType,
          role: form.role,
          companyName: form.companyName,
          companyIndustry: form.companyIndustry,
          companyAccessCode: form.companyAccessCode
        })

  if (!result.ok) {
    feedback.value = result.message
    return
  }

  router.push(getRedirectTarget())
}
</script>
