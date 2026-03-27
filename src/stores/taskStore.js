import { defineStore } from 'pinia'
import { TASKS_STORAGE_KEY } from '../constants/storageKeys'
import { useAuthStore } from './authStore'

const readTaskMap = () => {
  if (typeof window === 'undefined') return {}

  try {
    return JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) ?? '{}')
  } catch (error) {
    console.error('No se pudo leer el almacenamiento de tareas', error)
    return {}
  }
}

const writeTaskMap = (taskMap) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(taskMap))
}

const buildTaskId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `task-${Date.now()}`
}

const sortTasks = (tasks) =>
  [...tasks].sort((left, right) => {
    if (left.completed !== right.completed) {
      return Number(left.completed) - Number(right.completed)
    }

    if (left.dueAt && right.dueAt) {
      return new Date(left.dueAt) - new Date(right.dueAt)
    }

    if (left.dueAt) return -1
    if (right.dueAt) return 1

    return new Date(right.createdAt) - new Date(left.createdAt)
  })

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: ''
  }),
  actions: {
    hydrateForCurrentUser() {
      const authStore = useAuthStore()
      const activeUserId = authStore.currentUser?.id

      if (!activeUserId) {
        this.tasks = []
        return
      }

      const taskMap = readTaskMap()
      this.tasks = sortTasks(taskMap[activeUserId] ?? [])
      this.error = ''
    },
    persistForCurrentUser() {
      const authStore = useAuthStore()
      const activeUserId = authStore.currentUser?.id

      if (!activeUserId) return

      const taskMap = readTaskMap()
      taskMap[activeUserId] = sortTasks(this.tasks)
      writeTaskMap(taskMap)
      this.tasks = sortTasks(this.tasks)
    },
    addTask({ title, dueAt = '' }) {
      const safeTitle = title.trim()

      if (!safeTitle) {
        return { ok: false, message: 'Escribe un titulo para la tarea.' }
      }

      this.tasks = [
        {
          id: buildTaskId(),
          title: safeTitle,
          completed: false,
          dueAt,
          source: 'manual',
          createdAt: new Date().toISOString()
        },
        ...this.tasks
      ]

      this.persistForCurrentUser()

      return { ok: true }
    },
    toggleTask(id) {
      this.tasks = this.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
      this.persistForCurrentUser()
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter((task) => task.id !== id)
      this.persistForCurrentUser()
    },
    updateTask(id, payload) {
      const safeTitle = payload.title.trim()

      if (!safeTitle) {
        return { ok: false, message: 'El titulo no puede quedar vacio.' }
      }

      this.tasks = this.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              title: safeTitle,
              dueAt: payload.dueAt
            }
          : task
      )

      this.persistForCurrentUser()

      return { ok: true }
    },
    async importTasksFromApi() {
      this.loading = true
      this.error = ''

      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
        const data = await response.json()
        const knownTitles = new Set(this.tasks.map((task) => task.title.toLowerCase()))
        const importedTasks = data
          .filter((task) => !knownTitles.has(task.title.toLowerCase()))
          .map((task) => ({
            id: buildTaskId(),
            title: task.title.charAt(0).toUpperCase() + task.title.slice(1),
            completed: task.completed,
            dueAt: '',
            source: 'api',
            createdAt: new Date().toISOString()
          }))

        this.tasks = [...this.tasks, ...importedTasks]
        this.persistForCurrentUser()

        return {
          ok: true,
          count: importedTasks.length,
          message: importedTasks.length
            ? `Se importaron ${importedTasks.length} tareas de ejemplo.`
            : 'No habia tareas nuevas para importar.'
        }
      } catch (error) {
        console.error('Error importing tasks', error)
        this.error = 'No se pudo conectar con la API de ejemplo.'
        return { ok: false, message: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})
