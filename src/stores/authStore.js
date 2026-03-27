import { defineStore } from 'pinia'
import { SESSION_STORAGE_KEY, USERS_STORAGE_KEY } from '../constants/storageKeys'

const readUsers = () => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) ?? '[]')
  } catch (error) {
    console.error('No se pudo leer la lista de usuarios', error)
    return []
  }
}

const writeUsers = (users) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const readSession = () => {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null')
  } catch (error) {
    console.error('No se pudo leer la sesion activa', error)
    return null
  }
}

const writeSession = (user) => {
  if (typeof window === 'undefined') return

  if (!user) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
}

const normalizeEmail = (email) => email.trim().toLowerCase()

const createPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email
})

const buildUserId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `user-${Date.now()}`
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: [],
    currentUser: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser)
  },
  actions: {
    hydrate() {
      this.users = readUsers()
      this.currentUser = readSession()
    },
    register({ name, email, password }) {
      this.hydrate()

      const safeName = name.trim()
      const safeEmail = normalizeEmail(email)
      const safePassword = password.trim()

      if (!safeName || !safeEmail || !safePassword) {
        return { ok: false, message: 'Completa nombre, correo y contrasena.' }
      }

      if (this.users.some((user) => user.email === safeEmail)) {
        return { ok: false, message: 'Ese correo ya esta registrado.' }
      }

      const newUser = {
        id: buildUserId(),
        name: safeName,
        email: safeEmail,
        password: safePassword
      }

      this.users = [...this.users, newUser]
      this.currentUser = createPublicUser(newUser)
      writeUsers(this.users)
      writeSession(this.currentUser)

      return { ok: true }
    },
    login({ email, password }) {
      this.hydrate()

      const safeEmail = normalizeEmail(email)
      const safePassword = password.trim()
      const foundUser = this.users.find(
        (user) => user.email === safeEmail && user.password === safePassword
      )

      if (!foundUser) {
        return { ok: false, message: 'Correo o contrasena incorrectos.' }
      }

      this.currentUser = createPublicUser(foundUser)
      writeSession(this.currentUser)

      return { ok: true }
    },
    logout() {
      this.currentUser = null
      writeSession(null)
    }
  }
})
