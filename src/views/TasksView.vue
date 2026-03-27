<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <Navbar />
    <div class="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">{{ panelEyebrow }}</p>
          <h1 class="mt-3 text-4xl font-bold">{{ panelTitle }}</h1>
          <p class="mt-3 max-w-2xl text-lg text-zinc-400">
            {{ welcomeMessage }}
          </p>
        </div>

        <div :class="statsGridClass" class="grid gap-3">
          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p class="text-sm text-zinc-400">Total</p>
            <p class="mt-2 text-3xl font-bold">{{ totalTasks }}</p>
          </article>

          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p class="text-sm text-zinc-400">Pendientes</p>
            <p class="mt-2 text-3xl font-bold">{{ pendingTasks }}</p>
          </article>

          <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p class="text-sm text-zinc-400">Completadas</p>
            <p class="mt-2 text-3xl font-bold">{{ completedTasks }}</p>
          </article>

          <article v-if="isCompanyAccount" class="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p class="text-sm text-zinc-400">{{ companyExtraStatLabel }}</p>
            <p class="mt-2 text-3xl font-bold">{{ companyExtraStatValue }}</p>
          </article>
        </div>
      </section>

      <section v-if="isCompanyAccount" class="grid gap-4 lg:grid-cols-3">
        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Empresa</p>
          <h2 class="mt-3 text-2xl font-semibold">{{ currentCompany?.name || authStore.currentUser.companyName }}</h2>
          <p class="mt-3 text-zinc-400">
            {{ currentCompany?.industry || authStore.currentUser.companyIndustry || 'Operaciones demo' }}
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Tu rol</p>
          <h2 class="mt-3 text-2xl font-semibold">{{ roleLabel }}</h2>
          <p class="mt-3 text-zinc-400">
            {{ roleDescription }}
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Codigo de acceso</p>
          <h2 class="mt-3 text-2xl font-semibold">{{ authStore.currentUser.companyAccessCode }}</h2>
          <p class="mt-3 text-zinc-400">
            Comparte este codigo con tus empleados para que se unan a la demo local de la empresa.
          </p>
        </article>
      </section>

      <TaskForm v-if="showTaskForm" />

      <section v-if="isCompanyAdmin" class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Equipo</p>
            <h2 class="mt-2 text-2xl font-semibold">Usuarios registrados en tu empresa</h2>
            <p class="mt-2 text-zinc-400">
              Esta lista se alimenta con las cuentas empresariales creadas en este navegador usando el mismo codigo de acceso.
            </p>
          </div>
          <div class="rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-300">
            Total: {{ memberCount }} miembro(s)
          </div>
        </div>

        <div class="mt-6 grid gap-3">
          <article
            v-for="member in companyMembers"
            :key="member.id"
            class="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-5 py-4"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-white">{{ member.name }}</p>
                <p class="mt-1 text-sm text-zinc-400">{{ member.email }}</p>
              </div>
              <span class="rounded-full bg-zinc-800 px-4 py-2 text-sm text-cyan-300">
                {{ member.role === 'admin' ? 'Administrador' : 'Empleado' }}
              </span>
            </div>
          </article>
        </div>
      </section>

      <section v-if="canImportExternalApi" class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">API externa</p>
            <h2 class="mt-2 text-2xl font-semibold">Alimentar la API interna de tu empresa</h2>
            <p class="mt-2 text-zinc-400">
              Trae tareas de ejemplo desde JSONPlaceholder y publicalas en tu API interna demo para que luego tus empleados las importen.
            </p>
          </div>

          <button
            type="button"
            class="rounded-2xl bg-cyan-500 px-6 py-4 font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            :disabled="store.loading"
            @click="importExternalApiTasks"
          >
            {{ store.loading ? 'Importando...' : 'Cargar en API interna' }}
          </button>
        </div>

        <p v-if="feedback" class="mt-4 text-sm text-zinc-300">
          {{ feedback }}
        </p>

        <p v-if="store.error" class="mt-3 text-sm text-rose-300">
          {{ store.error }}
        </p>
      </section>

      <section v-if="canImportCompanyApi" class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">API interna</p>
            <h2 class="mt-2 text-2xl font-semibold">Importar tareas publicadas por tu admin</h2>
            <p class="mt-2 text-zinc-400">
              Tu administrador mantiene esta API demo. Desde aqui importas las tareas nuevas a tu lista personal de trabajo.
            </p>
          </div>

          <button
            type="button"
            class="rounded-2xl bg-cyan-500 px-6 py-4 font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            :disabled="!store.companyApiTasks.length"
            @click="importCompanyTasks"
          >
            Importar a mi lista
          </button>
        </div>

        <p v-if="feedback" class="mt-4 text-sm text-zinc-300">
          {{ feedback }}
        </p>

        <p v-if="store.error" class="mt-3 text-sm text-rose-300">
          {{ store.error }}
        </p>

        <div v-if="store.companyApiTasks.length" class="mt-6 space-y-4">
          <TaskItem
            v-for="task in store.companyApiTasks"
            :key="task.id"
            :task="task"
            :can-manage="false"
            :can-export="false"
          />
        </div>

        <div
          v-else
          class="mt-6 rounded-3xl border border-dashed border-zinc-800 px-6 py-10 text-center"
        >
          <p class="text-xl font-semibold">Tu API interna todavia esta vacia</p>
          <p class="mt-3 text-zinc-400">
            Cuando el administrador publique tareas, podras importarlas a tu lista desde aqui.
          </p>
        </div>
      </section>

      <section v-if="!isCompanyAccount" class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Cuenta personal</p>
        <h2 class="mt-2 text-2xl font-semibold">Modo simple para presentacion</h2>
        <p class="mt-2 text-zinc-400">
          Esta cuenta se enfoca en registrar tareas individuales. El flujo de API interna queda reservado para las cuentas de empresa.
        </p>
      </section>

      <section>
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">{{ currentListEyebrow }}</p>
            <h2 class="mt-2 text-2xl font-semibold">{{ currentListTitle }}</h2>
            <p class="mt-2 max-w-2xl text-zinc-400">
              {{ currentListDescription }}
            </p>
          </div>
        </div>

        <div
          v-if="!displayTasks.length"
          class="mt-6 rounded-3xl border border-dashed border-zinc-800 px-6 py-16 text-center"
        >
          <p class="text-2xl font-semibold">{{ emptyStateTitle }}</p>
          <p class="mt-3 text-zinc-400">
            {{ emptyStateMessage }}
          </p>
        </div>

        <div v-else class="mt-6 space-y-4">
          <TaskItem
            v-for="task in displayTasks"
            :key="task.id"
            :task="task"
            :can-manage="canManageCurrentList"
            :can-export="canExportCurrentList"
            @toggle="store.toggleTask"
            @delete="store.deleteTask(task.id)"
            @edit="openModal(task)"
            @calendar="sendToCalendar(task)"
          />
        </div>
      </section>
    </div>

    <div v-if="editingTask" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div class="w-full max-w-xl rounded-3xl bg-zinc-900 p-8">
        <h2 class="text-2xl font-semibold">Editar tarea</h2>

        <div class="mt-6 space-y-4">
          <div>
            <label class="mb-2 block text-sm text-zinc-400">Titulo</label>
            <input
              v-model="editForm.title"
              class="w-full rounded-2xl bg-zinc-800 px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm text-zinc-400">Fecha y hora</label>
            <input
              v-model="editForm.dueAt"
              type="datetime-local"
              class="w-full rounded-2xl bg-zinc-800 px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
          </div>

          <p v-if="feedback" class="text-sm text-amber-300">
            {{ feedback }}
          </p>
        </div>

        <div class="mt-8 flex gap-4">
          <button
            type="button"
            class="flex-1 rounded-2xl bg-cyan-500 py-4 font-semibold text-zinc-950 transition hover:bg-cyan-400"
            @click="saveEdit"
          >
            Guardar
          </button>
          <button
            type="button"
            class="flex-1 rounded-2xl bg-zinc-700 py-4 font-semibold transition hover:bg-zinc-600"
            @click="closeModal"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Navbar from '../components/Navbar.vue'
