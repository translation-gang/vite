<script setup>
import Hero from './Hero.vue'
import Timer from './Timer.vue'
import TimeoutSwitcher from './TimeoutSwitcher.vue'
import VideoIframe from './VideoIframe.vue'
import Events from './Events.vue'
import Footer from '@components/oss/Footer.vue'
const startTime = '2026-03-19T15:00:00.000Z'
</script>

<template>
  <TimeoutSwitcher :at="startTime">
    <template #default>
      <Hero />
      <Timer :at="startTime" />
    </template>
    <template #timeout>
      <VideoIframe :at="startTime" />
    </template>
  </TimeoutSwitcher>
  <TimeoutSwitcher :at="startTime">
    <template #default>
      <Events />
    </template>
  </TimeoutSwitcher>
  <Footer
    heading="Начните собирать проекты с Vite"
    subheading="Подготовьтесь к среде разработки, которая наконец поспевает за скоростью ваших идей."
    button-text="Начать"
    button-link="/guide/"
  />
</template>
