# Environment API для фреймворков

:::info Кандидат на релиз
Environment API в целом находится в фазе кандидата на релиз. Мы будем поддерживать стабильность API между мажорными релизами, чтобы экосистема могла экспериментировать и строить на их основе. Однако имейте в виду, что [некоторые конкретные API](/changes/#considering) всё ещё считаются экспериментальными.

Мы планируем стабилизировать эти новые API (с возможными breaking changes) в будущем мажорном релизе, когда даунстрим-проекты успеют поэкспериментировать с новыми возможностями и проверить их.

Материалы:

- [Обсуждение и обратная связь](https://github.com/vitejs/vite/discussions/16358), где мы собираем отзывы о новых API.
- [PR Environment API](https://github.com/vitejs/vite/pull/16471), где новые API были реализованы и ревьюились.

Поделитесь с нами своей обратной связью.
:::

## Уровни взаимодействия с `DevEnvironment` {#devenvironment-communication-levels}

Окружения могут выполняться в разных рантаймах, поэтому обмен с окружением может быть ограничен возможностями рантайма. Чтобы фреймворки могли писать код, не привязанный к конкретному рантайму, Environment API предлагает три уровня взаимодействия.

### `RunnableDevEnvironment`

`RunnableDevEnvironment` — окружение, в котором можно передавать произвольные значения. Неявное окружение `ssr` и другие не-клиентские по умолчанию в dev используют `RunnableDevEnvironment`. Это требует того же рантайма, что и у сервера Vite, но ведёт себя похоже на `ssrLoadModule` и позволяет фреймворкам мигрировать и включить HMR для SSR в dev. Проверку «runnable»-окружения можно делать функцией `isRunnableDevEnvironment`.

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * URL to execute.
   * Accepts file path, server path, or id relative to the root.
   * Returns an instantiated module (same as in ssrLoadModule)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * Other ModuleRunner methods...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
`runner` создаётся лениво при первом обращении. Имейте в виду: при создании `runner` Vite включает поддержку source map через `process.setSourceMapsEnabled` или подмену `Error.prepareStackTrace`, если первого нет.
:::

Предположим, сервер Vite в [режиме middleware](/guide/ssr#setting-up-the-dev-server), и реализуем SSR-middleware через Environment API. Имя окружения не обязано быть `ssr` — в примере назовём его `server`. Обработку ошибок опускаем.

```js
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // by default, modules are run in the same process as the vite server
    },
  },
})

// You might need to cast this to RunnableDevEnvironment in TypeScript or
// use isRunnableDevEnvironment to guard the access to the runner
const serverEnvironment = viteServer.environments.server

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Read index.html
  const indexHtmlPath = path.resolve(import.meta.dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
  //    and also applies HTML transforms from Vite plugins, e.g. global
  //    preambles from @vitejs/plugin-react
  template = await viteServer.transformIndexHtml(url, template)

  // 3. Load the server entry. import(url) automatically transforms
  //    ESM source code to be usable in Node.js! There is no bundling
  //    required, and provides full HMR support.
  const { render } = await serverEnvironment.runner.import(
    '/src/entry-server.js',
  )

  // 4. render the app HTML. This assumes entry-server.js's exported
  //     `render` function calls appropriate framework SSR APIs,
  //    e.g. ReactDOMServer.renderToString()
  const appHtml = await render(url)

  // 5. Inject the app-rendered HTML into the template.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Send the rendered HTML back.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

Для окружений с HMR (например `RunnableDevEnvironment`) в точке входа сервера стоит добавить `import.meta.hot.accept()` для лучшего поведения. Иначе изменения серверных файлов инвалидируют весь граф модулей сервера:

```js
// src/entry-server.js
export function render(...) { ... }

if (import.meta.hot) {
  import.meta.hot.accept()
}
```

### `FetchableDevEnvironment`

:::info

Мы ждём отзывов по [предложению `FetchableDevEnvironment`](https://github.com/vitejs/vite/discussions/18191).

:::

`FetchableDevEnvironment` — окружение, которое общается с рантаймом через интерфейс [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch). Так как `RunnableDevEnvironment` реализуем не во всех рантаймах, рекомендуем использовать `FetchableDevEnvironment` вместо `RunnableDevEnvironment`.

Окружение даёт единообразный способ обработки запросов методом `handleRequest`:

```ts
import {
  createServer,
  createFetchableDevEnvironment,
  isFetchableDevEnvironment,
} from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    custom: {
      dev: {
        createEnvironment(name, config) {
          return createFetchableDevEnvironment(name, config, {
            handleRequest(request: Request): Promise<Response> | Response {
              // handle Request and return a Response
            },
          })
        },
      },
    },
  },
})

// Any consumer of the environment API can now call `dispatchFetch`
if (isFetchableDevEnvironment(server.environments.custom)) {
  const response: Response = await server.environments.custom.dispatchFetch(
    new Request('http://example.com/request-to-handle'),
  )
}
```

:::warning
Vite проверяет вход и выход `dispatchFetch`: `request` должен быть экземпляром глобального класса `Request`, ответ — глобального `Response`. Иначе будет выброшен `TypeError`.

Хотя `FetchableDevEnvironment` реализован как класс, для команды Vite это деталь реализации и может меняться.
:::

### «Сырой» `DevEnvironment`

Если окружение не реализует `RunnableDevEnvironment` или `FetchableDevEnvironment`, связь нужно настроить вручную.

Если ваш код может работать в том же рантайме, что и пользовательские модули (не зависит от API, специфичных для Node.js), можно использовать виртуальный модуль. Тогда не нужно доставать значения через API Vite из кода.

```ts
// code using the Vite's APIs
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // a plugin that handles `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* plugin implementation */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// use exposed functions by each environment factories that runs the code
// check for each environment factories what they provide
if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('http://example.com/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Например, чтобы вызвать `transformIndexHtml` на пользовательском модуле, можно использовать такой плагин:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

Если нужны API Node.js, можно использовать `hot.send` для связи кода с API Vite и пользовательскими модулями. Учтите: после сборки поведение может отличаться.

```ts
// code using the Vite's APIs
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // a plugin that handles `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* plugin implementation */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// use exposed functions by each environment factories that runs the code
// check for each environment factories what they provide
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('http://example.com/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('http://example.com/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## Окружения при сборке

В CLI вызовы `vite build` и `vite build --ssr` по-прежнему собирают только client и только ssr ради обратной совместимости.

Когда опция `builder` не `undefined` (или при вызове `vite build --app`), `vite build` переключается на сборку всего приложения. В будущем мажоре это станет поведением по умолчанию. Создаётся экземпляр `ViteBuilder` (аналог `ViteDevServer` на этапе сборки), который собирает все настроенные окружения для продакшена. По умолчанию окружения собираются последовательно в порядке записи `environments`. Дополнительно порядок можно задать через `builder.buildApp`:

```js [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      await Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
})
```

Плагины могут объявить хук `buildApp`. Порядки `'pre'` и `null` выполняются до настроенного `builder.buildApp`, порядок `'post'` — после. `environment.isBuilt` показывает, собрано ли окружение уже.

## Код, не зависящий от окружения

Чаще всего текущий экземпляр `environment` будет в контексте выполняемого кода, и обращаться к `server.environments` редко нужно. В хуках плагинов окружение есть в `PluginContext` как `this.environment`. См. [Environment API для плагинов](./api-environment-plugins.md), чтобы строить плагины с учётом окружения.
