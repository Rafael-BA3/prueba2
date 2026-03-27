<template>
  <div class="rounded-2xl bg-zinc-800 p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div class="flex flex-1 items-start gap-4">
        <input
          type="checkbox"
          :checked="task.completed"
          class="mt-1 h-6 w-6 accent-cyan-500"
          @change="toggle"
        >

        <div class="flex-1">
          <p :class="{ 'line-through text-zinc-400': task.completed }" class="text-lg font-medium">
            {{ task.title }}
          </p>

          <p v-if="task.dueAt" class="mt-2 text-sm text-cyan-300">
            Fecha: {{ formatDueDate(task.dueAt) }}
          </p>

          <p class="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            {{ task.source === 'api' ? 'Importada desde API' : 'Creada por el usuario' }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-if="task.dueAt"
          type="button"
          class="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
          @click="emit('calendar')"
        >
          Calendario
        </button>

        <button
          type="button"
          class="rounded-xl bg-zinc-700 px-4 py-2 text-sm transition hover:bg-amber-500 hover:text-zinc-950"
          @click="emit('edit')"
        >
          Editar
        </button>

        <button
          type="button"
          class="rounded-xl bg-zinc-700 px-4 py-2 text-sm transition hover:bg-red-500"
          @click="emit('delete')"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'
import { formatDueDate } from '../utils/calendar'

const props = defineProps({ task: Object })
const emit = defineEmits(['toggle', 'delete', 'edit', 'calendar'])

const toggle = () => emit('toggle', props.task.id)
</script>
