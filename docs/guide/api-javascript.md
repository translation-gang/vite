# JavaScript API

API Vite полностью типизированы; удобно использовать TypeScript или проверку типов в VS Code.

## `createServer`

**Сигнатура типа:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Пример:**

```ts twoslash
import { createServer } from 'vite'

const server = await createServer({
  // any valid user config options, plus `mode` and `configFile`
  configFile: false,
  root: import.meta.dirname,
  server: {
    port: 1337,
  },
})
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

::: tip ПРИМЕЧАНИЕ
Если в одном процессе Node вызываются `createServer` и `build`, оба завязаны на `process.env.NODE_ENV` и на опцию `mode`. Чтобы избежать конфликтов, задайте одинаковый `process.env.NODE_ENV` или `mode` в `development`, либо запускайте API в отдельных дочерних процессах.
:::

::: tip ПРИМЕЧАНИЕ
При [режиме middleware](/config/server-options.html#server-middlewaremode) вместе с [прокси для WebSocket](/config/server-options.html#server-proxy) в `middlewareMode` нужно передать родительский HTTP-сервер, чтобы прокси корректно привязался к WebSocket.

<details>
<summary>Пример</summary>

```ts twoslash
import http from 'http'
import { createServer } from 'vite'

const parentServer = http.createServer() // or express, koa, etc.

const vite = await createServer({
  server: {
    // Enable middleware mode
    middlewareMode: {
      // Provide the parent http server for proxy WebSocket
      server: parentServer,
    },
    proxy: {
      '/ws': {
        target: 'ws://localhost:3000',
        // Proxying WebSocket
        ws: true,
      },
    },
  },
})

// @noErrors: 2339
parentServer.use(vite.middlewares)
```

</details>
:::

## `InlineConfig`

Интерфейс `InlineConfig` расширяет `UserConfig`:

- `configFile`: путь к конфигу. Если не задан, Vite ищет файл от корня проекта. `false` — отключить авто-поиск.

## `ResolvedConfig`

Совпадает с `UserConfig`, но поля, как правило, разрешены и не `undefined`. Плюс утилиты:

- `config.assetsInclude`: проверка, считается ли `id` ассетом.
- `config.logger`: внутренний логгер Vite.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * The resolved Vite config object.
   */
  config: ResolvedConfig
  /**
   * A connect app instance
   * - Can be used to attach custom middlewares to the dev server.
   * - Can also be used as the handler function of a custom http server
   *   or as a middleware in any connect-style Node.js frameworks.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Native Node http server instance.
   * Will be null in middleware mode.
   */
  httpServer: http.Server | null
  /**
   * Chokidar watcher instance. If `config.server.watch` is set to `null`,
   * it will not watch any files and calling `add` or `unwatch` will have no effect.
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * WebSocket server with `send(payload)` method.
   */
  ws: WebSocketServer
  /**
   * Rollup plugin container that can run plugin hooks on a given file.
   */
  pluginContainer: PluginContainer
  /**
   * Module graph that tracks the import relationships, url to file mapping
   * and hmr state.
   */
  moduleGraph: ModuleGraph
  /**
   * The resolved urls Vite prints on the CLI (URL-encoded). Returns `null`
   * in middleware mode or if the server is not listening on any port.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Programmatically resolve, load and transform a URL and get the result
   * without going through the http request pipeline.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Apply Vite built-in HTML transforms and any plugin HTML transforms.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * Load a given URL as an instantiated module for SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * Fix ssr error stacktrace.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Triggers HMR for a module in the module graph. You can use the `server.moduleGraph`
   * API to retrieve the module to be reloaded. If `hmr` is false, this is a no-op.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * Start the server.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Restart the server.
   *
   * @param forceOptimize - force the optimizer to re-bundle, same as --force cli flag
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Stop the server.
   */
  close(): Promise<void>
  /**
   * Bind CLI shortcuts
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * Calling `await server.waitForRequestsIdle(id)` will wait until all static imports
   * are processed. If called from a load or transform plugin hook, the id needs to be
   * passed as a parameter to avoid deadlocks. Calling this function after the first
   * static imports section of the module graph has been processed will resolve immediately.
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` — запасной механизм для DX в сценариях, которые плохо укладываются в по-требованию модель dev-сервера. Например, Tailwind при старте может отложить генерацию классов, пока не увиден код приложения, чтобы не мигали стили. В хуке load/transform при HTTP/1 и дефолтном сервере один из шести каналов может блокироваться, пока не обработаны все статические импорты. Оптимизатор зависимостей Vite использует эту функцию, чтобы избежать полной перезагрузки при отсутствующих зависимостях. В будущем стратегия может смениться, например `optimizeDeps.crawlUntilStaticImports: false` по умолчанию ради холодного старта на больших приложениях.
:::

