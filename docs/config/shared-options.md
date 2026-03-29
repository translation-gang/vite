# Общие опции

Если не указано иное, опции этого раздела применяются ко всем режимам: dev, build и preview.

## root

- **Тип:** `string`
- **По умолчанию:** `process.cwd()`

Корень проекта (где лежит `index.html`). Абсолютный путь или путь относительно текущей рабочей директории.

Подробнее: [корень проекта](/guide/#index-html-and-project-root).

## base

- **Тип:** `string`
- **По умолчанию:** `/`
- **См. также:** [`server.origin`](/config/server-options.md#server-origin)

Базовый публичный путь в dev и production. Допустимые значения:

- Абсолютный pathname URL, например `/foo/`
- Полный URL, например `https://bar.com/foo/` (в dev часть origin не используется, эквивалентно `/foo/`)
- Пустая строка или `./` (встраиваемый деплой)

Подробнее: [публичный базовый путь](/guide/build#public-base-path).

## mode

- **Тип:** `string`
- **По умолчанию:** `'development'` для serve, `'production'` для build

Задание в конфиге переопределяет режим по умолчанию **и для serve, и для build**. Ещё можно переопределить через CLI `--mode`.

Подробнее: [переменные окружения и режимы](/guide/env-and-mode).

## define

- **Тип:** `Record<string, any>`

Глобальные константы-подстановки. В dev объявляются как глобалы, при сборке статически подставляются.

Vite использует [define в Oxc](https://oxc.rs/docs/guide/usage/transformer/global-variable-replacement#define): выражение значения — строка с JSON-сериализуемым значением (null, boolean, number, string, array, object) или один идентификатор. Не-строки Vite приведёт к строке через `JSON.stringify`.

**Пример:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip ПРИМЕЧАНИЕ
Для TypeScript добавьте объявления типов в `vite-env.d.ts` для проверки типов и подсказок IDE.

Пример:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## plugins

- **Тип:** `(Plugin | Plugin[] | Promise<Plugin | Plugin[]>)[]`

Массив плагинов. Ложные значения игнорируются, вложенные массивы выравниваются. Промис разрешается до запуска. Подробнее: [API плагинов](/guide/api-plugin).

## publicDir

- **Тип:** `string | false`
- **По умолчанию:** `"public"`

Каталог со статическими ассетами без трансформации: в dev отдаётся с `/`, при сборке копируется в корень `outDir`. Абсолютный путь или относительно корня проекта.

`publicDir: false` отключает поведение.

Подробнее: [каталог `public`](/guide/assets#the-public-directory).

## cacheDir

- **Тип:** `string`
- **По умолчанию:** `"node_modules/.vite"`

Каталог кэша: предсобранные зависимости и прочие файлы кэша Vite. Флаг `--force` или ручное удаление каталога пересоздаёт кэш. Абсолютный путь или относительно корня проекта. Если `package.json` не найден, по умолчанию `.vite`.

## resolve.alias

- **Тип:**
  `Record<string, string> | Array<{ find: string | RegExp, replacement: string }>`

Алиасы для подстановки в `import` и `require`. Похоже на [`@rollup/plugin-alias`](https://github.com/rollup/plugins/tree/master/packages/alias).

Порядок записей важен: сначала применяются первые правила.

Для путей ФС используйте абсолютные пути. Относительные значения алиасов не резолвятся в пути ФС.

Сложное разрешение — через [плагины](/guide/api-plugin).

::: warning Совместно с SSR
Если настроены алиасы для [внешних SSR-зависимостей](/guide/ssr.md#ssr-externals), может понадобиться алиасить реальные пакеты в `node_modules`. [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) и [pnpm](https://pnpm.io/aliases/) поддерживают алиасы с префиксом `npm:`.
:::

### Формат объекта (`Record<string, string>`)

Ключ — алиас, значение — фактический импорт. Пример:

```js
resolve: {
  alias: {
    utils: '../../../utils',
    'batman-1.0.0': './joker-1.5.0'
  }
}
```

### Формат массива (`Array<{ find: string | RegExp, replacement: string }>`)

Алиасы как объекты — удобно для сложных пар.

```js
resolve: {
  alias: [
    { find: 'utils', replacement: '../../../utils' },
    { find: 'batman-1.0.0', replacement: './joker-1.5.0' },
  ]
}
```

Если `find` — регулярное выражение, в `replacement` допустимы [шаблоны замены](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement), например `$1`. Пример смены расширения:

```js
{ find:/^(.*)\.js$/, replacement: '$1.alias' }
```

## resolve.dedupe

- **Тип:** `string[]`

При дубликатах одной зависимости (hoisting, linked-пакеты в монорепо) заставляет Vite резолвить перечисленные зависимости в одну копию (от корня проекта).

:::warning SSR + ESM
Для SSR дедупликация не работает для ESM-выходов из `build.rollupOptions.output`. Обходной путь — CJS-выходы, пока у ESM нет полноценной поддержки загрузки модулей в плагинах.
:::

## resolve.conditions <NonInheritBadge />

- **Тип:** `string[]`
- **По умолчанию:** `['module', 'browser', 'development|production']` (`defaultClientConditions`)

Дополнительные условия при разрешении [conditional exports](https://nodejs.org/api/packages.html#packages_conditional_exports) пакета.

Пример поля `exports` в `package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

Здесь `import` и `require` — условия. Условия могут быть вложенными; порядок — от более специфичных к менее.

`development|production` заменяется на `production` или `development` в зависимости от `process.env.NODE_ENV`: при `process.env.NODE_ENV === 'production'` — `production`, иначе `development`.

Условия `import`, `require`, `default` применяются всегда, если выполняются требования.

При разрешении стилей, например `@import 'my-library'`, учитывается условие `style`. Для препроцессоров — `sass` / `less` и т.п.

## resolve.mainFields <NonInheritBadge />

- **Тип:** `string[]`
- **По умолчанию:** `['browser', 'module', 'jsnext:main', 'jsnext']` (`defaultClientMainFields`)

Поля `package.json` для точки входа пакета. Ниже приоритета, чем `exports`: если вход найден через `exports`, main-поля не используются.

## resolve.extensions

- **Тип:** `string[]`
- **По умолчанию:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

Расширения для импортов без суффикса. **Не** рекомендуется опускать расширения у кастомных типов (например `.vue`) — страдают IDE и типы.

## resolve.preserveSymlinks

- **Тип:** `boolean`
- **По умолчанию:** `false`

При включении идентичность файла определяется исходным путём (без следования symlink), а не реальным путём после symlink.

- **См. также:** [esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks), [webpack#resolve.symlinks
  ](https://webpack.js.org/configuration/resolve/#resolvesymlinks)

## resolve.tsconfigPaths

- **Тип:** `boolean`
- **По умолчанию:** `false`

Включает разрешение путей из `tsconfig.json` (`paths`). Подробнее: [возможности](/guide/features.md#paths).

## html.cspNonce

- **Тип:** `string`
- **См. также:** [Content Security Policy (CSP)](/guide/features#content-security-policy-csp)

Заглушка nonce для тегов script/style. Также генерируется meta-тег с nonce.

## css.modules

- **Тип:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * default: undefined
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

Поведение CSS Modules. Опции передаются в [postcss-modules](https://github.com/css-modules/postcss-modules).

Не действует при [Lightning CSS](../guide/features.md#lightning-css); тогда используйте [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html).

## css.postcss

- **Тип:** `string | (postcss.ProcessOptions & { plugins?: postcss.AcceptedPlugin[] })`

Встроенный конфиг PostCSS или каталог поиска конфига (по умолчанию корень проекта).

Для inline ожидается формат как в `postcss.config.js`; для `plugins` только [массив](https://github.com/postcss/postcss-load-config/blob/main/README.md#array).

Поиск через [postcss-load-config](https://github.com/postcss/postcss-load-config); загружаются только поддерживаемые имена файлов. Конфиги вне корня workspace (или [корня проекта](/guide/#index-html-and-project-root), если workspace нет) по умолчанию не ищутся; при необходимости укажите путь явно.

При inline-конфиге Vite не ищет другие источники PostCSS.

## css.preprocessorOptions

- **Тип:** `Record<string, object>`

Опции CSS-препроцессоров; ключи — расширения файлов. Документация по препроцессорам:

- `sass`/`scss`:
  - `sass-embedded`, если установлен, иначе `sass`; для скорости лучше `sass-embedded`.
  - [Опции](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
- `less`: [опции](https://lesscss.org/usage/#less-options).
- `styl`/`stylus`: поддерживается только [`define`](https://stylus-lang.com/docs/js.html#define-name-node) объектом.

**Пример:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **Тип:** `string | ((source: string, filename: string) => (string | { content: string; map?: SourceMap }))`

Добавляет код к каждому стилю. Если вставляете не только переменные, стили могут продублироваться в бандле.

**Пример:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

::: tip Импорт файлов
Один и тот же префикс для файлов в разных каталогах ломает относительные пути — используйте абсолютные пути или [алиасы](#resolve-alias).
:::

## css.preprocessorMaxWorkers

- **Тип:** `number | true`
- **По умолчанию:** `true`

Максимум потоков препроцессоров CSS. `true` — до числа CPU минус 1. `0` — без воркеров, всё в основном потоке.

В зависимости от опций препроцессоры могут выполняться в main thread даже не при `0`.

## css.devSourcemap

- **Экспериментально:** [обратная связь](https://github.com/vitejs/vite/discussions/13845)
- **Тип:** `boolean`
- **По умолчанию:** `false`

Включать ли source map в dev.

## css.transformer

- **Экспериментально:** [обратная связь](https://github.com/vitejs/vite/discussions/13835)
- **Тип:** `'postcss' | 'lightningcss'`
- **По умолчанию:** `'postcss'`

Движок обработки CSS. См. [Lightning CSS](../guide/features.md#lightning-css).

::: info Дублирующиеся `@import`
У postcss (postcss-import) поведение дублирующих `@import` отличается от браузера: [postcss/postcss-import#462](https://github.com/postcss/postcss-import/issues/462).
:::

## css.lightningcss

- **Экспериментально:** [обратная связь](https://github.com/vitejs/vite/discussions/13835)
- **Тип:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Настройка Lightning CSS. Полный список опций — [репозиторий Lightning CSS](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts).

## json.namedExports

- **Тип:** `boolean`
- **По умолчанию:** `true`

Именованные импорты из `.json`.

## json.stringify

- **Тип:** `boolean | 'auto'`
- **По умолчанию:** `'auto'`

`true` — JSON превращается в `export default JSON.parse("...")`, быстрее литералов объектов на больших файлах.

`'auto'` — stringify только если [данные больше 10 КБ](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger).

## oxc

- **Тип:** `OxcOptions | false`

`OxcOptions` расширяет [опции Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer). Частый случай — JSX:

```js
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'classic',
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
  },
})
```

По умолчанию Oxc обрабатывает `ts`, `jsx`, `tsx`. Настройка областей: `oxc.include` / `oxc.exclude` — regex, [picomatch](https://github.com/micromatch/picomatch#globbing-features) или массив.

`oxc.jsxInject` — авто-импорт JSX-хелперов для файлов Oxc:

```js
export default defineConfig({
  oxc: {
    jsxInject: `import React from 'react'`,
  },
})
```

`false` отключает трансформацию Oxc.

## esbuild

- **Тип:** `ESBuildOptions | false`
- **Устарело**

Внутри преобразуется в `oxc`. Используйте `oxc`.

## assetsInclude

- **Тип:** `string | RegExp | (string | RegExp)[]`
- **См. также:** [статические ассеты](/guide/assets)

Дополнительные [шаблоны picomatch](https://github.com/micromatch/picomatch#globbing-features) для статических ассетов:

- не проходят пайплайн плагинов при ссылке из HTML или запросе через `fetch`/XHR;

- импорт из JS даёт URL-строку (можно переопределить плагином с `enforce: 'pre'`).

Встроенный список типов ассетов [здесь](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts).

**Пример:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## logLevel

- **Тип:** `'info' | 'warn' | 'error' | 'silent'`

Детализация вывода в консоль. По умолчанию `'info'`.

## customLogger

- **Тип:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

Свой логгер. Через `createLogger` можно взять дефолтный и, например, фильтровать предупреждения.

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // Ignore empty CSS files warning
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## clearScreen

- **Тип:** `boolean`
- **По умолчанию:** `true`

`false` — не очищать экран терминала при части сообщений. В CLI: `--clearScreen false`.

## envDir

- **Тип:** `string | false`
- **По умолчанию:** `root`

Каталог загрузки `.env`. Абсолютный путь или относительно корня проекта. `false` отключает загрузку `.env`.

Подробнее: [файлы окружения](/guide/env-and-mode#env-files).

## envPrefix

- **Тип:** `string | string[]`
- **По умолчанию:** `VITE_`

Переменные с префиксом `envPrefix` доступны клиентскому коду через `import.meta.env`.

:::warning БЕЗОПАСНОСТЬ
Не задавайте `envPrefix: ''` — утекут все переменные. Vite выбросит ошибку при `''`.

Без префикса лучше отдать значение через [define](#define):

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## appType

- **Тип:** `'spa' | 'mpa' | 'custom'`
- **По умолчанию:** `'spa'`

Тип приложения: SPA, [MPA](../guide/build#multi-page-app) или кастомное (SSR, свой HTML):

- `'spa'` — HTML middleware и SPA fallback; в preview [sirv](https://github.com/lukeed/sirv) с `single: true`
- `'mpa'` — HTML middleware
- `'custom'` — без HTML middleware

Подробнее: [SSR](/guide/ssr#vite-cli). См. [`server.middlewareMode`](./server-options#server-middlewaremode).

## devtools

- **Экспериментально:** [обратная связь](https://github.com/vitejs/devtools/discussions)
- **Тип:** `boolean` | `DevToolsConfig`
- **По умолчанию:** `false`

Интеграция devtools для визуализации внутреннего состояния и анализа сборки.
Нужна зависимость `@vitejs/devtools`. Пока только в режиме build.

Подробнее: [Vite DevTools](https://github.com/vitejs/devtools).

## future

- **Тип:** `Record<string, 'warn' | undefined>`
- **См. также:** [breaking changes](/changes/)

Включить будущие ломающие изменения для плавного перехода на следующую major. Список может меняться.

Варианты опций — на странице [Breaking Changes](/changes/).
