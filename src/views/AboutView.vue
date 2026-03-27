<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <Navbar />
    <div class="mx-auto max-w-6xl px-6 py-16">
      <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Checklist del proyecto</p>
      <h1 class="mt-4 text-5xl font-bold">Requisitos cubiertos</h1>
      <p class="mt-4 max-w-3xl text-xl leading-relaxed text-zinc-400">
        V-List funciona como una demo local de gestion de tareas con flujo personal y empresarial,
        lista para presentar la idea completa antes de conectarla a una base de datos real.
      </p>

      <div class="mt-10 grid gap-4 lg:grid-cols-2">
        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Aplicacion sencilla</h2>
          <p class="mt-3 text-zinc-400">
            Se pueden crear, editar, marcar y eliminar tareas dentro de un flujo demostrativo funcional.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Componentes</h2>
          <p class="mt-3 text-zinc-400">
            Se usan componentes separados como Navbar, TaskForm y TaskItem para mantener el proyecto ordenado.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Routing</h2>
          <p class="mt-3 text-zinc-400">
            La app tiene rutas para inicio, autenticacion, tareas y requisitos, con proteccion en la vista privada.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Estado local</h2>
          <p class="mt-3 text-zinc-400">
            Pinia y localStorage manejan sesion, usuarios, empresas y tareas sin depender de backend.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Cuentas duales</h2>
          <p class="mt-3 text-zinc-400">
            Existen cuentas personales y cuentas de empresa con roles de administrador y empleado.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Demo empresarial</h2>
          <p class="mt-3 text-zinc-400">
            Los admins pueden crear empresas, ver miembros e importar tareas desde API; los empleados pueden exportarlas al calendario.
          </p>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>
