<template>
  <div class="rounded-2xl bg-zinc-800 p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div class="flex flex-1 items-start gap-4">
        <input
          v-if="canManage"
          type="checkbox"
          :checked="task.completed"
          class="mt-1 h-6 w-6 accent-cyan-500"
          @change="toggle"
        >

        <div
          v-else
          class="mt-1 rounded-full border border-cyan-500/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300"
        >
          Solo lectura
        </div>

        <div class="flex-1">
          <p :class="{ 'line-through text-zinc-400': task.completed }" class="text-lg font-medium">
            {{ task.title }}
          </p>

          <p v-if="task.dueAt" class="mt-2 text-sm text-cyan-300">
            Fecha: {{ formatDueDate(task.dueAt) }}
          </p>

          <p class="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            {{ sourceLabel }}
          </p>

          <p v-if="ownerLabel" class="mt-2 text-sm text-zinc-400">
            {{ ownerLabel }}
          </p>
        </div>
      </div>

      <div v-if="showActions" class="flex flex-wrap gap-2">
        <button
          v-if="canExport && task.dueAt"
          type="button"
          class="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
          @click="emit('calendar')"
        >
          Calendario
        </button>

        <button
          v-if="canManage"
          type="button"
          class="rounded-xl bg-zinc-700 px-4 py-2 text-sm transition hover:bg-amber-500 hover:text-zinc-950"
          @click="emit('edit')"
        >
          Editar
        </button>

        <button
          v-if="canManage"
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
import { computed } from 'vue'
import { formatDueDate } from '../utils/calendar'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  canManage: {
    type: Boolean,
    default: true
  },
  canExport: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle', 'delete', 'edit', 'calendar'])

const sourceLabel = computed(() => {
  if (props.task.source === 'api') return 'Tomada de API externa'
  if (props.task.source === 'company-api') return 'Publicada en API interna'
  if (props.task.source === 'company-import') return 'Importada desde API interna'
  return 'Creada manualmente'
})

const ownerLabel = computed(() => {
  if (props.task.source === 'company-import' && props.task.publishedByName) {
    return `Publicada por: ${props.task.publishedByName}`
  }

  if (props.task.createdByName) {
    return `Cargada por: ${props.task.createdByName}`
  }

  return ''
})

const showActions = computed(() => props.canManage || (props.canExport && Boolean(props.task.dueAt)))

const toggle = () => emit('toggle', props.task.id)
</script>
