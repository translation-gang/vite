---
title: Анонс Vite 2.0
author:
  - name: The Vite Team
sidebar: false
date: 2021-02-16
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Анонс Vite 2.0
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite2
  - - meta
    - property: og:description
      content: Анонс релиза Vite 2
---

# Анонс Vite 2.0

_16 февраля 2021_ — см. также [анонс Vite 3.0](./announcing-vite3.md)

<p style="text-align:center">
  <img src="/logo.svg" style="height:200px">
</p>

Сегодня мы рады объявить о официальном релизе Vite 2.0!

Vite (франц. «быстро», произносится `/vit/`) — новый тип инструментов сборки для фронтенд-разработки. Представьте преднастроенный dev server + bundler в одном флаконе, но легче и быстрее. Он опирается на [нативные ES-модули](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) в браузере и инструменты вроде [esbuild](https://esbuild.github.io/), скомпилированные в нативный код, чтобы дать быстрый и современный DX.

Чтобы оценить скорость Vite, посмотрите [это видео-сравнение](https://twitter.com/amasad/status/1355379680275128321) запуска React-приложения на Repl.it: Vite против `create-react-app` (CRA).

Если вы ещё не слышали о Vite и хотите узнать больше, загляните в [обоснование проекта](https://vite.dev/guide/why.html). Если интересно, чем Vite отличается от похожих инструментов, см. [сравнения](https://v5.vite.dev/guide/comparisons.html).

## Что нового в 2.0

Мы решили полностью переработать внутренности до выхода 1.0 из RC, так что это по сути первый стабильный релиз Vite. Тем не менее Vite 2.0 даёт много крупных улучшений по сравнению с прежней версией:

### Ядро без привязки к фреймворку

Изначально Vite задумывался как [прототип, отдающий Vue single-file components через нативный ESM](https://github.com/vuejs/vue-dev-server). Vite 1 развивал эту идею с HMR поверх.

Vite 2.0 учитывает накопленный опыт и переписан с нуля с более надёжной архитектурой. Теперь он полностью agnostic к фреймворку; вся специфичная поддержка — в плагинах. Есть [официальные шаблоны для Vue, React, Preact, Lit Element](https://github.com/vitejs/vite/tree/main/packages/create-vite) и активные усилия сообщества по интеграции со Svelte.

### Новый формат плагинов и API

Вдохновлённый [WMR](https://github.com/preactjs/wmr), новый плагин-система расширяет интерфейс плагинов Rollup и [совместима со многими плагинами Rollup](https://vite-rollup-plugins.patak.dev/) из коробки. Плагины могут использовать Rollup-совместимые хуки плюс Vite-специфичные хуки и свойства для dev/build и кастомного HMR.

[Программный API](https://vite.dev/guide/api-javascript.html) тоже сильно улучшен для инструментов и фреймворков поверх Vite.

### Pre-bundling зависимостей на esbuild

Так как Vite — нативный ESM dev server, он pre-bundle’ит зависимости, чтобы сократить число запросов к браузеру и конвертировать CommonJS в ESM. Раньше для этого использовался Rollup; в 2.0 — `esbuild`, что даёт в 10–100 раз более быстрый pre-bundling. Для ориентира: cold start тестового приложения с тяжёлыми зависимостями вроде React Material UI на MacBook Pro с M1 раньше занимал ~28 с, теперь ~1.5 с. Похожий выигрыш ожидается при переходе с классического bundler-based setup.

### CSS как полноправный участник графа модулей

Vite трактует CSS как first-class citizen графа модулей и из коробки поддерживает:

- **Улучшение resolver**: пути в `@import` и `url()` в CSS проходят через resolver Vite с учётом алиасов и npm-зависимостей.
- **Rebasing URL**: пути `url()` автоматически пересчитываются независимо от места импорта.
- **Code splitting CSS**: при code-splitting JS-чанка эмитится соответствующий CSS, который подгружается параллельно с JS при запросе.

### Поддержка SSR (server-side rendering)

В Vite 2.0 есть [экспериментальная поддержка SSR](https://vite.dev/guide/ssr.html). Vite даёт API для эффективной загрузки и обновления ESM-кода в Node.js в dev (почти как server-side HMR) и автоматически external’ит CJS-совместимые зависимости для скорости dev и SSR-сборки. Продакшен-сервер может быть полностью отвязан от Vite; ту же схему легко адаптировать под pre-rendering / SSG.

Vite SSR задуман как низкоуровневая возможность; ожидаем, что фреймворки будут использовать её под капотом.

### Опциональная поддержка legacy-браузеров

По умолчанию Vite ориентируется на современные браузеры с нативным ESM, но можно включить legacy через официальный [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy). Плагин генерирует пары modern/legacy бандлов и отдаёт нужный по feature detection, чтобы в современных браузерах не тащить лишний код.

## Попробуйте!

Возможностей много, но начать просто: Vite-приложение можно поднять буквально за минуту (нужен Node.js >= 12):

```bash
npm init @vitejs/app
```

Дальше смотрите [руководство](https://vite.dev/guide/), что даёт Vite из коробки. Исходники — на [GitHub](https://github.com/vitejs/vite), обновления — в [Twitter](https://twitter.com/vite_js), обсуждения — в [Discord](https://chat.vite.dev).