import TaskForm from '../components/TaskForm.vue'
import TaskItem from '../components/TaskItem.vue'
import { useAuthStore } from '../stores/authStore'
import { useTaskStore } from '../stores/taskStore'
import { downloadCalendarEvent } from '../utils/calendar'

const authStore = useAuthStore()
const store = useTaskStore()
const editingTask = ref(null)
const feedback = ref('')
const editForm = reactive({
  title: '',
  dueAt: ''
})

const isCompanyAccount = computed(() => authStore.isCompanyAccount)
const isCompanyAdmin = computed(() => authStore.isCompanyAdmin)
const isCompanyEmployee = computed(() => authStore.isCompanyEmployee)
const showTaskForm = computed(() => !isCompanyEmployee.value)
const canImportExternalApi = computed(() => isCompanyAdmin.value)
const canImportCompanyApi = computed(() => isCompanyEmployee.value)
const canManageCurrentList = computed(() => Boolean(authStore.currentUser))
const canExportCurrentList = computed(() => isCompanyEmployee.value)
const companyMembers = computed(() => authStore.currentCompanyMembers)
const currentCompany = computed(() => authStore.currentCompany)
const memberCount = computed(() => companyMembers.value.length)
const displayTasks = computed(() => (isCompanyAdmin.value ? store.companyApiTasks : store.tasks))

const openModal = (task) => {
  if (!canManageCurrentList.value) return

  editingTask.value = task
  editForm.title = task.title
  editForm.dueAt = task.dueAt ?? ''
}

