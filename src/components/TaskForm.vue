<template>
  <div class="rounded-3xl bg-zinc-900 p-6">
    <div class="grid gap-3 lg:grid-cols-[2fr,1fr,auto]">
      <input
        v-model="title"
        @keyup.enter="add"
        placeholder="Que vas a hacer hoy?"
        class="rounded-2xl bg-zinc-800 px-6 py-4 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
      <input
        v-model="dueAt"
        type="datetime-local"
        class="rounded-2xl bg-zinc-800 px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
      <button
        type="button"
        class="rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-zinc-950 transition hover:bg-cyan-400"
        @click="add"
      >
        Agregar
      </button>
    </div>

    <p class="mt-3 text-sm text-zinc-400">
      Si agregas fecha, luego podras exportar la tarea al calendario.
    </p>

    <p v-if="feedback" class="mt-3 text-sm text-amber-300">
      {{ feedback }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '../stores/taskStore'

const store = useTaskStore()
const title = ref('')
const dueAt = ref('')
const feedback = ref('')

const add = () => {
  const result = store.addTask({
    title: title.value,
    dueAt: dueAt.value
  })

  feedback.value = result.message ?? ''

  if (!result.ok) return

  title.value = ''
  dueAt.value = ''
  feedback.value = ''
}
</script>
