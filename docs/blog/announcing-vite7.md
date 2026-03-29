---
title: Вышел Vite 7.0!
author:
  name: Команда Vite
date: 2025-06-24
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Анонс Vite 7
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite7.webp
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite7
  - - meta
    - property: og:description
      content: Анонс релиза Vite 7
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Вышел Vite 7.0!

_24 июня 2025_

![Обложка анонса Vite 7](/og-image-announcing-vite7.webp)

Рады объявить о выходе Vite 7! Прошло 5 лет с первого коммита Evan You в репозиторий Vite — мало кто мог предсказать, насколько изменится фронтенд-экосистема. Современные фреймворки и инструменты строятся на общей инфраструктуре Vite и быстрее инновируют на более высоком уровне абстракции. Vite качают 31 млн раз в неделю — плюс 14 млн за семь месяцев с прошлого мажора.

В этом году несколько крупных шагов. [ViteConf](https://viteconf.org) впервые офлайн! Экосистема Vite соберётся в Амстердаме 9–10 октября. Организатор — [JSWorld](https://jsworldconference.com/) вместе с [Bolt](https://bolt.new), [VoidZero](https://voidzero.dev) и командой ядра Vite. Три сильных [онлайн-издания ViteConf](https://www.youtube.com/@viteconf/playlists) позади — ждём живых встреч. Спикеры и билеты — на [сайте ViteConf](https://viteconf.org).

[VoidZero](https://voidzero.dev/posts/announcing-voidzero-inc) продвигает открытый единый toolchain для JavaScript. За год команда развивает [Rolldown](https://rolldown.rs/) — бандлер на Rust — как часть модернизации ядра Vite. Попробовать Vite на Rolldown можно, поставив пакет `rolldown-vite` вместо `vite` — drop-in замена: Rolldown станет бандлером по умолчанию. Сборка, особенно на больших проектах, должна ускориться. Подробнее — [пост про Rolldown-vite](https://voidzero.dev/posts/announcing-rolldown-vite) и [руководство по миграции](https://vite.dev/rolldown).

Партнёрство VoidZero и [NuxtLabs](https://nuxtlabs.com/): Anthony Fu работает над Vite DevTools — глубже и нагляднее отладка и анализ для проектов и фреймворков на Vite. Подробнее — [VoidZero и NuxtLabs объединяют усилия над Vite DevTools](https://voidzero.dev/posts/voidzero-nuxtlabs-vite-devtools).

Быстрые ссылки:

- [Документация](/)
- Новый перевод: [فارسی](https://fa.vite.dev/)
- Остальные: [简体中文](https://cn.vite.dev/), [日本語](https://ja.vite.dev/), [Español](https://es.vite.dev/), [Português](https://pt.vite.dev/), [한국어](https://ko.vite.dev/), [Deutsch](https://de.vite.dev/)
- [Руководство по миграции](/guide/migration)
- [Changelog на GitHub](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)

Онлайн — [vite.new](https://vite.new); локально — `pnpm create vite`. Подробнее — [Начало работы](/guide/).

Присоединяйтесь к улучшению Vite (уже более [1,1K контрибьюторов ядра](https://github.com/vitejs/vite/graphs/contributors)), зависимостей, плагинов и проектов экосистемы: [Руководство по участию](https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md). Старт: [issues](https://github.com/vitejs/vite/issues), [PR](https://github.com/vitejs/vite/pulls), тестовые PR, [Discussions](https://github.com/vitejs/vite/discussions) или [форум помощи](https://discord.com/channels/804011606160703521/1019670660856942652) Vite Land. Вопросы — [Discord](https://chat.vite.dev), [#contributing](https://discord.com/channels/804011606160703521/804439875226173480).

Новости и сообщество — [Bluesky](https://bsky.app/profile/vite.dev), [X](https://twitter.com/vite_js), [Mastodon](https://webtoo.ls/@vite).

## Поддержка Node.js

Требуется Node.js 20.19+, 22.12+. Node.js 18 снят — достиг [EOL](https://endoflife.date/nodejs) в конце апреля 2025.

Нужны эти версии, чтобы Node поддерживал `require(esm)` без флага. Тогда Vite 7.0 можно отдавать только как ESM, не ломая `require` CJS-модулей к JS API Vite. Подробности — [Move on to ESM-only](https://antfu.me/posts/move-on-to-esm-only) от Anthony Fu.

## Дефолтная цель браузера: Baseline Widely Available

[Baseline](https://web-platform-dx.github.io/web-features/) показывает, какие возможности платформы стабильны в ключевом наборе браузеров. Baseline Widely Available — функция устоялась, работает на многих устройствах и версиях, доступна во всех целевых браузерах не меньше 30 месяцев.

В Vite 7 дефолт цели браузера меняется с `'modules'` на `'baseline-widely-available'`. Набор браузеров будет обновляться с каждым мажором под минимальные версии, совместимые с Baseline Widely Available. Меняется дефолт `build.target`:

- Chrome 87 → 107
- Edge 88 → 107
- Firefox 78 → 104
- Safari 14.0 → 16.0

Так проще предсказывать цель браузера в будущих релизах.

## Vitest

С Vitest 3.2 поддерживается Vite 7.0. Подробнее — [блог о релизе Vitest 3.2](https://vitest.dev/blog/vitest-3-2.html).

## API окружений (Environment API)

Vite 6 — крупнейший мажор с Vite 2 благодаря [экспериментальному Environment API](https://vite.dev/blog/announcing-vite6.html#experimental-environment-api). API остаются экспериментальными, пока экосистема оценивает применимость. Если вы строите на Vite — протестируйте API и пишите в [открытое обсуждение с фидбеком](https://github.com/vitejs/vite/discussions/16358).

В Vite 7 добавлен хук `buildApp` для координации сборки окружений плагинами. Подробнее — [Environment API for Frameworks](/guide/api-environment-frameworks.html#environments-during-build).

Спасибо командам, тестирующим API. Например, Cloudflare выпустила 1.0 плагина Cloudflare Vite и официальную поддержку React Router v7 — хороший пример Environment API для runtime-провайдеров. Подробнее — [«Just use Vite»… with the Workers runtime](https://blog.cloudflare.com/introducing-the-cloudflare-vite-plugin/).

## Миграция на Vite 7

Переход с Vite 6 должен быть плавным. Убираем уже помеченное устаревшим: legacy API Sass, `splitVendorChunkPlugin` — на типичные проекты не должно повлиять. Перед апгрейдом всё же просмотрите [руководство по миграции](/guide/migration).

Полный список — в [changelog Vite 7](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md).

## Благодарности

Vite 7 создали [команда Vite](/team) при поддержке сообщества, downstream и авторов плагинов. Особая благодарность [sapphi-red](https://github.com/sapphi-red) за работу над `rolldown-vite` и этим релизом. Vite — [VoidZero](https://voidzero.dev) в партнёрстве с [Bolt](https://bolt.new/) и [Nuxt Labs](https://nuxtlabs.com/). Спасибо спонсорам на [GitHub Sponsors](https://github.com/sponsors/vitejs) и [Open Collective](https://opencollective.com/vite).
