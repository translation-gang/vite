# Использование экземпляров `Environment`

:::info Кандидат на релиз
Environment API в целом находится в фазе кандидата на релиз. Мы будем поддерживать стабильность API между мажорными релизами, чтобы экосистема могла экспериментировать и строить на их основе. Однако имейте в виду, что [некоторые конкретные API](/changes/#considering) всё ещё считаются экспериментальными.

Мы планируем стабилизировать эти новые API (с возможными breaking changes) в будущем мажорном релизе, когда даунстрим-проекты успеют поэкспериментировать с новыми возможностями и проверить их.

Материалы:

- [Обсуждение и обратная связь](https://github.com/vitejs/vite/discussions/16358), где мы собираем отзывы о новых API.
- [PR Environment API](https://github.com/vitejs/vite/pull/16471), где новые API были реализованы и ревьюились.

Поделитесь с нами своей обратной связью.
:::

## Доступ к окружениям

В режиме разработки доступные окружения dev-сервера можно получить через `server.environments`:

```js
// create the server, or get it from the configureServer hook
const server = await createServer(/* options */)

const clientEnvironment = server.environments.client
clientEnvironment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

Текущее окружение также доступно из плагинов. Подробнее — в [Environment API для плагинов](./api-environment-plugins.md#accessing-the-current-environment-in-hooks).

## Класс `DevEnvironment`

В dev каждое окружение — экземпляр класса `DevEnvironment`:

```ts
class DevEnvironment {
  /**
   * Unique identifier for the environment in a Vite server.
   * By default Vite exposes 'client' and 'ssr' environments.
   */
  name: string
  /**
   * Communication channel to send and receive messages from the
   * associated module runner in the target runtime.
   */
  hot: NormalizedHotChannel
  /**
   * Graph of module nodes, with the imported relationship between
   * processed modules and the cached result of the processed code.
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * Resolved plugins for this environment, including the ones
   * created using the per-environment `create` hook
   */
  plugins: Plugin[]
  /**
   * Allows to resolve, load, and transform code through the
   * environment plugins pipeline
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * Resolved config options for this environment. Options at the server
   * global scope are taken as defaults for all environments, and can
   * be overridden (resolve conditions, external, optimizedDeps)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * Resolve the URL to an id, load it, and process the code using the
   * plugins pipeline. The module graph is also updated.
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * Register a request to be processed with low priority. This is useful
   * to avoid waterfalls. The Vite server has information about the
   * imported modules by other requests, so it can warmup the module graph
   * so the modules are already processed when they are requested.
   */
  async warmupRequest(url: string): Promise<void>
}
```

`DevEnvironmentContext` имеет вид:

```ts
interface DevEnvironmentContext {
  hot: boolean
  transport?: HotChannel | WebSocketServer
  options?: EnvironmentOptions
  remoteRunner?: {
    inlineSourceMap?: boolean
  }
  depsOptimizer?: DepsOptimizer
}
```

а `TransformResult`:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Экземпляр окружения на сервере Vite позволяет обработать URL методом `environment.transformRequest(url)`. Функция прогоняет пайплайн плагинов: резолвит `url` в `id` модуля, загружает его (читает файл с диска или через плагин виртуального модуля) и трансформирует код. При трансформации импорты и прочие метаданные записываются в граф модулей окружения через создание или обновление узла модуля. По завершении результат трансформации также сохраняется в модуле.

:::info Именование transformRequest
В текущей версии предложения мы используем `transformRequest(url)` и `warmupRequest(url)`, чтобы пользователям, привыкшим к текущему API Vite, было проще обсуждать и понимать. Перед релизом можно пересмотреть и эти имена. Например, вариант `environment.processModule(url)` или `environment.loadModule(url)` по аналогии с `context.load(id)` в хуках плагинов Rollup. Пока считаем, что лучше сохранить текущие имена и отложить это обсуждение.
:::

## Раздельные графы модулей

У каждого окружения изолированный граф модулей. У всех графов одинаковая сигнатура, поэтому можно писать обобщённые алгоритмы обхода или запросов к графу без привязки к окружению. Хороший пример — `hotUpdate`. При изменении файла для каждого окружения используется свой граф модулей, чтобы найти затронутые модули и выполнить HMR независимо.

::: info
В Vite v5 был смешанный граф модулей Client и SSR. По необработанному или инвалидированному узлу нельзя было понять, относится ли он к Client, SSR или к обоим. У узлов модулей были префиксные свойства вроде `clientImportedModules` и `ssrImportedModules` (и `importedModules` — объединение). `importers` содержал все импортеры из Client и SSR для каждого узла. У узла также были `transformResult` и `ssrTransformResult`. Слой обратной совместимости позволяет экосистеме мигрировать с устаревшего `server.moduleGraph`.
:::

Каждый модуль представлен экземпляром `EnvironmentModuleNode`. Модуль может быть в графе до обработки (тогда `transformResult` будет `null`). `importers` и `importedModules` обновляются после обработки модуля.

```ts
class EnvironmentModuleNode {
  environment: string

  url: string
  id: string | null = null
  file: string | null = null

  type: 'js' | 'css'

  importers = new Set<EnvironmentModuleNode>()
  importedModules = new Set<EnvironmentModuleNode>()
  importedBindings: Map<string, Set<string>> | null = null

  info?: ModuleInfo
  meta?: Record<string, any>
  transformResult: TransformResult | null = null

  acceptedHmrDeps = new Set<EnvironmentModuleNode>()
  acceptedHmrExports: Set<string> | null = null
  isSelfAccepting?: boolean
  lastHMRTimestamp = 0
  lastInvalidationTimestamp = 0
}
```

`environment.moduleGraph` — экземпляр `EnvironmentModuleGraph`:

```ts
export class EnvironmentModuleGraph {
  environment: string

  urlToModuleMap = new Map<string, EnvironmentModuleNode>()
  idToModuleMap = new Map<string, EnvironmentModuleNode>()
  etagToModuleMap = new Map<string, EnvironmentModuleNode>()
  fileToModulesMap = new Map<string, Set<EnvironmentModuleNode>>()

  constructor(
    environment: string,
    resolveId: (url: string) => Promise<PartialResolvedId | null>,
  )

  async getModuleByUrl(
    rawUrl: string,
  ): Promise<EnvironmentModuleNode | undefined>

  getModuleById(id: string): EnvironmentModuleNode | undefined

  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined

  onFileChange(file: string): void

  onFileDelete(file: string): void

  invalidateModule(
    mod: EnvironmentModuleNode,
    seen: Set<EnvironmentModuleNode> = new Set(),
    timestamp: number = monotonicDateNow(),
    isHmr: boolean = false,
  ): void

  invalidateAll(): void

  async ensureEntryFromUrl(
    rawUrl: string,
    setIsSelfAccepting = true,
  ): Promise<EnvironmentModuleNode>

  createFileOnlyEntry(file: string): EnvironmentModuleNode

  async resolveUrl(url: string): Promise<ResolvedUrl>

  updateModuleTransformResult(
    mod: EnvironmentModuleNode,
    result: TransformResult | null,
  ): void

  getModuleByEtag(etag: string): EnvironmentModuleNode | undefined
}
```
