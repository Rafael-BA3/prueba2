<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <Navbar />
    <div class="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Panel personal</p>
          <h1 class="mt-3 text-4xl font-bold">Mis tareas</h1>
          <p class="mt-3 max-w-2xl text-lg text-zinc-400">
            {{ welcomeMessage }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
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
        </div>
      </section>

      <TaskForm />

      <section class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">API externa</p>
            <h2 class="mt-2 text-2xl font-semibold">Importar tareas demo</h2>
            <p class="mt-2 text-zinc-400">
              Trae tareas de ejemplo desde JSONPlaceholder para demostrar integracion con API.
            </p>
          </div>

          <button
            type="button"
            class="rounded-2xl bg-cyan-500 px-6 py-4 font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            :disabled="store.loading"
            @click="importTasks"
          >
            {{ store.loading ? 'Importando...' : 'Importar desde API' }}
          </button>
        </div>

        <p v-if="feedback" class="mt-4 text-sm text-zinc-300">
          {{ feedback }}
        </p>

        <p v-if="store.error" class="mt-3 text-sm text-rose-300">
          {{ store.error }}
        </p>
      </section>

      <div
        v-if="!store.tasks.length"
        class="rounded-3xl border border-dashed border-zinc-800 px-6 py-16 text-center"
      >
        <p class="text-2xl font-semibold">Todavia no tienes tareas</p>
        <p class="mt-3 text-zinc-400">
          Agrega tu primera tarea manualmente o importa ejemplos desde la API.
        </p>
      </div>

      <div v-else class="space-y-4">
        <TaskItem
          v-for="task in store.tasks"
          :key="task.id"
          :task="task"
          @toggle="store.toggleTask"
          @delete="store.deleteTask(task.id)"
          @edit="openModal(task)"
          @calendar="sendToCalendar(task)"
        />
      </div>
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

const openModal = (task) => {
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

const importTasks = async () => {
  const result = await store.importTasksFromApi()
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

const totalTasks = computed(() => store.tasks.length)
const completedTasks = computed(() => store.tasks.filter((task) => task.completed).length)
const pendingTasks = computed(() => totalTasks.value - completedTasks.value)
const welcomeMessage = computed(() => {
  const name = authStore.currentUser?.name ?? 'usuario'

  return `Hola ${name}. Tus tareas se guardan en este navegador y se separan por cuenta para que cada usuario vea solo lo suyo.`
})
</script>
