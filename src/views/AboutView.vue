<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <Navbar />
    <div class="mx-auto max-w-6xl px-6 py-16">
      <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Checklist del proyecto</p>
      <h1 class="mt-4 text-5xl font-bold">Requisitos cubiertos</h1>
      <p class="mt-4 max-w-3xl text-xl leading-relaxed text-zinc-400">
        V-List ya funciona como una aplicacion sencilla de gestion de tareas y demuestra las
        caracteristicas principales del framework de forma visible para tu entrega.
      </p>

      <div class="mt-10 grid gap-4 lg:grid-cols-2">
        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Aplicacion sencilla</h2>
          <p class="mt-3 text-zinc-400">
            Es un gestor de tareas con alta, edicion, marcado de completadas y eliminacion.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Componentes</h2>
          <p class="mt-3 text-zinc-400">
            Se usan componentes separados como Navbar, TaskForm y TaskItem.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Routing</h2>
          <p class="mt-3 text-zinc-400">
            La app tiene rutas para inicio, autenticacion, tareas y requisitos, con proteccion en la vista privada.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Estado global</h2>
          <p class="mt-3 text-zinc-400">
            Pinia maneja la sesion del usuario y las tareas persistidas para cada cuenta.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Integracion con API</h2>
          <p class="mt-3 text-zinc-400">
            Se pueden importar tareas demo desde JSONPlaceholder para demostrar consumo de datos externos.
          </p>
        </article>

        <article class="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 class="text-2xl font-semibold">Extra util</h2>
          <p class="mt-3 text-zinc-400">
            Las tareas con fecha pueden exportarse al calendario como archivo .ics, compatible con muchos dispositivos.
          </p>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>
