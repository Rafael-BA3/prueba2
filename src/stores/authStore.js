import { defineStore } from 'pinia'
import {
  COMPANIES_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  USERS_STORAGE_KEY
} from '../constants/storageKeys'

const normalizeEmail = (email) => email.trim().toLowerCase()
const normalizeCode = (value) => value.trim().toUpperCase()

const buildId = (prefix) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}`
}

const buildAccessCode = (companyName) => {
  const base = companyName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 6)
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `${base || 'EMP'}-${random}`
}

const readCompanies = () => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(localStorage.getItem(COMPANIES_STORAGE_KEY) ?? '[]')
  } catch (error) {
    console.error('No se pudo leer la lista de empresas', error)
    return []
  }
}

const writeCompanies = (companies) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies))
}

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

const normalizeCompany = (company) => ({
  id: company.id,
  name: company.name?.trim() || 'Empresa demo',
  industry: company.industry?.trim() || 'Operaciones',
  accessCode: normalizeCode(company.accessCode || buildAccessCode(company.name || 'EMP')),
  createdBy: company.createdBy ?? null,
  createdAt: company.createdAt ?? new Date().toISOString()
})

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name?.trim() || 'Usuario',
  email: normalizeEmail(user.email || ''),
  password: user.password ?? '',
  accountType: user.accountType === 'company' ? 'company' : 'personal',
  role:
    user.accountType === 'company'
      ? user.role === 'employee'
        ? 'employee'
        : 'admin'
      : 'user',
  companyId: user.accountType === 'company' ? user.companyId ?? null : null,
  createdAt: user.createdAt ?? new Date().toISOString()
})

const createPublicUser = (user, companies) => {
  const company = companies.find((entry) => entry.id === user.companyId)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accountType: user.accountType,
    role: user.role,
    companyId: user.companyId,
    companyName: company?.name ?? '',
    companyAccessCode: company?.accessCode ?? '',
    companyIndustry: company?.industry ?? ''
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: [],
    companies: [],
    currentUser: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),
    isCompanyAccount: (state) => state.currentUser?.accountType === 'company',
    isCompanyAdmin: (state) =>
      state.currentUser?.accountType === 'company' && state.currentUser?.role === 'admin',
    isCompanyEmployee: (state) =>
      state.currentUser?.accountType === 'company' && state.currentUser?.role === 'employee',
    currentCompany: (state) =>
      state.companies.find((company) => company.id === state.currentUser?.companyId) ?? null,
    currentCompanyMembers: (state) =>
      state.users
        .filter((user) => user.companyId && user.companyId === state.currentUser?.companyId)
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }))
  },
  actions: {
    hydrate() {
      this.companies = readCompanies().map(normalizeCompany)
      this.users = readUsers().map(normalizeUser)

      const session = readSession()
      const activeUser = this.users.find((user) => user.id === session?.id)
      this.currentUser = activeUser ? createPublicUser(activeUser, this.companies) : null

      writeCompanies(this.companies)
      writeUsers(this.users)
      writeSession(this.currentUser)
    },
    register({
      name,
      email,
      password,
      accountType,
      role,
      companyName,
      companyIndustry,
      companyAccessCode
    }) {
      this.hydrate()

      const safeName = name.trim()
      const safeEmail = normalizeEmail(email)
      const safePassword = password.trim()
      const safeAccountType = accountType === 'company' ? 'company' : 'personal'
      const safeRole =
        safeAccountType === 'company'
          ? role === 'employee'
            ? 'employee'
            : 'admin'
          : 'user'

      if (!safeName || !safeEmail || !safePassword) {
        return { ok: false, message: 'Completa nombre, correo y contrasena.' }
      }

      if (this.users.some((user) => user.email === safeEmail)) {
        return { ok: false, message: 'Ese correo ya esta registrado.' }
      }

      let nextCompanies = [...this.companies]
      let selectedCompanyId = null

      if (safeAccountType === 'company' && safeRole === 'admin') {
        const safeCompanyName = companyName?.trim() ?? ''
        const safeIndustry = companyIndustry?.trim() ?? ''

        if (!safeCompanyName) {
          return { ok: false, message: 'Escribe el nombre de la empresa.' }
        }

        if (
          this.companies.some(
            (company) => company.name.toLowerCase() === safeCompanyName.toLowerCase()
          )
        ) {
          return { ok: false, message: 'Ya existe una empresa demo con ese nombre.' }
        }

        const newCompany = normalizeCompany({
          id: buildId('company'),
          name: safeCompanyName,
          industry: safeIndustry,
          accessCode: buildAccessCode(safeCompanyName),
          createdBy: null,
          createdAt: new Date().toISOString()
        })

        nextCompanies = [...this.companies, newCompany]
        selectedCompanyId = newCompany.id
      }

      if (safeAccountType === 'company' && safeRole === 'employee') {
        const safeCode = normalizeCode(companyAccessCode ?? '')
        const selectedCompany = nextCompanies.find((company) => company.accessCode === safeCode)

        if (!safeCode || !selectedCompany) {
          return { ok: false, message: 'Ingresa un codigo de empresa valido.' }
        }

        selectedCompanyId = selectedCompany.id
      }

      const newUser = {
        id: buildId('user'),
        name: safeName,
        email: safeEmail,
        password: safePassword,
        accountType: safeAccountType,
        role: safeRole,
        companyId: selectedCompanyId,
        createdAt: new Date().toISOString()
      }

      if (safeAccountType === 'company' && safeRole === 'admin') {
        nextCompanies = nextCompanies.map((company) =>
          company.id === selectedCompanyId ? { ...company, createdBy: newUser.id } : company
        )
      }

      this.companies = nextCompanies
      this.users = [...this.users, newUser]
      this.currentUser = createPublicUser(newUser, this.companies)
      writeCompanies(this.companies)
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

      this.currentUser = createPublicUser(foundUser, this.companies)
      writeSession(this.currentUser)

      return { ok: true }
    },
    logout() {
      this.currentUser = null
      writeSession(null)
    }
  }
})
