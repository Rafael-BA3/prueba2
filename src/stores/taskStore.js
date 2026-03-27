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

const isCompanyAdmin = (user) =>
  Boolean(user) && user.accountType === 'company' && user.role === 'admin'

const isCompanyEmployee = (user) =>
  Boolean(user) && user.accountType === 'company' && user.role === 'employee'

const usesPersonalList = (user) =>
  Boolean(user) && (user.accountType === 'personal' || user.role === 'employee')

const getPersonalScopeKey = (user) => {
  if (!user?.id) return ''
  return `user:${user.id}`
}

const getCompanyApiScopeKey = (user) => {
  if (!user?.companyId) return ''
  return `company-api:${user.companyId}`
}

const readTasksForScope = (taskMap, primaryKey, fallbackKeys = []) => {
  const keys = [primaryKey, ...fallbackKeys].filter(Boolean)

  for (const key of keys) {
    if (taskMap[key]) {
      return taskMap[key]
    }
  }

  return []
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

const createTaskRecord = ({ title, dueAt = '', source = 'manual', user, extra = {} }) => ({
  id: buildTaskId(),
  title,
  completed: false,
  dueAt,
  source,
  createdById: user?.id ?? null,
  createdByName: user?.name ?? '',
  createdAt: new Date().toISOString(),
  ...extra
})

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    companyApiTasks: [],
    loading: false,
    error: ''
  }),
  actions: {
    hydrateForCurrentUser() {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser

      if (!activeUser?.id) {
        this.tasks = []
        this.companyApiTasks = []
        this.error = ''
        return
      }

      const taskMap = readTaskMap()
      const companyFallbackKeys = activeUser.companyId ? [`company:${activeUser.companyId}`] : []

      this.tasks = usesPersonalList(activeUser)
        ? sortTasks(readTasksForScope(taskMap, getPersonalScopeKey(activeUser), [activeUser.id]))
        : []

      this.companyApiTasks =
        activeUser.accountType === 'company'
          ? sortTasks(
              readTasksForScope(taskMap, getCompanyApiScopeKey(activeUser), companyFallbackKeys)
            )
          : []

      this.error = ''
    },
    persistPersonalTasks() {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser
      const scopeKey = getPersonalScopeKey(activeUser)

      if (!scopeKey || !activeUser?.id) return

      const taskMap = readTaskMap()
      taskMap[scopeKey] = sortTasks(this.tasks)

      if (taskMap[activeUser.id] && activeUser.id !== scopeKey) {
        delete taskMap[activeUser.id]
      }

      writeTaskMap(taskMap)
      this.tasks = sortTasks(this.tasks)
    },
    persistCompanyApiTasks() {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser
      const scopeKey = getCompanyApiScopeKey(activeUser)

      if (!scopeKey || !activeUser?.companyId) return

      const taskMap = readTaskMap()
      taskMap[scopeKey] = sortTasks(this.companyApiTasks)

      const legacyKey = `company:${activeUser.companyId}`
      if (taskMap[legacyKey] && legacyKey !== scopeKey) {
        delete taskMap[legacyKey]
      }

      writeTaskMap(taskMap)
      this.companyApiTasks = sortTasks(this.companyApiTasks)
    },
    addTask({ title, dueAt = '' }) {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser
      const safeTitle = title.trim()

      if (!safeTitle) {
        return { ok: false, message: 'Escribe un titulo para la tarea.' }
      }

      this.error = ''

      if (activeUser?.accountType === 'personal') {
        this.tasks = [
          createTaskRecord({
            title: safeTitle,
            dueAt,
            source: 'manual',
            user: activeUser
          }),
          ...this.tasks
        ]

        this.persistPersonalTasks()
        return { ok: true }
      }

      if (isCompanyAdmin(activeUser)) {
        this.companyApiTasks = [
          createTaskRecord({
            title: safeTitle,
            dueAt,
            source: 'company-api',
            user: activeUser
          }),
          ...this.companyApiTasks
        ]

        this.persistCompanyApiTasks()
        return { ok: true, message: 'Tarea publicada en la API interna.' }
      }

      return { ok: false, message: 'Tu rol actual solo puede importar tareas desde la API interna.' }
    },
    toggleTask(id) {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser

      this.error = ''

      if (isCompanyAdmin(activeUser)) {
        this.companyApiTasks = this.companyApiTasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
        this.persistCompanyApiTasks()
        return
      }

      if (usesPersonalList(activeUser)) {
        this.tasks = this.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
        this.persistPersonalTasks()
        return
      }

      this.error = 'No puedes modificar esta lista de tareas.'
    },
    deleteTask(id) {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser

      this.error = ''

      if (isCompanyAdmin(activeUser)) {
        this.companyApiTasks = this.companyApiTasks.filter((task) => task.id !== id)
        this.persistCompanyApiTasks()
        return
      }

      if (usesPersonalList(activeUser)) {
        this.tasks = this.tasks.filter((task) => task.id !== id)
        this.persistPersonalTasks()
        return
      }

      this.error = 'No puedes eliminar elementos de esta lista.'
    },
    updateTask(id, payload) {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser
      const safeTitle = payload.title.trim()

      if (!safeTitle) {
        return { ok: false, message: 'El titulo no puede quedar vacio.' }
      }

      this.error = ''

      if (isCompanyAdmin(activeUser)) {
        this.companyApiTasks = this.companyApiTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                title: safeTitle,
                dueAt: payload.dueAt,
                updatedAt: new Date().toISOString()
              }
            : task
        )

        this.persistCompanyApiTasks()
        return { ok: true }
      }

      if (usesPersonalList(activeUser)) {
        this.tasks = this.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                title: safeTitle,
                dueAt: payload.dueAt,
                updatedAt: new Date().toISOString()
              }
            : task
        )

        this.persistPersonalTasks()
        return { ok: true }
      }

      return { ok: false, message: 'No puedes editar esta lista.' }
    },
    async importTasksFromApi() {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser

      if (!isCompanyAdmin(activeUser)) {
        this.error = 'Solo el administrador puede alimentar la API interna desde una API externa.'
        return { ok: false, message: this.error }
      }

      this.loading = true
      this.error = ''

      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
        const data = await response.json()
        const knownTitles = new Set(this.companyApiTasks.map((task) => task.title.toLowerCase()))
        const importedTasks = data
          .filter((task) => !knownTitles.has(task.title.toLowerCase()))
          .map((task) =>
            createTaskRecord({
              title: task.title.charAt(0).toUpperCase() + task.title.slice(1),
              dueAt: '',
              source: 'api',
              user: activeUser
            })
          )

        this.companyApiTasks = [...this.companyApiTasks, ...importedTasks]
        this.persistCompanyApiTasks()

        return {
          ok: true,
          count: importedTasks.length,
          message: importedTasks.length
            ? `Se publicaron ${importedTasks.length} tareas nuevas en la API interna.`
            : 'No habia tareas nuevas para publicar en la API interna.'
        }
      } catch (error) {
        console.error('Error importing tasks', error)
        this.error = 'No se pudo conectar con la API externa de ejemplo.'
        return { ok: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    importTasksFromCompanyApi() {
      const authStore = useAuthStore()
      const activeUser = authStore.currentUser

      if (!isCompanyEmployee(activeUser)) {
        this.error = 'Solo los empleados pueden importar tareas desde la API interna.'
        return { ok: false, message: this.error }
      }

      if (!this.companyApiTasks.length) {
        this.error = 'La API interna todavia no tiene tareas publicadas.'
        return { ok: false, message: this.error }
      }

      this.error = ''

      const knownCompanyTaskIds = new Set(
        this.tasks.map((task) => task.companyTaskId).filter(Boolean)
      )
      const importedTasks = this.companyApiTasks
        .filter((task) => !knownCompanyTaskIds.has(task.id))
        .map((task) =>
          createTaskRecord({
            title: task.title,
            dueAt: task.dueAt,
            source: 'company-import',
            user: activeUser,
            extra: {
              companyTaskId: task.id,
              publishedById: task.createdById ?? null,
              publishedByName: task.createdByName ?? '',
              publishedAt: task.createdAt ?? new Date().toISOString()
            }
          })
        )

      this.tasks = [...this.tasks, ...importedTasks]
      this.persistPersonalTasks()

      return {
        ok: true,
        count: importedTasks.length,
        message: importedTasks.length
          ? `Se importaron ${importedTasks.length} tareas desde la API interna a tu lista.`
          : 'Tu lista ya tenia todas las tareas publicadas en la API interna.'
      }
    }
  }
})
