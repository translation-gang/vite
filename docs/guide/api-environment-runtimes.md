# Environment API для рантаймов

:::info Кандидат на релиз
Environment API в целом находится в фазе кандидата на релиз. Мы будем поддерживать стабильность API между мажорными релизами, чтобы экосистема могла экспериментировать и строить на их основе. Однако имейте в виду, что [некоторые конкретные API](/changes/#considering) всё ещё считаются экспериментальными.

Мы планируем стабилизировать эти новые API (с возможными breaking changes) в будущем мажорном релизе, когда даунстрим-проекты успеют поэкспериментировать с новыми возможностями и проверить их.

Материалы:

- [Обсуждение и обратная связь](https://github.com/vitejs/vite/discussions/16358), где мы собираем отзывы о новых API.
- [PR Environment API](https://github.com/vitejs/vite/pull/16471), где новые API были реализованы и ревьюились.

Поделитесь с нами своей обратной связью.
:::

## Фабрики окружений

Фабрики окружений предназначены для провайдеров окружений (например Cloudflare), а не для конечных пользователей. Фабрика возвращает `EnvironmentOptions` в типичном случае, когда целевой рантайм используется и в dev, и при сборке. Можно задать опции по умолчанию, чтобы пользователю не дублировать конфиг.

```ts
function createWorkerdEnvironment(
  userConfig: EnvironmentOptions,
): EnvironmentOptions {
  return mergeConfig(
    {
      resolve: {
        conditions: [
          /*...*/
        ],
      },
      dev: {
        createEnvironment(name, config) {
          return createWorkerdDevEnvironment(name, config, {
            hot: true,
            transport: customHotChannel(),
          })
        },
      },
      build: {
        createEnvironment(name, config) {
          return createWorkerdBuildEnvironment(name, config)
        },
      },
    },
    userConfig,
  )
}
```

Тогда конфиг можно записать так:

```js
import { createWorkerdEnvironment } from 'vite-environment-workerd'

export default {
  environments: {
    ssr: createWorkerdEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
    rsc: createWorkerdEnvironment({
      build: {
        outDir: '/dist/rsc',
      },
    }),
  },
}
```

а фреймворки могут использовать окружение с рантаймом workerd для SSR так:

```js
const ssrEnvironment = server.environments.ssr
```

## Создание новой фабрики окружения

Dev-сервер Vite по умолчанию открывает два окружения: `client` и `ssr`. Клиент по умолчанию — браузер, module runner подключается через виртуальный модуль `/@vite/client` в клиентских приложениях. SSR по умолчанию в том же Node, что и сервер Vite, и позволяет в dev рендерить запросы с полной поддержкой HMR.

Трансформированный исходный код — модуль; связи между обработанными модулями в каждом окружении хранятся в графе модулей. Трансформированный код отправляется в рантаймы, связанные с окружениями, для выполнения. При вычислении модуля в рантайме его импорты запрашиваются, что запускает обработку части графа.

Vite Module Runner позволяет выполнять любой код после обработки плагинами Vite. В отличие от `server.ssrLoadModule` реализация runner отделена от сервера. Авторам библиотек и фреймворков так проще построить свой слой связи между сервером Vite и runner. Браузер общается с окружением по WebSocket и HTTP. Node Module Runner может напрямую вызывать функции обработки модулей в том же процессе. Другие окружения могут выполнять модули, подключаясь к JS-рантайму вроде workerd или Worker Thread, как в Vitest.

```dot
digraph module_runner {
  rankdir=LR
  node [shape=box style="rounded,filled" fontname="Arial" fontsize=11 margin="0.2,0.1" fontcolor="${#3c3c43|#ffffff}" color="${#c2c2c4|#3c3f44}"]
  edge [color="${#67676c|#98989f}" fontname="Arial" fontsize=10 fontcolor="${#67676c|#98989f}"]
  bgcolor="transparent"
  compound=true

  subgraph cluster_server {
    label="Vite Dev Server (Node.js)" labeljust=l fontname="Arial" fontsize=12
    style="rounded,filled" fillcolor="${#f6f6f7|#1a1a1f}" color="${#c2c2c4|#3c3f44}"
    fontcolor="${#3c3c43|#ffffff}"

    subgraph cluster_env {
      label="DevEnvironment" labeljust=l fontname="Arial" fontsize=11
      style="rounded,filled" fillcolor="${#f2ecfc|#2c273e}" color="${#c2c2c4|#3c3f44}"
      fontcolor="${#3c3c43|#ffffff}"

      plugins [label="Plugin\nPipeline" fillcolor="${#e9eaff|#222541}"]
      mg [label="Module\nGraph" fillcolor="${#e9eaff|#222541}"]
      hot [label="HotChannel" fillcolor="${#fcf4dc|#38301a}"]

      plugins -> mg [dir=both]
      mg -> hot [style=invis]
    }
  }

  subgraph cluster_runtime {
    label="Target Runtime" labeljust=l fontname="Arial" fontsize=12
    style="rounded,filled" fillcolor="${#f0fdf4|#131b15}" color="${#c2c2c4|#3c3f44}"
    fontcolor="${#3c3c43|#ffffff}"

    subgraph cluster_runner {
      label="ModuleRunner" labeljust=l fontname="Arial" fontsize=11
      style="rounded,filled" fillcolor="${#def5ed|#15312d}" color="${#c2c2c4|#3c3f44}"
      fontcolor="${#3c3c43|#ffffff}"

      evaluator [label="Module\nEvaluator" fillcolor="${#def5ed|#15312d}"]
      transport [label="Transport" fillcolor="${#fcf4dc|#38301a}"]
    }
  }

  hot -> transport [label="HMR / Module\nfetch & invoke" dir=both style=bold color="${#6f42c1|#c8abfa}"]
}
```

Одна из целей — дать настраиваемый API для обработки и запуска кода. Пользователи могут создавать новые фабрики окружений на открытых примитивах.

```ts
import { DevEnvironment, HotChannel } from 'vite'

function createWorkerdDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context: DevEnvironmentContext
) {
  const connection = /* ... */
  const transport: HotChannel = {
    on: (listener) => { connection.on('message', listener) },
    send: (data) => connection.send(data),
  }

  const workerdDevEnvironment = new DevEnvironment(name, config, {
    options: {
      resolve: { conditions: ['custom'] },
      ...context.options,
    },
    hot: true,
    transport,
  })
  return workerdDevEnvironment
}
```

Описаны [несколько уровней взаимодействия для `DevEnvironment`](/guide/api-environment-frameworks#devenvironment-communication-levels). Чтобы фреймворкам проще писать код, не привязанный к рантайму, рекомендуем реализовать максимально гибкий уровень связи.

## `ModuleRunner`

Module runner создаётся в целевом рантайме. Все API в следующем разделе импортируются из `vite/module-runner`, если не сказано иначе. Точка входа сделана максимально лёгкой: экспортируется минимум, нужный для создания runner.

**Сигнатура типа:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * URL to execute.
   * Accepts file path, server path, or id relative to the root.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * Clear all caches including HMR listeners.
   */
  public clearCache(): void
  /**
   * Clear all caches, remove all HMR listeners, reset sourcemap support.
   * This method doesn't stop the HMR connection.
   */
  public async close(): Promise<void>
  /**
   * Returns `true` if the runner has been closed by calling `close()`.
   */
  public isClosed(): boolean
}
```

`ModuleEvaluator` внутри `ModuleRunner` отвечает за выполнение кода. Vite поставляет `ESModulesEvaluator`: он использует `new AsyncFunction` для вычисления кода. Можно подставить свою реализацию, если в вашем JS-рантайме нельзя безопасно выполнять такой код.

У module runner есть метод `import`. Когда сервер Vite шлёт HMR-событие `full-reload`, все затронутые модули выполняются заново. Имейте в виду: Module Runner при этом не обновляет объект `exports` (он его перезаписывает) — если нужны актуальные экспорты, снова вызовите `import` или возьмите модуль из `evaluatedModules`.

**Пример:**

```js
import {
  ModuleRunner,
  ESModulesEvaluator,
  createNodeImportMeta,
} from 'vite/module-runner'
import { transport } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    transport,
    createImportMeta: createNodeImportMeta, // if the module runner runs in Node.js
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

## `ModuleRunnerOptions`

```ts twoslash
import type {
  InterceptorOptions as InterceptorOptionsRaw,
  ModuleRunnerHmr as ModuleRunnerHmrRaw,
  EvaluatedModules,
} from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type InterceptorOptions = Debug<InterceptorOptionsRaw>
type ModuleRunnerHmr = Debug<ModuleRunnerHmrRaw>
/** see below */
type ModuleRunnerTransport = unknown

// ---cut---
interface ModuleRunnerOptions {
  /**
   * A set of methods to communicate with the server.
   */
  transport: ModuleRunnerTransport
  /**
   * Configure how source maps are resolved.
   * Prefers `node` if `process.setSourceMapsEnabled` is available.
   * Otherwise it will use `prepareStackTrace` by default which overrides
   * `Error.prepareStackTrace` method.
   * You can provide an object to configure how file contents and
   * source maps are resolved for files that were not processed by Vite.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * Disable HMR or configure HMR options.
   *
   * @default true
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * Custom module cache. If not provided, it creates a separate module
   * cache for each module runner instance.
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**Сигнатура типа:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

// ---cut---
export interface ModuleEvaluator {
  /**
   * Number of prefixed lines in the transformed code.
   */
  startOffset?: number
  /**
   * Evaluate code that was transformed by Vite.
   * @param context Function context
   * @param code Transformed code
   * @param id ID that was used to fetch the module
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * evaluate externalized module.
   * @param file File URL to the external module
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite экспортирует `ESModulesEvaluator`, реализующий этот интерфейс по умолчанию. Он использует `new AsyncFunction`; если во встроенном source map есть смещение, нужен [offset в 2 строки](https://tc39.es/ecma262/#sec-createdynamicfunction) под добавленные переносы. `ESModulesEvaluator` делает это автоматически. Пользовательские evaluators дополнительные строки не добавляют.

## `ModuleRunnerTransport`

**Сигнатура типа:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** an object */
type HotPayload = unknown
// ---cut---
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

Транспорт общается с окружением через RPC или прямые вызовы функций. Если `invoke` не реализован, нужны `send` и `connect`. Vite соберёт `invoke` внутри.

Его нужно согласовать с экземпляром `HotChannel` на сервере, как в примере, где module runner создаётся в worker thread:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import {
  ESModulesEvaluator,
  ModuleRunner,
  createNodeImportMeta,
} from 'vite/module-runner'

/** @type {import('vite/module-runner').ModuleRunnerTransport} */
const transport = {
  connect({ onMessage, onDisconnection }) {
    parentPort.on('message', onMessage)
    parentPort.on('close', onDisconnection)
  },
  send(data) {
    parentPort.postMessage(data)
  },
}

const runner = new ModuleRunner(
  {
    transport,
    createImportMeta: createNodeImportMeta,
  },
  new ESModulesEvaluator(),
)
```

```js [server.js]
import { BroadcastChannel } from 'node:worker_threads'
import { createServer, RemoteEnvironmentTransport, DevEnvironment } from 'vite'

function createWorkerEnvironment(name, config, context) {
  const worker = new Worker('./worker.js')
  const handlerToWorkerListener = new WeakMap()
  const client = {
    send(payload: HotPayload) {
      worker.postMessage(payload)
    },
  }

  const workerHotChannel = {
    send: (data) => worker.postMessage(data),
    on: (event, handler) => {
      // client is already connected
      if (event === 'vite:client:connect') return
      if (event === 'vite:client:disconnect') {
        const listener = () => {
          handler(undefined, client)
        }
        handlerToWorkerListener.set(handler, listener)
        worker.on('exit', listener)
        return
      }

      const listener = (value) => {
        if (value.type === 'custom' && value.event === event) {
          handler(value.data, client)
        }
      }
      handlerToWorkerListener.set(handler, listener)
      worker.on('message', listener)
    },
    off: (event, handler) => {
      if (event === 'vite:client:connect') return
      if (event === 'vite:client:disconnect') {
        const listener = handlerToWorkerListener.get(handler)
        if (listener) {
          worker.off('exit', listener)
          handlerToWorkerListener.delete(handler)
        }
        return
      }

      const listener = handlerToWorkerListener.get(handler)
      if (listener) {
        worker.off('message', listener)
        handlerToWorkerListener.delete(handler)
      }
    },
  }

  return new DevEnvironment(name, config, {
    transport: workerHotChannel,
  })
}

await createServer({
  environments: {
    worker: {
      dev: {
        createEnvironment: createWorkerEnvironment,
      },
    },
  },
})
```

:::

Реализуйте события `vite:client:connect` / `vite:client:disconnect` в методах `on` / `off`, если они есть. `vite:client:connect` нужно эмитить при установлении соединения, `vite:client:disconnect` — при закрытии. Объект `HotChannelClient`, передаваемый в обработчик, должен быть одной и той же ссылкой для одного соединения.

Другой пример — HTTP между runner и сервером:

```ts
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

export const runner = new ModuleRunner(
  {
    transport: {
      async invoke(data) {
        const response = await fetch(`http://my-vite-server/invoke`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return response.json()
      },
    },
    hmr: false, // disable HMR as HMR requires transport.connect
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

В этом случае можно использовать метод `handleInvoke` в `NormalizedHotChannel`:

```ts
const customEnvironment = new DevEnvironment(name, config, context)

server.onRequest((request: Request) => {
  const url = new URL(request.url)
  if (url.pathname === '/invoke') {
    const payload = (await request.json()) as HotPayload
    const result = customEnvironment.hot.handleInvoke(payload)
    return new Response(JSON.stringify(result))
  }
  return Response.error()
})
```

Для HMR нужны `send` и `connect`. `send` обычно вызывается при пользовательском событии (например `import.meta.hot.send("my-event")`).

Vite экспортирует `createServerHotChannel` из основной точки входа для поддержки HMR при Vite SSR.
