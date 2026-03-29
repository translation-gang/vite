---
title: 'Vite 8 Beta: Vite на Rolldown'
author:
  name: Команда Vite
date: 2025-12-03
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Анонс Vite 8 Beta
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite8-beta.webp
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite8-beta
  - - meta
    - property: og:description
      content: Анонс бета-релиза Vite 8
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 8 Beta: Vite на Rolldown

_3 декабря 2025_

![Обложка анонса Vite 8 Beta](/og-image-announcing-vite8-beta.webp)

Кратко: доступна первая бета Vite 8 на [Rolldown](https://rolldown.rs/). Значительно быстрее production-сборки и задел на будущие улучшения. Попробовать: обновить `vite` до `8.0.0-beta.0` и прочитать [руководство по миграции](/guide/migration).

---

Рады выпустить первую бету Vite 8. Релиз объединяет нижележащий toolchain, выравнивает поведение и сильно ускоряет сборку. Бандлером Vite теперь служит [Rolldown](https://rolldown.rs/) вместо связки esbuild и Rollup.

## Новый бандлер для веба

Раньше Vite опирался на два бандлера под разные задачи:

1. esbuild — быстрая компиляция в dev
2. Rollup — бандлинг, чанки и оптимизация production

Так можно было сфокусироваться на DX и оркестрации, не изобретая парсинг и бандлинг. Но два конвейера давали расхождения: разные пайплайны трансформации, разные системы плагинов и растущий слой «клея» для согласованности dev и production.

[Команда VoidZero](https://voidzero.dev) создала **Rolldown** — следующее поколение бандлера для Vite. Заложено:

- **Производительность:** Rust и нативная скорость. Уровень esbuild и [**в 10–30 раз быстрее Rollup**](https://github.com/rolldown/benchmarks).
- **Совместимость:** тот же plugin API, что у Rollup и Vite. Большинство плагинов Vite работают с Vite 8 без доработок.
- **Больше возможностей:** full bundle mode, гибче сплит чанков, модульный персистентный кэш, Module Federation и другое.

## Единый toolchain

Смена бандлера влияет не только на скорость. Бандлеры используют парсеры, резолверы, трансформеры и минификаторы. Rolldown для этого опирается на Oxc — тоже проект VoidZero.

**Vite становится входной точкой в сквозной toolchain одной команды: инструмент сборки (Vite), бандлер (Rolldown) и компилятор (Oxc).**

Поведение согласовано по стеку, новые спецификации JavaScript можно внедрять быстрее. Открываются улучшения, недоступные одному только Vite — например семантический анализ Oxc для лучшего tree-shaking в Rolldown.

## Как Vite перешёл на Rolldown

Миграция на Rolldown — фундаментальное изменение, поэтому шаги были осознанными, без потери стабильности и совместимости с экосистемой.

Сначала отдельный пакет `rolldown-vite` [вышел как технический превью](https://voidzero.dev/posts/announcing-rolldown-vite) — ранние пользователи без риска для стабильного Vite. Они получили прирост скорости и дали фидбек. Примеры:

- У Linear время production-сборки сократилось с 46 с до 6 с
- У Ramp — на 57%
- У Mercedes-Benz.io — до 38%
- У Beehiiv — на 64%

Далее — тесты ключевых плагинов Vite против `rolldown-vite` в CI: раннее обнаружение регрессий для SvelteKit, react-router, Storybook и др.

Наконец — слой совместимости для переноса опций Rollup и esbuild на эквиваленты Rolldown.

В итоге путь к Vite 8 Beta получился плавным.

## Миграция на Vite 8 Beta

Мы старались не трогать публичный API конфигурации и хуки плагинов. Есть [руководство по миграции](/guide/migration).

Два пути:

1. **Прямое обновление:** поднять `vite` в `package.json` и запускать привычные dev/build.
2. **Постепенно:** с Vite 7 перейти на `rolldown-vite`, затем на Vite 8 — изолировать несовместимости Rolldown без прочих изменений Vite. (Рекомендуется для крупных или сложных проектов)

> [!IMPORTANT]
> Если вы опираетесь на специфичные опции Rollup или esbuild, конфиг Vite может потребовать правок. См. [руководство по миграции](/guide/migration) с примерами.
> Как и для любого нестабильного мажора, после обновления нужна тщательная проверка. Сообщайте об [issues](https://github.com/vitejs/rolldown-vite/issues).

Если фреймворк или инструмент тянет Vite как зависимость (Astro, Nuxt, Vitest и т.д.), нужно переопределить зависимость `vite` в `package.json` — синтаксис зависит от менеджера пакетов:

:::code-group

```json [npm]
{
  "overrides": {
    "vite": "8.0.0-beta.0"
  }
}
```

```json [Yarn]
{
  "resolutions": {
    "vite": "8.0.0-beta.0"
  }
}
```

```json [pnpm]
{
  "pnpm": {
    "overrides": {
      "vite": "8.0.0-beta.0"
    }
  }
}
```

```json [Bun]
{
  "overrides": {
    "vite": "8.0.0-beta.0"
  }
}
```

:::

После overrides переустановите зависимости и запускайте dev/build как обычно.

## Дополнительные возможности Vite 8

Помимо Rolldown в Vite 8 есть:

- **Встроенная поддержка `paths` из tsconfig:** включение через [`resolve.tsconfigPaths`](/config/shared-options.md#resolve-tsconfigpaths) = `true`. Небольшая цена по производительности, по умолчанию выключено.
- **Поддержка `emitDecoratorMetadata`:** встроенная автоматическая поддержка опции TypeScript [`emitDecoratorMetadata`](https://www.typescriptlang.org/tsconfig/#emitDecoratorMetadata). Подробнее — [Features](/guide/features.md#emitdecoratormetadata).

## Дальше

Скорость всегда была визитной карточкой Vite. Rolldown и Oxc дают разработчикам на JavaScript выигрыш от скорости Rust. Обновление до Vite 8 само по себе ускоряет сборку.

Скоро выйдет Full Bundle Mode Vite — сильно ускорит dev-сервер на больших проектах. Предварительно: в 3 раза быстрее старт dev, на 40% быстрее полные перезагрузки, в 10 раз меньше сетевых запросов.

Сильна и экосистема плагинов. Хотим, чтобы разработчики по-прежнему расширяли Vite на JavaScript, получая выгоду от Rust. Мы вместе с VoidZero ускоряем использование JS-плагинов в этих системах.

Экспериментальные направления:

- [**Raw AST transfer**](https://github.com/oxc-project/oxc/issues/2409) — доступ JS-плагинов к AST из Rust с минимальными накладными расходами.
- [**Native MagicString transforms**](https://rolldown.rs/in-depth/native-magic-string#native-magicstring) — простые кастомные трансформы: логика в JS, вычисления в Rust.

## Связь с нами

Если попробовали Vite 8 beta — ждём фидбек. Сообщения и опыт:

- **Discord:** [сервер сообщества](https://chat.vite.dev/) для живого общения
- **GitHub:** [Discussions](https://github.com/vitejs/vite/discussions)
- **Issues:** баги и регрессии — [репозиторий rolldown-vite](https://github.com/vitejs/rolldown-vite/issues)
- **Успехи:** делитесь ускорением сборки в [rolldown-vite-perf-wins](https://github.com/vitejs/rolldown-vite-perf-wins)

Спасибо за репорты и воспроизводимые кейсы — они ведут к стабильному 8.0.0.
