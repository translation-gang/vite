---
title: Вышел Vite 5.0!
author:
  name: Команда Vite
date: 2023-11-16
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Анонс Vite 5
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite5.webp
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite5
  - - meta
    - property: og:description
      content: Анонс релиза Vite 5
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Вышел Vite 5.0!

_16 ноября 2023_

![Обложка анонса Vite 5](/og-image-announcing-vite5.webp)

Vite 4 [вышел](./announcing-vite4.md) почти год назад и стал надёжной основой для экосистемы. Еженедельные загрузки с npm выросли с 2,5 млн до 7,5 млн — проекты продолжают строиться на общей инфраструктуре. Фреймворки не переставали развиваться: помимо [Astro](https://astro.build/), [Nuxt](https://nuxt.com/), [SvelteKit](https://kit.svelte.dev/), [Solid Start](https://www.solidjs.com/blog/introducing-solidstart), [Qwik City](https://qwik.builder.io/qwikcity/overview/) и других появились новые фреймворки, укрепляющие экосистему. Переход [RedwoodJS](https://redwoodjs.com/) и [Remix](https://remix.run/) на Vite открывает путь к дальнейшему распространению в экосистеме React. [Vitest](https://vitest.dev) рос даже быстрее Vite. Команда усердно работает и скоро [выпустит Vitest 1.0](https://github.com/vitest-dev/vitest/issues/3596). История Vite в связке с [Storybook](https://storybook.js.org), [Nx](https://nx.dev) и [Playwright](https://playwright.dev) продолжала улучшаться; то же касается окружений — dev Vite работает и в [Deno](https://deno.com), и в [Bun](https://bun.sh).

Месяц назад прошла вторая [ViteConf](https://viteconf.org/23/replay) на площадке [StackBlitz](https://stackblitz.com). Как и в прошлом году, большинство проектов экосистемы собрались, чтобы обменяться идеями и укрепить общее поле. Появляются новые элементы «пояса» метафреймворков — например [Volar](https://volarjs.dev/) и [Nitro](https://nitro.build/). В тот же день команда Rollup выпустила [Rollup 4](https://rollupjs.org) — традицию начал Лукас в прошлом году.

Шесть месяцев назад вышел Vite 4.3 [анонс](./announcing-vite4.md). Релиз заметно ускорил dev-сервер, но запас для роста ещё большой. На ViteConf [Evan You представил долгосрочный план Vite — работу над Rolldown](https://www.youtube.com/watch?v=hrdwQHoAp0M), портом Rollup на Rust с совместимыми API. Когда он будет готов, мы планируем использовать его в ядре Vite вместо Rollup и esbuild. Это даст прирост скорости сборки (а позже и dev за счёт переноса чувствительных к производительности частей Vite в Rust) и сильно снизит расхождения между dev и build. Rolldown пока на ранней стадии; команда готовится открыть код до конца года. Следите за новостями!

Сегодня мы отмечаем ещё одну веху в истории Vite. [Команда](/team) Vite, [контрибьюторы](https://github.com/vitejs/vite/graphs/contributors) и партнёры экосистемы рады объявить о выходе Vite 5. Vite теперь использует [Rollup 4](https://github.com/vitejs/vite/pull/14508) — это уже заметный прирост скорости сборки. Появились и новые опции для профиля производительности dev-сервера.

Vite 5 сфокусирован на чистке API (удаление устаревшего) и упорядочивании функций с закрытием давних задач — например `define` переведён на корректную подстановку через AST вместо регулярных выражений. Мы продолжаем готовить Vite к будущему: теперь нужен Node.js 18+, [CJS Node API помечен как устаревший](/guide/migration#deprecate-cjs-node-api).

Быстрые ссылки:

- [Документация](/)
- [Руководство по миграции](/guide/migration)
- [Changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#500-2023-11-16)

Документация на других языках:

- [简体中文](https://cn.vite.dev/)
- [日本語](https://ja.vite.dev/)
- [Español](https://es.vite.dev/)
- [Português](https://pt.vite.dev/)
- [한국어](https://ko.vite.dev/)
- [Deutsch](https://de.vite.dev/) (новый перевод!)

Если вы новичок в Vite, сначала прочитайте [Начало работы](/guide/) и [Возможности](/guide/features).

Мы благодарим более чем [850 контрибьюторов ядра Vite](https://github.com/vitejs/vite/graphs/contributors), а также мейнтейнеров и авторов плагинов, интеграций, инструментов и переводов. Присоединяйтесь — вместе мы сделаем Vite лучше. Подробнее в [руководстве по контрибуции](https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md). Начать можно с [разбора issues](https://github.com/vitejs/vite/issues), [ревью PR](https://github.com/vitejs/vite/pulls), PR с падающими тестами по открытым задачам и помощи в [Discussions](https://github.com/vitejs/vite/discussions) и [форуме помощи](https://discord.com/channels/804011606160703521/1019670660856942652) Vite Land. По пути вы многому научитесь и получите путь к более глубокому участию. Вопросы — в [Discord](https://chat.vite.dev), канал [#contributing](https://discord.com/channels/804011606160703521/804439875226173480).

Чтобы не пропускать новости, подписывайтесь на [X](https://twitter.com/vite_js) или [Mastodon](https://webtoo.ls/@vite).

## Быстрый старт с Vite 5

Используйте `pnpm create vite`, чтобы создать проект с нужным фреймворком, или откройте готовый шаблон онлайн и поиграйте с Vite 5 на [vite.new](https://vite.new). Можно запустить `pnpm create vite-extra` — шаблоны других фреймворков и рантаймов (Solid, Deno, SSR и стартеры библиотек). Шаблоны `create vite-extra` также доступны в `create vite` в опции `Others`.

Стартовые шаблоны Vite задуманы как площадка для экспериментов с разными фреймворками. Для реального проекта лучше брать рекомендованные фреймворками стартеры. Некоторые фреймворки уже перенаправляют из `create vite` на свои стартеры (`create-vue` и `Nuxt 3` для Vue, `SvelteKit` для Svelte).

## Поддержка Node.js

Vite больше не поддерживает Node.js 14 / 16 / 17 / 19 — они достигли EOL. Требуется Node.js 18 / 20+.

## Производительность

Помимо ускорения сборки в Rollup 4, есть новое руководство по типичным проблемам производительности: [https://vite.dev/guide/performance](/guide/performance).

В Vite 5 появился [server.warmup](/guide/performance.html#warm-up-frequently-used-files) — предпрогрев при старте сервера: можно задать модули для предтрансформации сразу после запуска. При [`--open` или `server.open`](/config/server-options.html#server-open) Vite также автоматически прогревает точку входа приложения или URL для открытия.

## Основные изменения

- [Vite теперь на Rollup 4](/guide/migration#rollup-4)
- [CJS Node API помечен как устаревший](/guide/migration#deprecate-cjs-node-api)
- [Переработана стратегия замены `define` и `import.meta.env.*`](/guide/migration#rework-define-and-import-meta-env-replacement-strategy)
- [Значение внешних SSR-модулей совпадает с production](/guide/migration#ssr-externalized-modules-value-now-matches-production)
- [`worker.plugins` теперь функция](/guide/migration#worker-plugins-is-now-a-function)
- [Путь с `.` может отдавать index.html](/guide/migration#allow-path-containing-to-fallback-to-index-html)
- [Согласовано поведение dev и preview при отдаче HTML](/guide/migration#align-dev-and-preview-html-serving-behaviour)
- [Манифесты по умолчанию в каталоге `.vite`](/guide/migration#manifest-files-are-now-generated-in-vite-directory-by-default)
- [Для CLI-шорткатов нужен дополнительный `Enter`](/guide/migration#cli-shortcuts-require-an-additional-enter-press)
- [Обновлено поведение `experimentalDecorators` и `useDefineForClassFields` в TypeScript](/guide/migration#update-experimentaldecorators-and-usedefineforclassfields-typescript-behaviour)
- [Удалены флаг `--https` и `https: true`](/guide/migration#remove-https-flag-and-https-true)
- [Удалены API `resolvePackageEntry` и `resolvePackageData`](/guide/migration#remove-resolvepackageentry-and-resolvepackagedata-apis)
- [Удалены ранее помеченные устаревшими API](/guide/migration#removed-deprecated-apis)
- [Подробнее о продвинутых изменениях для авторов плагинов и инструментов](/guide/migration#advanced)

## Миграция на Vite 5

Мы работали с партнёрами экосистемы, чтобы миграция прошла гладко. Снова неоценим [vite-ecosystem-ci](https://www.youtube.com/watch?v=7L4I4lDzO48) — он помог смелее менять код без регрессий. Рады, что другие экосистемы берут похожие схемы для сотрудничества с downstream.

Для большинства проектов обновление до Vite 5 должно быть простым. Перед апгрейдом всё же изучите [подробное руководство по миграции](/guide/migration).

Полный список изменений в ядре — в [changelog Vite 5](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#500-2023-11-16).

## Благодарности

Vite 5 — результат долгой работы сообщества контрибьюторов, downstream-мейнтейнеров, авторов плагинов и [команды Vite](/team). Отдельное спасибо [Bjorn Lu](https://twitter.com/bluwyoo) за ведение релизного процесса этого мажора.

Благодарим спонсоров разработки Vite: [StackBlitz](https://stackblitz.com/), [Nuxt Labs](https://nuxtlabs.com/) и [Astro](https://astro.build) продолжают инвестировать в Vite, нанимая членов команды. Спасибо спонсорам на [GitHub Sponsors Vite](https://github.com/sponsors/vitejs), [Open Collective Vite](https://opencollective.com/vite) и [GitHub Sponsors Evan You](https://github.com/sponsors/yyx990803). Особо отметим [Remix](https://remix.run/) — золотой спонсор после перехода на Vite.
