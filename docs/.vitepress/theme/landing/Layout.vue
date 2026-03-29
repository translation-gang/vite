<script setup>
// these components live in @voidzero-dev/vitepress-theme
import Hero from './Hero.vue'
import ViteFeatureGrid1 from './FeatureGrid1.vue'
import ViteFeatureGrid2 from './FeatureGrid2.vue'
import ViteFrameworks from './Frameworks.vue'
import ViteCommunity from './Community.vue'
import TrustedBy from '@components/oss/TrustedBy.vue'
import HeadingSection from '@components/oss/HeadingSection.vue'
import Sponsors from '@components/oss/Sponsors.vue'
import Spacer from '@components/shared/Spacer.vue'
import Footer from '@components/oss/Footer.vue'
import { useSponsor } from '../composables/sponsor'

const { data: sponsors } = useSponsor()
</script>

<template>
  <Hero />
  <TrustedBy
    :logos="['openai', 'shopify', 'stripe', 'linear', 'clickup', 'wiz']"
  />
  <HeadingSection
    heading="Переосмысливаем опыт разработки"
    subheading="Vite снова делает веб-разработку приятной"
  />
  <ViteFeatureGrid1 />
  <HeadingSection heading="Общая основа для ваших проектов" />
  <ViteFeatureGrid2 />
  <HeadingSection heading="Питает ваши любимые фреймворки и инструменты" />
  <ViteFrameworks />
  <ViteCommunity />
  <Sponsors :sponsors="sponsors" />
  <Spacer />
  <Footer
    heading="Начните собирать проекты с Vite"
    subheading="Подготовьтесь к среде разработки, которая наконец поспевает за скоростью ваших идей."
    button-text="Начать"
    button-link="/guide/"
  />
</template>
