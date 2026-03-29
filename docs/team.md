---
layout: page
title: Команда
description: Развитие Vite ведёт международная команда.
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from '@voidzero-dev/vitepress-theme'
import { core, emeriti } from './_data/team'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Команда</template>
    <template #lead>
      Развитие Vite ведёт международная команда; ниже представлены те, кто
      решил указать себя в этом списке.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="core" />
  <VPTeamPageSection>
    <template #title>Бывшие участники команды</template>
    <template #lead>
      Здесь мы благодарим бывших участников команды, которые внесли ценный
      вклад в прошлом.
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="emeriti" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
