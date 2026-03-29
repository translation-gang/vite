# Environment API для плагинов

:::info Кандидат на релиз
Environment API в целом находится в фазе кандидата на релиз. Мы будем поддерживать стабильность API между мажорными релизами, чтобы экосистема могла экспериментировать и строить на их основе. Однако имейте в виду, что [некоторые конкретные API](/changes/#considering) всё ещё считаются экспериментальными.

Мы планируем стабилизировать эти новые API (с возможными breaking changes) в будущем мажорном релизе, когда даунстрим-проекты успеют поэкспериментировать с новыми возможностями и проверить их.

Материалы:

- [Обсуждение и обратная связь](https://github.com/vitejs/vite/discussions/16358), где мы собираем отзывы о новых API.
- [PR Environment API](https://github.com/vitejs/vite/pull/16471), где новые API были реализованы и ревьюились.

Поделитесь с нами своей обратной связью.
:::

## Доступ к текущему окружению в хуках

До Vite 6 было только два окружения (`client` и `ssr`), поэтому булево `ssr` хватало, чтобы определить текущее окружение в API Vite. В хуки плагинов в последний параметр опций передавалось `ssr`, а ряд API ожидал необязательный последний параметр `ssr`, чтобы связать модули с нужным окружением (например `server.moduleGraph.getModuleByUrl(url, { ssr })`).

С появлением настраиваемых окружений появился единый способ получать их опции и экземпляр в плагинах. В контексте хуков плагинов доступно `this.environment`, а API, ранее принимавшие `ssr`, теперь привязаны к конкретному окружению (например `environment.moduleGraph.getModuleByUrl(url)`).

У сервера Vite общий пайплайн плагинов, но обработка модуля всегда выполняется в контексте конкретного окружения. Экземпляр `environment` есть в контексте плагина.

Плагин может использовать `environment`, чтобы менять обработку модуля в зависимости от конфигурации окружения (доступна через `environment.config`).

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## Регистрация новых окружений через хуки

Плагины могут добавлять окружения в хуке `config`. Например, [поддержка RSC](/plugins/#vitejs-plugin-rsc) использует дополнительное окружение с отдельным графом модулей и условием `react-server`:

```ts
  config(config: UserConfig) {
    return {
      environments: {
        rsc: {
          resolve: {
            conditions: ['react-server', ...defaultServerConditions],
          },
        },
      },
    }
  }
```

Для регистрации окружения достаточно пустого объекта — подтянутся значения по умолчанию из конфига окружения корневого уровня.

## Настройка окружения через хуки

Пока выполняется хук `config`, полный список окружений ещё не известен: окружения могут задаваться умолчанием с корневого уровня или явно в записи `config.environments`.
Плагины должны задавать значения по умолчанию в хуке `config`. Для настройки каждого окружения используйте новый хук `configEnvironment`. Он вызывается для каждого окружения с частично резолвнутым конфигом, включая финальные значения по умолчанию.

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    // add "workerd" condition to the rsc environment
    if (name === 'rsc') {
      return {
        resolve: {
          conditions: ['workerd'],
        },
      }
    }
  }
```

## Хук `hotUpdate`

- **Тип:** `(this: { environment: DevEnvironment }, options: HotUpdateOptions) => Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>`
- **Вид:** `async`, `sequential`
- **См. также:** [HMR API](./api-hmr)

Хук `hotUpdate` позволяет плагинам реализовать собственную обработку HMR для конкретного окружения. При изменении файла алгоритм HMR выполняется для каждого окружения последовательно в порядке `server.environments`, поэтому `hotUpdate` может вызываться несколько раз. Хук получает объект контекста со следующей сигнатурой:

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

- `this.environment` — окружение выполнения модуля, в котором сейчас обрабатывается обновление файла.

- `modules` — массив модулей этого окружения, затронутых изменённым файлом. Это массив, потому что один файл может соответствовать нескольким отдаваемым модулям (например Vue SFC).

- `read` — асинхронная функция чтения, возвращающая содержимое файла. Она нужна потому, что на некоторых системах колбэк изменения файла срабатывает слишком рано, до того как редактор закончит запись, и прямой `fs.readFile` вернёт пустое содержимое. Переданная функция нормализует это поведение.

Хук может:

- Отфильтровать и сузить список затронутых модулей для более точного HMR.

- Вернуть пустой массив и выполнить полную перезагрузку:

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // Invalidate modules manually
    const invalidatedModules = new Set()
    for (const mod of modules) {
      this.environment.moduleGraph.invalidateModule(
        mod,
        invalidatedModules,
        timestamp,
        true
      )
    }
    this.environment.hot.send({ type: 'full-reload' })
    return []
  }
  ```

- Вернуть пустой массив и полностью самостоятельно обработать HMR, отправив на клиент свои события:

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  Код приложения должен зарегистрировать обработчик через [HMR API](./api-hmr) (его может внедрить тот же плагин в хуке `transform`):

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // perform custom update
    })
  }
  ```

## Состояние плагина на уровне окружения

Один и тот же экземпляр плагина используется для разных окружений, поэтому состояние нужно ключировать через `this.environment`. Это тот же приём, что уже использовался в экосистеме для состояния модулей с ключом `ssr`, чтобы не смешивать client и ssr. Можно использовать `Map<Environment, State>` для отдельного состояния по окружениям. Для обратной совместимости `buildStart` и `buildEnd` без флага `perEnvironmentStartEndDuringDev: true` вызываются только для окружения client. То же для `watchChange` и флага `perEnvironmentWatchChangeDuringDev: true`.

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    },
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

## Плагины на уровне окружения {#per-environment-plugins}

Плагин может указать, к каким окружениям он применяется, функцией `applyToEnvironment`.

```js
const UnoCssPlugin = () => {
  // shared global state
  return {
    buildStart() {
      // init per-environment state with WeakMap<Environment,Data>
      // using this.environment
    },
    configureServer() {
      // use global hooks normally
    },
    applyToEnvironment(environment) {
      // return true if this plugin should be active in this environment,
      // or return a new plugin to replace it.
      // if the hook is not used, the plugin is active in all environments
    },
    resolveId(id, importer) {
      // only called for environments this plugin apply to
    },
  }
}
```

Если плагин не учитывает окружения и хранит состояние без привязки к текущему окружению, хук `applyToEnvironment` позволяет легко сделать его per-environment.

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Vite экспортирует хелпер `perEnvironmentPlugin` для упрощения случаев, где другие хуки не нужны:

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

Хук `applyToEnvironment` вызывается на этапе конфигурации, сейчас после `configResolved` из-за того, что проекты в экосистеме меняют плагины внутри него. Резолв плагинов окружений в будущем могут перенести до `configResolved`.

## Связь приложения и плагина

`environment.hot` позволяет плагинам обмениваться сообщениями с кодом на стороне приложения для данного окружения. Это аналог [взаимодействия клиент–сервер](/guide/api-plugin#client-server-communication), но для окружений, отличных от client.

:::warning Примечание

Эта возможность доступна только для окружений с поддержкой HMR.

:::

### Управление экземплярами приложения

Имейте в виду: в одном окружении может работать несколько экземпляров приложения. Например, при нескольких открытых вкладках браузера каждая вкладка — отдельный экземпляр со своим подключением к серверу.

При установлении нового соединения на экземпляре `hot` окружения эмитится событие `vite:client:connect`. При закрытии — `vite:client:disconnect`.

Каждый обработчик получает `NormalizedHotChannelClient` вторым аргументом. У клиента есть метод `send` для отправки сообщений в этот экземпляр приложения. Ссылка на клиента стабильна для одного соединения, её можно сохранять для отслеживания.

### Пример

Со стороны плагина:

```js
configureServer(server) {
  server.environments.ssr.hot.on('my:greetings', (data, client) => {
    // do something with the data,
    // and optionally send a response to that application instance
    client.send('my:foo:reply', `Hello from server! You said: ${data}`)
  })

  // broadcast a message to all application instances
  server.environments.ssr.hot.send('my:foo', 'Hello from server!')
}
```

Со стороны приложения всё как во взаимодействии клиент–сервер: через `import.meta.hot` можно отправлять сообщения плагину.

## Окружение в хуках сборки

Как и в dev, в хуках сборки в контексте доступен экземпляр окружения вместо булева `ssr`.
То же для `renderChunk`, `generateBundle` и других хуков, существующих только при сборке.

## Общие плагины при сборке

До Vite 6 пайплайны плагинов в dev и при сборке работали по-разному:

- **В dev:** плагины общие
- **При сборке:** плагины изолированы по окружениям (в разных процессах: `vite build`, затем `vite build --ssr`).

Фреймворкам приходилось делить состояние между сборками `client` и `ssr` через манифесты на диске. В Vite 6 все окружения собираются в одном процессе, поэтому пайплайн плагинов и межокруженческое взаимодействие можно согласовать с dev.

В будущем мажоре возможно полное выравнивание:

- **И в dev, и при сборке:** плагины общие, с [фильтрацией по окружениям](#per-environment-plugins)

Также будет один экземпляр `ResolvedConfig` на всю сборку, что позволит кэшировать на уровне всего процесса сборки приложения, как уже делается с `WeakMap<ResolvedConfig, CachedData>` в dev.

В Vite 6 нужен меньший шаг ради обратной совместимости. Плагины экосистемы пока читают `config.build`, а не `environment.config.build`, поэтому по умолчанию создаётся новый `ResolvedConfig` на каждое окружение. Проект может включить общий конфиг и общий пайплайн плагинов, задав `builder.sharedConfigBuild: true`.

Сначала это подойдёт лишь части проектов; авторы плагинов могут пометить плагин как общий при сборке флагом `sharedDuringBuild: true`. Так проще делить состояние для обычных плагинов:

```js
function myPlugin() {
  // Share state among all environments in dev and build
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // Opt-in into a single instance for all environments
    sharedDuringBuild: true,
  }
}
```
