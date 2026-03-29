---
title: Вышел Vite 8.0!
author:
  name: Команда Vite
date: 2026-03-12
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Анонс Vite 8
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite8.webp
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite8
  - - meta
    - property: og:description
      content: Анонс релиза Vite 8
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Вышел Vite 8.0!

_12 марта 2026_

![Обложка анонса Vite 8](/og-image-announcing-vite8.webp)

Рады объявить о стабильном релизе Vite 8! В начале мы сделали прагматичную ставку на два бандлера: esbuild для скорости в dev и Rollup для оптимизированной production-сборки. Она долго служила хорошо. Огромная благодарность мейнтейнерам Rollup и esbuild — без них Vite не состоялся бы. Сегодня это сходится к одному: Vite 8 поставляется с единым бандлером на Rust — [Rolldown](https://rolldown.rs/) — до **в 10–30 раз быстрее** сборки при полной совместимости плагинов. Это самое крупное архитектурное изменение с Vite 2.

Vite качают 65 млн раз в неделю, экосистема растёт с каждым релизом. Чтобы проще ориентироваться в плагинах, запустили [registry.vite.dev](https://registry.vite.dev) — поисковый каталог плагинов для Vite, Rolldown и Rollup с ежедневным обновлением данных с npm.

Быстрые ссылки:

- [Документация](/)
- Переводы: [简体中文](https://cn.vite.dev/), [日本語](https://ja.vite.dev/), [Español](https://es.vite.dev/), [Português](https://pt.vite.dev/), [한국어](https://ko.vite.dev/), [Deutsch](https://de.vite.dev/), [فارسی](https://fa.vite.dev/)
- [Руководство по миграции](/guide/migration)
- [Changelog на GitHub](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)

Онлайн — [vite.new](https://vite.new); локально — `pnpm create vite`. Подробнее — [Начало работы](/guide/).

Присоединяйтесь к улучшению Vite (уже более [1,2K контрибьюторов ядра](https://github.com/vitejs/vite/graphs/contributors)), зависимостей, плагинов и проектов: [Руководство по участию](https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md). Старт: [issues](https://github.com/vitejs/vite/issues), [PR](https://github.com/vitejs/vite/pulls), тестовые PR, [Discussions](https://github.com/vitejs/vite/discussions) или [форум помощи](https://discord.com/channels/804011606160703521/1019670660856942652) Vite Land. Вопросы — [Discord](https://chat.vite.dev), [#contributing](https://discord.com/channels/804011606160703521/804439875226173480).

Новости — [Bluesky](https://bsky.app/profile/vite.dev), [X](https://twitter.com/vite_js), [Mastodon](https://webtoo.ls/@vite).

## Vite на Rolldown

### Проблема

С ранних версий Vite использовал два бандлера под разные задачи. [esbuild](https://esbuild.github.io/) обеспечивал быструю компиляцию в dev (pre-bundle зависимостей и трансформы TypeScript/JSX), [Rollup](https://rollupjs.org/) — production-бандлинг, чанки и оптимизацию на богатом plugin API всей экосистемы Vite.

Два бандлера долго работали: фокус на DX и оркестрации без переписывания парсинга с нуля. Но цена — два пайплайна трансформации, фактически две системы плагинов и растущий слой синхронизации. Накапливались краевые случаи расхождений в модулях; каждое выравнивание в одном конвейере рисковало дать расхождение в другом.

### Решение

[Rolldown](https://rolldown.rs/) — бандлер на Rust от команды [VoidZero](https://voidzero.dev), созданный под эти вызовы. Три цели:

- **Производительность:** нативная скорость Rust. В бенчмарках [в 10–30 раз быстрее Rollup](https://github.com/rolldown/benchmarks), уровень esbuild.
- **Совместимость:** тот же plugin API, что у Rollup и Vite. Большинство существующих плагинов Vite работают из коробки с Vite 8.
- **Продвинутые возможности:** один бандлер открывает то, что с двумя было сложно или невозможно: full bundle mode, гибче сплит чанков, модульный персистентный кэш, Module Federation.

### Путь к стабильному релизу

Миграция была осознанной и с участием сообщества. Сначала отдельный пакет [`rolldown-vite`](https://voidzero.dev/posts/announcing-rolldown-vite) как технический превью — ранние пользователи без риска для стабильного Vite. Их фидбек бесценен: реальные кодовые базы выявили краевые случаи до широкого релиза. Отдельный CI проверял ключевые плагины и фреймворки на новом бандлере.

В декабре 2025 вышла [бета Vite 8](/blog/announcing-vite8-beta) с полной интеграцией Rolldown. За бета-период Rolldown дошёл до release candidate с улучшениями по тестам и фидбеку сообщества.

### Производительность в бою

На этапах превью и беты `rolldown-vite` компании сообщали о сокращении времени production-сборки:

- **Linear:** с 46 с до 6 с
- **Ramp:** −57%
- **Mercedes-Benz.io:** до −38%
- **Beehiiv:** −64%

На крупных проектах эффект особенно заметен; по мере развития Rolldown ждём дальнейших улучшений.

### Единый toolchain

С Vite 8 Vite — вход в сквозной toolchain с тесной координацией команд: инструмент сборки (Vite), бандлер (Rolldown), компилятор ([Oxc](https://oxc.rs/)). Поведение согласовано от парсинга и резолва до трансформации и минификации; новые спецификации JS внедряются быстрее. Глубокая интеграция слоёв открывает оптимизации вроде семантического анализа Oxc для tree-shaking в Rolldown.

### Спасибо сообществу

Без широкого сообщества это было бы невозможно. Благодарим команды фреймворков ([SvelteKit](https://svelte.dev/docs/kit/introduction), [React Router](https://reactrouter.com/), [Storybook](https://storybook.js.org/), [Astro](https://astro.build/), [Nuxt](https://nuxt.com/) и других), рано тестировавшие `rolldown-vite`, приславшие детальные багрепорты и помогавшие с совместимостью. Спасибо каждому, кто пробовал бету, делился ускорением сборки и указывал на шероховатости — это сделало переход на Rolldown плавнее и надёжнее.

## Поддержка Node.js

Vite 8 требует Node.js 20.19+, 22.12+ — как Vite 7. Так Node поддерживает `require(esm)` без флага, и Vite можно отдавать только как ESM.

## Дополнительные возможности

Помимо Rolldown в Vite 8:

- **Встроенные Devtools:** опция [`devtools`](/config/shared-options#devtools) для [Vite Devtools](https://devtools.vite.dev/) — отладка и анализ прямо с dev-сервера.

- **Встроенная поддержка `paths` из tsconfig:** [`resolve.tsconfigPaths`](/config/shared-options.md#resolve-tsconfigpaths) = `true` для алиасов TypeScript. Небольшая цена по CPU, по умолчанию выключено.

- **`emitDecoratorMetadata`:** встроенная поддержка опции TypeScript `emitDecoratorMetadata` без внешних плагинов. Подробнее — [Features](/guide/features.md#emitdecoratormetadata).

- **Wasm SSR:** импорты [`.wasm?init`](/guide/features#webassembly) работают в SSR.

- **Проброс консоли браузера:** логи и ошибки из консоли браузера — в терминал dev-сервера. Удобно с coding agents: ошибки клиента видны в CLI. Включение — [`server.forwardConsole`](/config/server-options.md#server-forwardconsole); при обнаружении coding agent включается автоматически.

## `@vitejs/plugin-react` v6

Вместе с Vite 8 выходит `@vitejs/plugin-react` v6. Плагин использует Oxc для React Refresh. Babel больше не в зависимостях — меньше размер установки.

Для [React Compiler](https://react.dev/learn/react-compiler) в v6 есть хелпер `reactCompilerPreset` с `@rolldown/plugin-babel` — явный opt-in без усложнения дефолта.

Подробнее — [Release Notes](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react%406.0.0).

v5 совместим с Vite 8 — плагин можно обновить после Vite.

## Дальше

Интеграция Rolldown открывает дорогу улучшениям. В работе:

- **Full Bundle Mode** (эксперимент): бандлинг модулей в dev, ближе к production. Предварительно: в 3 раза быстрее старт dev, на 40% быстрее полные перезагрузки, в 10 раз меньше сетевых запросов. Особенно важно для больших проектов, где unbundled dev упирается в масштаб.

- [**Raw AST transfer**](https://github.com/oxc-project/oxc/issues/2409): JS-плагины получают AST из Rust с минимальной сериализацией.

- [**Native MagicString transforms**](https://rolldown.rs/in-depth/native-magic-string#native-magicstring): логика трансформов в JS, манипуляции строк в Rust.

- **Стабилизация Environment API:** регулярные встречи экосистемы для совместной работы.

## Размер установки

Прозрачно про изменения размера. Vite 8 примерно на 15 МБ тяжелее Vite 7:

- **~10 МБ lightningcss:** раньше опциональный peer, теперь обычная зависимость для лучшей минификации CSS из коробки.
- **~5 МБ Rolldown:** бинарник крупнее esbuild + Rollup из‑за оптимизаций скорости в ущерб размеру.

Будем следить и сокращать размер по мере зрелости Rolldown.

## Миграция на Vite 8

Для большинства проектов обновление должно быть плавным: слой совместимости автоматически переводит `esbuild` и `rollupOptions` в эквиваленты Rolldown и Oxc — многие проекты без правок конфига.

Для крупных или сложных — постепенно: на Vite 7 сначала `rolldown-vite` вместо `vite`, затем Vite 8. Так проще понять, проблема в смене бандлера или в остальных изменениях Vite 8.

Перед апгрейдом изучите [руководство по миграции](/guide/migration). Полный список — [changelog Vite 8](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md).

## Спасибо, Rollup и esbuild

Переходя на Rolldown, хотим выразить глубокую благодарность двум проектам, на которых держался Vite.

Rollup с самого начала был production-бандлером Vite. Элегантный plugin API оказался настолько удачным, что Rolldown унаследовал его, а вся экосистема плагинов Vite выросла на фундаменте Rollup. Качество архитектуры Rollup сформировало подход Vite к расширяемости. Спасибо [Rich Harris](https://github.com/Rich-Harris) за Rollup и [Lukas Taegert-Atkinson](https://github.com/lukastaegert) с командой Rollup за развитие инструмента с огромным влиянием на веб-toolchain.

esbuild с ранних дней давал невероятно быстрый dev: pre-bundle зависимостей, трансформы TypeScript и JSX за миллисекунды. esbuild показал, что сборка может быть на порядки быстрее, и задал планку, на которую ориентировалось поколение инструментов на Rust и Go. Спасибо [Evan Wallace](https://github.com/evanw) за то, что показал, что возможно.

Без этих двух проектов Vite не был бы тем, что есть сегодня. Влияние Rollup и esbuild глубоко в ДНК Vite; мы благодарны за вклад в экосистему. Зависимости и люди — на странице [Acknowledgements](/acknowledgements).

## Благодарности

Vite 8 возглавили [sapphi-red](https://github.com/sapphi-red) и [команда Vite](/team) при поддержке сообщества, downstream и авторов плагинов. Спасибо [команде Rolldown](https://rolldown.rs/team) за тесное сотрудничество. Особая благодарность всем участникам превью `rolldown-vite` и бета-периода Vite 8 — тесты, багрепорты и фидбек сделали миграцию на Rolldown возможной.

Vite — [VoidZero](https://voidzero.dev) в партнёрстве с [Bolt](https://bolt.new/) и [NuxtLabs](https://nuxtlabs.com/). Спасибо спонсорам на [GitHub Sponsors](https://github.com/sponsors/vitejs) и [Open Collective](https://opencollective.com/vite).
