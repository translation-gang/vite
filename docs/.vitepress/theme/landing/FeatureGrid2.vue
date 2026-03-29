<script setup>
import RiveAnimation from '@components/shared/RiveAnimation.vue'
import flexiblePluginAnimation from '@assets/vite/animations/640_x_300_flexible_plugin.riv'
</script>

<template>
  <section
    class="wrapper wrapper--ticks border-t grid lg:grid-cols-2 divide-x divide-y divide-nickel"
  >
    <div class="p-5 sm:p-10 flex flex-col gap-3">
      <h5 class="text-balance sm:text-pretty text-white">
        Гибкая система плагинов
      </h5>
      <p class="sm:max-w-[28rem] text-pretty">
        Плагины Vite расширяют продуманный интерфейс Rollup несколькими
        дополнительными опциями, специфичными для Vite.
      </p>
      <RiveAnimation
        :desktop-src="flexiblePluginAnimation"
        :desktop-width="640"
        :desktop-height="300"
        canvas-class="w-[calc(100%_+_2.5rem)] mt-5 -mx-5"
      />
    </div>

    <div class="flex flex-col gap-3 border-r-0 justify-between">
      <div class="p-5 sm:p-10 flex flex-col gap-3">
        <h5 class="text-white">Полностью типизированное API</h5>
        <p class="max-w-[26rem] text-pretty">Создано, чтобы на нём строить.</p>
      </div>
      <div class="relative p-5 sm:p-10 flex justify-center bg-[#370a7f]">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="@assets/vite/vite-featurepanel-4-background.jpg"
          alt=""
          inert
          loading="lazy"
        />
        <img
          class="z-1"
          src="@assets/vite/vite-typed-api.svg"
          width="454"
          height="252"
          inert
          loading="lazy"
          alt="типизированное API"
        />
      </div>
    </div>

    <div class="p-5 sm:p-10 flex flex-col gap-3 lg:border-b-0">
      <h5 class="text-white">Полноценная поддержка SSR</h5>
      <p class="sm:max-w-[28rem] text-pretty mb-12 sm:mb-16">
        Настроить свой SSR (Server-Side Rendering) или собрать свой SSR-фреймворк
        ещё никогда не было так просто.
      </p>
      <img
        src="@assets/vite/vite-ssr-support.png"
        width="1008"
        height="466"
        alt="поддержка SSR"
        loading="lazy"
        class="w-full px-5"
      />
    </div>

    <div class="flex flex-col gap-3 justify-between">
      <div class="p-5 sm:p-10 flex flex-col gap-3">
        <h5 class="text-white">Непрерывная интеграция с экосистемой</h5>
        <p class="max-w-[25rem] text-pretty">
          Наш CI постоянно прогоняет изменения Vite на даунстрим-проектах — так мы
          улучшаем Vite стабильно и уверенно.
        </p>
      </div>
      <div class="px-5 sm:px-10 flex justify-center">
        <img
          src="@assets/vite/vite-ci.svg"
          width="476"
          height="272"
          inert
          loading="lazy"
          alt="непрерывная интеграция с экосистемой"
        />
      </div>
    </div>
  </section>
</template>