## `build`

**Сигнатура типа:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**Пример:**

```ts twoslash [vite.config.js]
import path from 'node:path'
import { build } from 'vite'

await build({
  root: path.resolve(import.meta.dirname, './project'),
  base: '/foo/',
  build: {
    rollupOptions: {
      // ...
    },
  },
})
```

## `preview`

**Сигнатура типа:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Пример:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // any valid user config options, plus `mode` and `configFile`
  preview: {
    port: 8080,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * The resolved vite config object
   */
  config: ResolvedConfig
  /**
   * A connect app instance.
   * - Can be used to attach custom middlewares to the preview server.
   * - Can also be used as the handler function of a custom http server
   *   or as a middleware in any connect-style Node.js frameworks
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * native Node http server instance
   */
  httpServer: http.Server
  /**
   * The resolved urls Vite prints on the CLI (URL-encoded). Returns `null`
   * if the server is not listening on any port.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Print server urls
   */
  printUrls(): void
  /**
   * Bind CLI shortcuts
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**Сигнатура типа:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

`command` — `serve` в dev и preview, `build` при сборке.

## `mergeConfig`

**Сигнатура типа:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Глубокое слияние двух конфигов Vite. `isRoot` — уровень вложенности (для слияния двух объектов `build` передайте `false`).

::: tip ПРИМЕЧАНИЕ
`mergeConfig` принимает только объектный конфиг. Если конфиг в виде функции — сначала вызовите её.

С `defineConfig` можно объединить функциональный и объектный конфиг:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---cut---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**Сигнатура типа:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**Связано:** [server.fs.allow](/config/server-options.md#server-fs-allow)

Ищет корень workspace, если выполняется одно из условий, иначе возвращает `root`:

- в `package.json` есть поле `workspaces`;
- есть один из файлов:
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Сигнатура типа:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Связано:** [файлы `.env`](./env-and-mode.md#env-files)

Загружает `.env` из `envDir`. По умолчанию — переменные с префиксом `VITE_`, если не задано иное в `prefixes`.

## `normalizePath`

**Сигнатура типа:**

```ts
function normalizePath(id: string): string
```

**Связано:** [Нормализация путей](./api-plugin.md#path-normalization)

Нормализует путь для согласованности между плагинами Vite.

## `transformWithOxc`

**Сигнатура типа:**

```ts
async function transformWithOxc(
  code: string,
  filename: string,
  options?: OxcTransformOptions,
  inMap?: object,
): Promise<Omit<OxcTransformResult, 'errors'> & { warnings: string[] }>
```

Трансформация JS/TS через [Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer). Удобно плагинам, которым нужно совпадение с внутренней трансформацией Vite.

## `transformWithEsbuild`

**Сигнатура типа:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

**Устарело:** используйте `transformWithOxc`.

Трансформация через esbuild для согласованности со старым поведением.

## `loadConfigFromFile`

**Сигнатура типа:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

Ручная загрузка файла конфига Vite через esbuild.

## `preprocessCSS`

- **Экспериментально:** [обратная связь](https://github.com/vitejs/vite/discussions/13815)

**Сигнатура типа:**

```ts
async function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>

interface PreprocessCSSResult {
  code: string
  map?: SourceMapInput
  modules?: Record<string, string>
  deps?: Set<string>
}
```

Препроцессинг `.css`, `.scss`, `.sass`, `.less`, `.styl`, `.stylus` в обычный CSS для браузера или других инструментов. Как и [встроенная поддержка препроцессоров](/guide/features#css-pre-processors), соответствующий препроцессор должен быть установлен.

Тип препроцессора определяется по расширению `filename`. Если имя заканчивается на `.module.{ext}`, считается [CSS module](https://github.com/css-modules/css-modules); в результате будет поле `modules` с маппингом классов.

Препроцессинг не резолвит URL в `url()` и `image-set()`.

## `version`

**Тип:** `string`

Текущая версия Vite (например `"8.0.0"`).

## `rolldownVersion`

**Тип:** `string`

Версия Rolldown в Vite (например `"1.0.0"`). Реэкспорт [`VERSION`](https://rolldown.rs/reference/Variable.VERSION) из `rolldown`.

## `esbuildVersion`

**Тип:** `string`

Оставлено для обратной совместимости.

## `rollupVersion`

**Тип:** `string`

Оставлено для обратной совместимости.
