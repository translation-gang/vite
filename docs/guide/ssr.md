# Серверный рендеринг (SSR)

:::tip Примечание
SSR здесь — фронтенд-фреймворки (React, Preact, Vue, Svelte и т.д.), где одно приложение запускается в Node.js, пререндерится в HTML и гидратируется на клиенте. Для классических серверных фреймворков см. [интеграцию с бэкендом](./backend-integration).

Ниже предполагается, что вы уже знакомы с SSR в выбранном фреймворке; акцент — на особенностях Vite.
:::

:::warning Низкоуровневый API
API для авторов библиотек и фреймворков. Для приложений сначала смотрите высокоуровневые SSR-плагины в [Awesome Vite — SSR](https://github.com/vitejs/awesome-vite#ssr). Многие приложения строятся и на нативном низкоуровневом API Vite.

Ведётся работа над улучшенным SSR API через [Environment API](https://github.com/vitejs/vite/discussions/16358).
:::

## Примеры проектов {#example-projects}

Встроенная поддержка SSR. В [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) есть шаблоны:

- [Vanilla](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [Vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [React](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [Preact](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [Svelte](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [Solid](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

Локально: [`create-vite`](./index.md#scaffolding-your-first-vite-project) → `Others > create-vite-extra`.

## Структура исходников

Типичная структура:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

В `index.html` — ссылка на `entry-client.js` и плейсхолдер для SSR-разметки:

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Плейсхолдер может быть любым, главное — однозначно заменять его на сервере.

## Условная логика {#conditional-logic}

Различать SSR и клиент:

```js twoslash
import 'vite/client'
// ---cut---
if (import.meta.env.SSR) {
  // ... server only logic
}
```

Подставляется статически при сборке, неиспользуемые ветки можно вырезать tree-shaking’ом.

## Настройка dev-сервера

Для SSR обычно нужен свой основной сервер и отделение Vite от production. Рекомендуется middleware-режим Vite. Пример с [express](https://expressjs.com/):

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*all', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

`vite` — экземпляр [ViteDevServer](./api-javascript#vitedevserver). `vite.middlewares` — приложение [Connect](https://github.com/senchalabs/connect) для любого connect-совместимого фреймворка.

Обработчик `*` для HTML с SSR:

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'

/** @type {import('express').Express} */
var app
/** @type {import('vite').ViteDevServer}  */
var vite

// ---cut---
app.use('*all', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(import.meta.dirname, 'index.html'),
      'utf-8',
    )

    // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
    //    and also applies HTML transforms from Vite plugins, e.g. global
    //    preambles from @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. Load the server entry. ssrLoadModule automatically transforms
    //    ESM source code to be usable in Node.js! There is no bundling
    //    required, and provides efficient invalidation similar to HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. render the app HTML. This assumes entry-server.js's exported
    //     `render` function calls appropriate framework SSR APIs,
    //    e.g. ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. Inject the app-rendered HTML into the template.
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6. Send the rendered HTML back.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // If an error is caught, let Vite fix the stack trace so it maps back
    // to your actual source code.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

Скрипт `dev` в `package.json`:

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Сборка для production

Нужно:

1. Клиентская сборка как обычно;
2. SSR-сборка, загружаемая через `import()` без `ssrLoadModule`.

Скрипты:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

Флаг `--ssr` — SSR-сборка с указанием входа.

В `server.js` по `process.env.NODE_ENV`:

- Шаблон: `dist/client/index.html` (корректные ссылки на ассеты).
- Вместо `vite.ssrLoadModule('/src/entry-server.js')` — `import('./dist/server/entry-server.js')`.
- Создание и использование dev-сервера `vite` только в dev; в production — статика из `dist/client`.

Рабочие примеры: [примеры проектов](#example-projects).

## Генерация preload-директив

`vite build` с `--ssrManifest` создаёт `.vite/ssr-manifest.json` в выходной директории:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Файл: `dist/client/.vite/ssr-manifest.json` (манифест строится по клиентской сборке — сопоставление ID модулей с чанками и ассетами).

Фреймворку нужно собирать ID модулей, задействованных при SSR.

`@vitejs/plugin-vue` регистрирует ID компонентов в контексте Vue SSR:

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules is now a Set of module IDs that were used during the render
```

В production-ветке `server.js` передайте манифест в `render` из `entry-server.js` для preload асинхронных маршрутов. Полный пример: [demo source](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js). Можно использовать для [103 Early Hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103).

## Пререндер / SSG

Если маршруты и данные известны заранее, можно пререндерить в статический HTML той же логикой, что и production SSR (форма SSG). Пример: [prerender script](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js).

## Внешние зависимости SSR

По умолчанию зависимости вынесены из SSR-трансформа Vite — ускоряет dev и build.

Если пакет должен проходить через пайплайн Vite (нетранспилированные фичи Vite), добавьте в [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal).

Связанные (`linked`) пакеты по умолчанию не external для HMR. Чтобы вести себя как обычная зависимость — [`ssr.external`](../config/ssr-options.md#ssr-external).

:::warning Алиасы
Если алиасы перенаправляют пакеты, для external-зависимостей SSR лучше алиасить реальные пакеты в `node_modules`. Алиасы: [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias), [pnpm](https://pnpm.io/aliases/) с префиксом `npm:`.
:::

## SSR-специфичная логика плагинов {#ssr-specific-plugin-logic}

Vue/Svelte и др. компилируют компоненты по-разному для клиента и SSR. В хуках `resolveId`, `load`, `transform` в объекте `options` передаётся флаг `ssr`.

**Пример:**

```js twoslash
/** @type {() => import('vite').Plugin} */
// ---cut---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // perform ssr-specific transform...
      }
    },
  }
}
```

У `load` и `transform` объект `options` опционален; Rollup пока его не использует, но может расширить.

:::tip Примечание
До Vite 2.7 `ssr` передавался позиционным аргументом. Крупные фреймворки обновлены; в старых статьях может быть старый API.
:::

## Цель SSR

По умолчанию SSR-сборка под Node; можно запускать в Web Worker. Разрешение entry отличается. Для Worker: `ssr.target: 'webworker'`.

## Бандл SSR

В средах вроде `webworker` иногда нужен один JS-файл. Включите `ssr.noExternal: true`:

- все зависимости как `noExternal`
- ошибка при импорте встроенных модулей Node

## Условия resolve SSR

По умолчанию для SSR используются [`resolve.conditions`](../config/shared-options.md#resolve-conditions). Настройка: [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) и [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions).

## Командная строка Vite (CLI)

`vite dev` и `vite preview` применимы к SSR. SSR-middleware к dev-серверу — [`configureServer`](/guide/api-plugin#configureserver), к preview — [`configurePreviewServer`](/guide/api-plugin#configurepreviewserver).

:::tip Примечание
Используйте post-хук, чтобы SSR-middleware шёл **после** middleware Vite.
:::
