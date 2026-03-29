# Опции dev-сервера

Если не указано иное, опции этого раздела применяются только к dev.

## server.host

- **Тип:** `string | boolean`
- **По умолчанию:** `'localhost'`

IP-адреса, на которых слушает сервер.
`0.0.0.0` или `true` — все интерфейсы, включая LAN и публичные.

В CLI: `--host 0.0.0.0` или `--host`.

::: tip ПРИМЕЧАНИЕ

Иногда отвечают другие серверы, а не Vite.

Если используется `localhost`: в Node.js до v17 порядок DNS-адресов по умолчанию переупорядочивается. Браузер может резолвить `localhost` иначе, чем адрес, на котором слушает Vite. Vite выводит резолв, если он отличается.

Можно вызвать [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order), чтобы отключить переупорядочивание; тогда Vite покажет адрес как `localhost`.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // omit
})
```

Второй случай — wildcard-хосты (например `0.0.0.0`): серверы на конкретных хостах имеют приоритет над wildcard.

:::

::: tip Доступ к серверу в WSL2 из LAN

Одного `host: true` для доступа из LAN недостаточно.
См. [документацию WSL](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan).

:::

## server.allowedHosts

- **Тип:** `string[] | true`
- **По умолчанию:** `[]`

Имена хостов, на которые Vite может отвечать.
По умолчанию разрешены `localhost`, домены под `.localhost` и все IP. При HTTPS проверка пропускается.

Строка с префиксом `.` разрешает хост без точки и все поддомены: `.example.com` — `example.com`, `foo.example.com`, `foo.bar.example.com`. `true` — ответ на любой Host.

::: details Какие хосты безопасно добавлять?

Безопасно добавлять хосты, за DNS которых вы отвечаете.

Например, если домен `vite.dev` ваш, можно добавить `vite.dev` и `.vite.dev`. Чужой домен без доверия к владельцу добавлять не стоит.

Никогда не добавляйте TLD вроде `.com` — кто угодно может купить `example.com` и управлять IP.

:::

::: danger

`server.allowedHosts: true` позволяет любому сайту слать запросы к dev-серверу через DNS rebinding и выкачивать исходники. Используйте явный список хостов. Подробнее: [GHSA-vg6x-rcgg-rjx6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6).

:::

::: details Через переменную окружения
Переменная `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` добавляет ещё один разрешённый хост.
:::

## server.port

- **Тип:** `number`
- **По умолчанию:** `5173`

Порт сервера. Если занят, Vite попробует следующий — фактический порт может отличаться.

## server.strictPort

- **Тип:** `boolean`

`true` — завершить процесс, если порт занят, без перебора.

## server.https

- **Тип:** `https.ServerOptions`

TLS + HTTP/2. Значение — [объект опций](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) для `https.createServer()`.

Нужен валидный сертификат. Для простого случая — [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) создаст и закэширует self-signed. Рекомендуется свой сертификат.

## server.open

- **Тип:** `boolean | string`

Открыть приложение в браузере при старте. Строка — pathname URL. Браузер: `process.env.BROWSER` (например `firefox`). Аргументы: `process.env.BROWSER_ARGS` (например `--incognito`).

`BROWSER` и `BROWSER_ARGS` можно задать в `.env`. См. [пакет `open`](https://github.com/sindresorhus/open#app).

**Пример:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **Тип:** `Record<string, string | ProxyOptions>`

Правила прокси для dev-сервера. Объект `{ ключ: опции }`: запросы, чей путь начинается с ключа, проксируются на target. Ключ с `^` — `RegExp`. `configure` даёт доступ к экземпляру прокси. При совпадении с правилом запрос не проходит трансформацию Vite.

При неотносительном [`base`](/config/shared-options.md#base) префиксируйте ключи значением `base`.

Расширяет [`http-proxy-3`](https://github.com/sagemathinc/http-proxy-3#options). Доп. опции [здесь](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13).

Для кастомизации внутреннего dev-сервера (например middleware в [connect](https://github.com/senchalabs/connect)) пишите [плагин](/guide/using-plugins.html) с [configureServer](/guide/api-plugin.html#configureserver).

**Пример:**

```js
export default defineConfig({
  server: {
    proxy: {
      // string shorthand:
      // http://localhost:5173/foo
      //   -> http://localhost:4567/foo
      '/foo': 'http://localhost:4567',
      // with options:
      // http://localhost:5173/api/bar
      //   -> http://jsonplaceholder.typicode.com/bar
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // with RegExp:
      // http://localhost:5173/fallback/
      //   -> http://jsonplaceholder.typicode.com/
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Using the proxy instance
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy will be an instance of 'http-proxy'
        },
      },
      // Proxying websockets or socket.io:
      // ws://localhost:5173/socket.io
      //   -> ws://localhost:5174/socket.io
      // Exercise caution using `rewriteWsOrigin` as it can leave the
      // proxying open to CSRF attacks.
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **Тип:** `boolean | CorsOptions`
- **По умолчанию:** `{ origin: /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/ }` (localhost, `127.0.0.1` и `::1`)

CORS для dev-сервера. Объект опций — [как в cors](https://github.com/expressjs/cors#configuration-options); `true` — любой origin.

::: danger

`server.cors: true` позволяет любому сайту обращаться к dev-серверу и скачивать код. Лучше явный список origins.

:::

## server.headers

- **Тип:** `OutgoingHttpHeaders`

Заголовки ответа сервера.

## server.hmr

- **Тип:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

Отключить или настроить соединение HMR (если WebSocket HMR должен отличаться от HTTP).

`server.hmr.overlay: false` — отключить оверлей ошибок.

`protocol` — `ws` или `wss`.

`clientPort` — переопределить порт только на клиенте, если WebSocket слушает другой порт.

При `server.hmr.server` запросы HMR обрабатывает указанный сервер. Иначе Vite использует текущий сервер. Удобно при self-signed или одном порту наружу.

Примеры: [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue).

::: tip ПРИМЕЧАНИЕ

По умолчанию обратный прокси должен проксировать WebSocket. Если клиент HMR не подключается, идёт прямое подключение к серверу HMR, минуя прокси:

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

Сообщение в браузере при fallback можно игнорировать. Чтобы обойти прокси заранее:

- настройте прокси на WebSocket;
- [`server.strictPort = true`](#server-strictport) и `server.hmr.clientPort` = `server.port`;
- `server.hmr.port` отличный от [`server.port`](#server-port)

:::

## server.forwardConsole

- **Тип:** `boolean | { unhandledErrors?: boolean, logLevels?: ('error' | 'warn' | 'info' | 'log' | 'debug')[] }`
- **По умолчанию:** авто (`true`, если обнаружен AI-агент по [`@vercel/detect-agent`](https://www.npmjs.com/package/@vercel/detect-agent), иначе `false`)

Проброс событий консоли браузера в терминал Vite в dev.

- `true` — необработанные ошибки и `console.error` / `console.warn`;
- `unhandledErrors` — необработанные исключения и отклонённые промисы;
- `logLevels` — какие `console.*` пробрасывать.

Пример:

```js
export default defineConfig({
  server: {
    forwardConsole: {
      unhandledErrors: true,
      logLevels: ['warn', 'error'],
    },
  },
})
```

При пробросе необработанных ошибок в терминале расширенное форматирование, например:

```log
1:18:38 AM [vite] (client) [Unhandled error] Error: this is test error
 > testError src/main.ts:20:8
     18|
     19| function testError() {
     20|   throw new Error('this is test error')
       |        ^
     21| }
     22|
 > HTMLButtonElement.<anonymous> src/main.ts:6:2
```

## server.warmup

- **Тип:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **См. также:** [Прогрев часто используемых файлов](/guide/performance.html#warm-up-frequently-used-files)

Предварительная трансформация и кэш. Ускоряет первую загрузку и снижает каскады трансформаций.

`clientFiles` — только клиент; `ssrFiles` — только SSR. Массив путей или шаблонов [`tinyglobby`](https://superchupu.dev/tinyglobby/comparison) относительно `root`.

Добавляйте только часто используемые файлы, чтобы не перегружать старт сервера.

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **Тип:** `object | null`

Опции наблюдателя ФС для [chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api).

Watcher следит за `root`, пропуская `.git/`, `node_modules/`, `test-results/`, `cacheDir` и `build.outDir`. При изменении файла — HMR при необходимости.

`null` — файлы не отслеживаются; [`server.watcher`](/guide/api-javascript.html#vitedevserver) остаётся совместимым эмиттером, `add`/`unwatch` бесполезны.

::: warning Файлы в `node_modules`

Слежение за пакетами в `node_modules` пока недоступно: [issue #8619](https://github.com/vitejs/vite/issues/8619).

:::

::: warning Vite в WSL2

Если файл правится приложением Windows (не WSL2), слежение не срабатывает — [ограничение WSL2](https://github.com/microsoft/WSL/issues/4739). То же при Docker на WSL2.

Варианты:

- **Рекомендуется:** редактировать из WSL2; проект лучше не на файловой системе Windows — быстрее.
- `{ usePolling: true }` — [высокая загрузка CPU](https://github.com/paulmillr/chokidar/tree/3.6.0#performance).

:::

## server.middlewareMode

- **Тип:** `boolean`
- **По умолчанию:** `false`

Режим middleware для Vite.

- **См. также:** [appType](./shared-options#apptype), [SSR — dev-сервер](/guide/ssr#setting-up-the-dev-server)

- **Пример:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // don't include Vite's default HTML handling middlewares
    appType: 'custom',
  })
  // Use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Since `appType` is `'custom'`, should serve response here.
    // Note: if `appType` is `'spa'` or `'mpa'`, Vite includes middlewares
    // to handle HTML requests and 404s so user middlewares should be added
    // before Vite's middlewares to take effect instead
  })
}

createServer()
```

## server.fs.strict

- **Тип:** `boolean`
- **По умолчанию:** `true` (с Vite 2.7)

Запрет отдачи файлов вне корня workspace.

## server.fs.allow

- **Тип:** `string[]`

Каталоги/файлы, доступные через `/@fs/`. При `server.fs.strict: true` доступ к файлам вне списка без импорта из разрешённого — 403.

Можно указывать и каталоги, и файлы.

Vite ищет корень workspace и использует его по умолчанию. Workspace: `workspaces` в `package.json` или `lerna.json` / `pnpm-workspace.yaml`; иначе [корень проекта](/guide/#index-html-and-project-root).

Путь — абсолютный или относительно [корня проекта](/guide/#index-html-and-project-root). Пример:

```js
export default defineConfig({
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
})
```

При явном `server.fs.allow` автоопределение workspace отключается. Для расширения используйте `searchForWorkspaceRoot`:

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // search up for workspace root
        searchForWorkspaceRoot(process.cwd()),
        // your custom rules
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **Тип:** `string[]`
- **По умолчанию:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Чёрный список чувствительных файлов для dev-сервера. Приоритет выше, чем у [`server.fs.allow`](#server-fs-allow). Поддерживаются [шаблоны picomatch](https://github.com/micromatch/picomatch#globbing-features).

::: tip ПРИМЕЧАНИЕ

Не действует на [каталог public](/guide/assets.md#the-public-directory) — файлы там отдаются без фильтрации, при build копируются как есть.

:::

## server.origin

- **Тип:** `string`

Origin для URL сгенерированных ассетов в dev.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **Тип:** `false | (sourcePath: string, sourcemapPath: string) => boolean`
- **По умолчанию:** `(sourcePath) => sourcePath.includes('node_modules')`

Игнорировать ли исходники в server source map для расширения [`x_google_ignoreList`](https://developer.chrome.com/articles/x-google-ignore-list/).

Аналог [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) для dev. У Rollup `sourcePath` относительный, у `server.sourcemapIgnoreList` — абсолютный; в dev чаще удобнее абсолютный путь.

По умолчанию исключаются пути с `node_modules`. `false` отключает; или своя функция.

```js
export default defineConfig({
  server: {
    // This is the default value, and will add all files with node_modules
    // in their paths to the ignore list.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Примечание
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) и [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) задаются отдельно. Значение по умолчанию для сервера не берётся из Rollup.
:::