const saveEdit = () => {
  if (!editingTask.value) return

  const result = store.updateTask(editingTask.value.id, {
    title: editForm.title,
    dueAt: editForm.dueAt
  })

  if (!result.ok) {
    feedback.value = result.message
    return
  }

  closeModal()
}

const closeModal = () => {
  editingTask.value = null
  feedback.value = ''
}

const importExternalApiTasks = async () => {
  const result = await store.importTasksFromApi()
  feedback.value = result.message ?? ''
}

const importCompanyTasks = () => {
  const result = store.importTasksFromCompanyApi()
  feedback.value = result.message ?? ''
}

const sendToCalendar = (task) => {
  const created = downloadCalendarEvent(task)
  feedback.value = created
    ? `Se descargo el evento de calendario para "${task.title}".`
    : 'Agrega una fecha a la tarea antes de enviarla al calendario.'
}

watch(
  () => authStore.currentUser?.id,
  () => {
    store.hydrateForCurrentUser()
    closeModal()
  },
  { immediate: true }
)

const totalTasks = computed(() => displayTasks.value.length)
const completedTasks = computed(() => displayTasks.value.filter((task) => task.completed).length)
const pendingTasks = computed(() => totalTasks.value - completedTasks.value)
const statsGridClass = computed(() => (isCompanyAccount.value ? 'sm:grid-cols-4' : 'sm:grid-cols-3'))
const companyExtraStatLabel = computed(() =>
  isCompanyAdmin.value ? 'Miembros' : 'API disponible'
)
const companyExtraStatValue = computed(() =>
  isCompanyAdmin.value ? memberCount.value : store.companyApiTasks.length
)
const panelEyebrow = computed(() => {
  if (!isCompanyAccount.value) return 'Panel personal'
  return isCompanyAdmin.value ? 'Panel empresa - admin' : 'Panel empresa - empleado'
})
const panelTitle = computed(() => {
  if (!isCompanyAccount.value) return 'Mis tareas'
  return isCompanyAdmin.value ? 'API interna de empresa' : 'Mi lista de tareas'
})
const roleLabel = computed(() => {
  if (!isCompanyAccount.value) return 'Usuario personal'
  return isCompanyAdmin.value ? 'Administrador' : 'Empleado'
})
const roleDescription = computed(() => {
  if (isCompanyAdmin.value) {
    return 'Publicas y mantienes la API interna de tu empresa para que luego el equipo la importe.'
  }

  return 'Importas las tareas publicadas por tu admin a tu lista diaria y despues puedes exportarlas al calendario.'
})
const welcomeMessage = computed(() => {
  const name = authStore.currentUser?.name ?? 'usuario'

  if (!isCompanyAccount.value) {
    return `Hola ${name}. Esta cuenta personal guarda tus tareas solo para ti y mantiene el flujo simple para la presentacion.`
  }

  if (isCompanyAdmin.value) {
    return `Hola ${name}. Desde aqui publicas tareas en la API interna de ${authStore.currentUser.companyName} para que los empleados las importen a sus listas.`
  }

  return `Hola ${name}. Aqui ves tu lista personal importada desde la API interna de ${authStore.currentUser.companyName}.`
})
const currentListEyebrow = computed(() => {
  if (!isCompanyAccount.value) return 'Lista personal'
  return isCompanyAdmin.value ? 'API interna publicada' : 'Lista importada'
})
const currentListTitle = computed(() => {
  if (!isCompanyAccount.value) return 'Tus tareas'
  return isCompanyAdmin.value ? 'Tareas disponibles en la API interna' : 'Tus tareas importadas'
})
const currentListDescription = computed(() => {
  if (!isCompanyAccount.value) {
    return 'Tu lista local de tareas funciona de forma individual, sin flujo empresarial.'
  }

  if (isCompanyAdmin.value) {
    return 'Todo lo que aparece aqui forma parte de la API interna demo que despues importan los empleados.'
  }

  return 'Esta es tu lista propia. Puedes marcar tareas, ajustarlas y exportarlas despues de importarlas desde la API interna.'
})
const emptyStateTitle = computed(() => {
  if (!isCompanyAccount.value) return 'Todavia no tienes tareas'
  return isCompanyAdmin.value
    ? 'La API interna aun no tiene tareas publicadas'
    : 'Todavia no importas tareas a tu lista'
})
const emptyStateMessage = computed(() => {
  if (!isCompanyAccount.value) {
    return 'Agrega tu primera tarea manualmente para completar la demo personal.'
  }

  if (isCompanyAdmin.value) {
    return 'Publica tareas manualmente o cargalas desde la API externa para poblar la API interna de la empresa.'
  }

  return 'Usa el boton de importacion para traer a tu lista las tareas que publique tu administrador en la API interna.'
})
</script>
