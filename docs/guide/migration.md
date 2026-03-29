# Миграция с v7 {#migration-from-v7}

Если вы переходите с `rolldown-vite` (технический превью Rolldown для v6 и v7), применимы только разделы с <Badge text="NRV" type="warning" /> в заголовке.

## Смена целевого браузера по умолчанию [<Badge text="NRV" type="warning" />](#migration-from-v7)

Значение по умолчанию для `build.target` — `'baseline-widely-available'` — обновлено до более новых версий:

- Chrome 107 → 111
- Edge 107 → 111
- Firefox 104 → 114
- Safari 16.0 → 16.4

Они соответствуют [Baseline Widely Available](https://web-platform-dx.github.io/web-features/) на 2026-01-01, то есть выпущены примерно два с половиной года назад.

## Сборщик Rolldown {#rolldown}

Vite 8 использует [Rolldown](https://rolldown.rs/) и инструменты на базе [Oxc](https://oxc.rs/) вместо [esbuild](https://esbuild.github.io/) и [Rollup](https://rollupjs.org/).

### Постепенная миграция

Пакет `rolldown-vite` — это Vite 7 на Rolldown без остальных изменений Vite 8. Промежуточный шаг. См. [руководство по Rolldown](https://v7.vite.dev/guide/rolldown) в документации v7.

С `rolldown-vite` на Vite 8: откатите правки зависимостей в `package.json` и обновите Vite:

```json
{
  "devDependencies": {
    "vite": "npm:rolldown-vite@7.2.2" // [!code --]
    "vite": "^8.0.0" // [!code ++]
  }
}
```

### Оптимизатор зависимостей на Rolldown

Оптимизация зависимостей идёт через Rolldown, не esbuild. [`optimizeDeps.esbuildOptions`](/config/dep-optimization-options#optimizedeps-esbuildoptions) по-прежнему поддерживается и автоматически маппится на [`optimizeDeps.rolldownOptions`](/config/dep-optimization-options#optimizedeps-rolldownoptions). `optimizeDeps.esbuildOptions` устарел и будет удалён — переходите на `optimizeDeps.rolldownOptions`.

Автоматическое преобразование:

- [`esbuildOptions.minify`](https://esbuild.github.io/api/#minify) -> [`rolldownOptions.output.minify`](https://rolldown.rs/reference/OutputOptions.minify)
- [`esbuildOptions.treeShaking`](https://esbuild.github.io/api/#tree-shaking) -> [`rolldownOptions.treeshake`](https://rolldown.rs/reference/InputOptions.treeshake)
- [`esbuildOptions.define`](https://esbuild.github.io/api/#define) -> [`rolldownOptions.transform.define`](https://rolldown.rs/reference/InputOptions.transform#define)
- [`esbuildOptions.loader`](https://esbuild.github.io/api/#loader) -> [`rolldownOptions.moduleTypes`](https://rolldown.rs/reference/InputOptions.moduleTypes)
- [`esbuildOptions.preserveSymlinks`](https://esbuild.github.io/api/#preserve-symlinks) -> [`!rolldownOptions.resolve.symlinks`](https://rolldown.rs/reference/InputOptions.resolve#symlinks)
- [`esbuildOptions.resolveExtensions`](https://esbuild.github.io/api/#resolve-extensions) -> [`rolldownOptions.resolve.extensions`](https://rolldown.rs/reference/InputOptions.resolve#extensions)
- [`esbuildOptions.mainFields`](https://esbuild.github.io/api/#main-fields) -> [`rolldownOptions.resolve.mainFields`](https://rolldown.rs/reference/InputOptions.resolve#mainfields)
- [`esbuildOptions.conditions`](https://esbuild.github.io/api/#conditions) -> [`rolldownOptions.resolve.conditionNames`](https://rolldown.rs/reference/InputOptions.resolve#conditionnames)
- [`esbuildOptions.keepNames`](https://esbuild.github.io/api/#keep-names) -> [`rolldownOptions.output.keepNames`](https://rolldown.rs/reference/OutputOptions.keepNames)
- [`esbuildOptions.platform`](https://esbuild.github.io/api/#platform) -> [`rolldownOptions.platform`](https://rolldown.rs/reference/InputOptions.platform)
- [`esbuildOptions.plugins`](https://esbuild.github.io/plugins/) -> [`rolldownOptions.plugins`](https://rolldown.rs/reference/InputOptions.plugins) (частичная поддержка)

Опции слоя совместимости в хуке `configResolved`:

```js
const plugin = {
  name: 'log-config',
  configResolved(config) {
    console.log('options', config.optimizeDeps.rolldownOptions)
  },
},
```

### Трансформация JavaScript через Oxc

Трансформация JS идёт через Oxc, не esbuild. Опция [`esbuild`](/config/shared-options#esbuild) конвертируется в [`oxc`](/config/shared-options#oxc). `esbuild` устарел — мигрируйте на `oxc`.

Автоматическое преобразование:

- `esbuild.jsxInject` -> `oxc.jsxInject`
- `esbuild.include` -> `oxc.include`
- `esbuild.exclude` -> `oxc.exclude`
- [`esbuild.jsx`](https://esbuild.github.io/api/#jsx) -> [`oxc.jsx`](https://oxc.rs/docs/guide/usage/transformer/jsx)
  - `esbuild.jsx: 'preserve'` -> `oxc.jsx: 'preserve'`
  - `esbuild.jsx: 'automatic'` -> `oxc.jsx: { runtime: 'automatic' }`
    - [`esbuild.jsxImportSource`](https://esbuild.github.io/api/#jsx-import-source) -> `oxc.jsx.importSource`
  - `esbuild.jsx: 'transform'` -> `oxc.jsx: { runtime: 'classic' }`
    - [`esbuild.jsxFactory`](https://esbuild.github.io/api/#jsx-factory) -> `oxc.jsx.pragma`
    - [`esbuild.jsxFragment`](https://esbuild.github.io/api/#jsx-fragment) -> `oxc.jsx.pragmaFrag`
  - [`esbuild.jsxDev`](https://esbuild.github.io/api/#jsx-dev) -> `oxc.jsx.development`
  - [`esbuild.jsxSideEffects`](https://esbuild.github.io/api/#jsx-side-effects) -> `oxc.jsx.pure`
- [`esbuild.define`](https://esbuild.github.io/api/#define) -> [`oxc.define`](https://oxc.rs/docs/guide/usage/transformer/global-variable-replacement#define)
- [`esbuild.banner`](https://esbuild.github.io/api/#banner) -> свой плагин с transform
- [`esbuild.footer`](https://esbuild.github.io/api/#footer) -> свой плагин с transform

[`esbuild.supported`](https://esbuild.github.io/api/#supported) в Oxc нет. См. [oxc-project/oxc#15373](https://github.com/oxc-project/oxc/issues/15373).

Опции из слоя совместимости:

```js
const plugin = {
  name: 'log-config',
  configResolved(config) {
    console.log('options', config.oxc)
  },
},
```

Oxc пока не понижает нативные декораторы — ждём спецификацию ([oxc-project/oxc#9170](https://github.com/oxc-project/oxc/issues/9170)).

:::: details Обходной путь для нативных декораторов

Временно [Babel](https://babeljs.io/) или [SWC](https://swc.rs/).

**Babel:**

::: code-group

```bash [npm]
$ npm install -D @rolldown/plugin-babel @babel/plugin-proposal-decorators
```

```bash [Yarn]
$ yarn add -D @rolldown/plugin-babel @babel/plugin-proposal-decorators
```

```bash [pnpm]
$ pnpm add -D @rolldown/plugin-babel @babel/plugin-proposal-decorators
```

```bash [Bun]
$ bun add -D @rolldown/plugin-babel @babel/plugin-proposal-decorators
```

```bash [Deno]
$ deno add -D npm:@rolldown/plugin-babel npm:@babel/plugin-proposal-decorators
```

:::

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import babel from '@rolldown/plugin-babel'

function decoratorPreset(options: Record<string, unknown>) {
  return {
    preset: () => ({
      plugins: [['@babel/plugin-proposal-decorators', options]],
    }),
    rolldown: {
      // Only run this transform if the file contains a decorator.
      filter: {
        code: '@',
      },
    },
  }
}

export default defineConfig({
  plugins: [babel({ presets: [decoratorPreset({ version: '2023-11' })] })],
})
```

**SWC:**

::: code-group

```bash [npm]
$ npm install -D @rollup/plugin-swc @swc/core
```

```bash [Yarn]
$ yarn add -D @rollup/plugin-swc @swc/core
```

```bash [pnpm]
$ pnpm add -D @rollup/plugin-swc @swc/core
```

```bash [Bun]
$ bun add -D @rollup/plugin-swc @swc/core
```

```bash [Deno]
$ deno add -D npm:@rollup/plugin-swc npm:@swc/core
```

:::

```js
import { defineConfig, withFilter } from 'vite'

export default defineConfig({
  // ...
  plugins: [
    withFilter(
      swc({
        swc: {
          jsc: {
            parser: { decorators: true, decoratorsBeforeExport: true },
            transform: { decoratorVersion: '2023-11' },
          },
        },
      }),
      // Only run this transform if the file contains a decorator.
      { transform: { code: '@' } },
    ),
  ],
})
```

::::

#### Запасные варианты с esbuild

`esbuild` больше не обязателен для Vite — опциональная зависимость. Плагины с `transformWithEsbuild` должны добавить `esbuild` в `devDependencies`. Функция устарела — предпочтительно `transformWithOxc`.

### Минификация JavaScript через Oxc

Минификация JS — Oxc Minifier, не esbuild. Устаревшая опция [`build.minify: 'esbuild'`](/config/build-options#build-minify) вернёт esbuild (потом удалят; `esbuild` в `devDependency`).

Бывшие `esbuild.minify*` → `build.rolldownOptions.output.minify`. `esbuild.drop` → [`build.rolldownOptions.output.minify.compress.drop*`](https://oxc.rs/docs/guide/usage/minifier/dead-code-elimination).

Манглинг свойств ([`mangleProps`, `reserveProps`, `mangleQuoted`, `mangleCache`](https://esbuild.github.io/api/#mangle-props)) в Oxc нет — [oxc-project/oxc#15375](https://github.com/oxc-project/oxc/issues/15375).

Допущения минификаторов отличаются:

- [esbuild minify assumptions](https://esbuild.github.io/api/#minify-considerations)
- [Oxc Minifier assumptions](https://oxc.rs/docs/guide/usage/minifier.html#assumptions)

Проблемы минификации сообщайте в трекеры.

### Минификация CSS через Lightning CSS

По умолчанию CSS минифицирует [Lightning CSS](https://lightningcss.dev/). [`build.cssMinify: 'esbuild'`](/config/build-options#build-cssminify) вернёт esbuild (нужен `esbuild` в `devDependencies`).

Lightning CSS даёт лучшее понижение синтаксиса; размер бандла может чуть вырасти.

### Согласованный interop CommonJS

Импорт `default` из CJS теперь ведёт себя единообразно.

`default` — это `module.exports` целевого CJS-модуля, если выполняется одно из условий; иначе `default` — `module.exports.default`:

- импортер `.mjs` или `.mts`;
- ближайший `package.json` импортера с `"type": "module"`;
- у импортируемого CJS `module.exports.__esModule !== true`.

::: details Прежнее поведение

В dev `default` = `module.exports`, если:

- _импортер в оптимизации зависимостей_ и `.mjs`/`.mts`;
- _импортер в оптимизации зависимостей_ и `"type": "module"` в ближайшем `package.json`;
- у CJS `module.exports.__esModule !== true`.

В build:

- `module.exports.__esModule !== true`;
- _нет свойства `default` у `module.exports`_.

(если [`build.commonjsOptions.defaultIsModuleExports`](https://github.com/rollup/plugins/tree/master/packages/commonjs#defaultismoduleexports) не меняли с `'auto'`)

:::

Подробнее: [Ambiguous `default` import from CJS modules | Rolldown](https://rolldown.rs/in-depth/bundling-cjs#ambiguous-default-import-from-cjs-modules).

Сломанный код можно временно починить устаревшим `legacy.inconsistentCjsInterop: true`. Затронутые пакеты — issue/PR авторам со ссылкой на документацию Rolldown.

### Убрано разрешение по «нюханью» формата

Если в `package.json` были и `browser`, и `module`, Vite раньше выбирал поле по содержимому файла и отдавал ESM для браузера. Сейчас эвристика убрана: порядок полей задаёт [`resolve.mainFields`](/config/shared-options#resolve-mainfields). Старый кейс — [`resolve.alias`](/config/shared-options#resolve-alias) или патч (`patch-package`, `pnpm patch`).

### Вызовы require для внешних модулей

Внешние модули: `require` остаётся `require`, не превращается в `import`, чтобы сохранить семантику. Для преобразования в `import` — встроенный [Rolldown `esmExternalRequirePlugin`](https://rolldown.rs/builtin-plugins/esm-external-require), реэкспорт из `vite`.

```js
import { defineConfig, esmExternalRequirePlugin } from 'vite'

export default defineConfig({
  // ...
  plugins: [
    esmExternalRequirePlugin({
      external: ['react', 'vue', /^node:/],
    }),
  ],
})
```

См. [`require` external modules | Rolldown](https://rolldown.rs/in-depth/bundling-cjs#require-external-modules).

### `import.meta.url` в UMD / IIFE

В UMD/IIFE `import.meta.url` больше не полифилится; по умолчанию подставляется `undefined`. Старое поведение — [`define`](/config/shared-options#define) и [`build.rolldownOptions.output.intro`](https://rolldown.rs/reference/OutputOptions.intro). См. [Well-known `import.meta` properties | Rolldown](https://rolldown.rs/in-depth/non-esm-output-formats#well-known-import-meta-properties).

### Удалена опция `build.rollupOptions.watch.chokidar`

Используйте [`build.rolldownOptions.watch.watcher`](https://rolldown.rs/reference/InputOptions.watch#watcher).

### Удалён объектный `build.rollupOptions.output.manualChunks`, функциональная форма устарела

Объектная форма `output.manualChunks` не поддерживается. Функциональная устарела. Гибче [`codeSplitting`](https://rolldown.rs/reference/OutputOptions.codeSplitting) в Rolldown. См. [Manual Code Splitting | Rolldown](https://rolldown.rs/in-depth/manual-code-splitting).

### `build()` бросает `BundleError`

_Только для пользователей JS API._

`build()` кидает [`BundleError`](https://rolldown.rs/reference/TypeAlias.BundleError), а не сырую ошибку плагина. Тип: `Error & { errors?: RolldownError[] }`. Детали — в `.errors`:

```js
try {
  await build()
} catch (e) {
  if (e.errors) {
    for (const error of e.errors) {
      console.log(error.code) // error code
    }
  }
}
```

### Типы модулей и автоопределение

_Авторам плагинов._

Экспериментальные [Module types](https://rolldown.rs/guide/notable-features#module-types), похоже на [esbuild `loader`](https://esbuild.github.io/api/#loader). Rolldown выставляет тип по расширению resolved id. Если в `load`/`transform` вы отдаёте JS из другого типа, добавьте `moduleType: 'js'`:

```js
const plugin = {
  name: 'txt-loader',
  load(id) {
    if (id.endsWith('.txt')) {
      const content = fs.readFile(id, 'utf-8')
      return {
        code: `export default ${JSON.stringify(content)}`,
        moduleType: 'js', // [!code ++]
      }
    }
  },
}
```

### Прочие устаревания

- `build.rollupOptions` → переименовано в `build.rolldownOptions`
- `worker.rollupOptions` → `worker.rolldownOptions`
- `build.commonjsOptions` — no-op
- `build.dynamicImportVarsOptions.warnOnError` — no-op
- `resolve.alias[].customResolver` — свой плагин с `resolveId` и `enforce: 'pre'`

## Удалены устаревшие возможности [<Badge text="NRV" type="warning" />](#migration-from-v7)

- В `import.meta.hot.accept` больше нельзя передавать URL — только id. ([#21382](https://github.com/vitejs/vite/pull/21382))

## Продвинутые изменения

Затрагивают редкие сценарии:

- [Extglobs](https://github.com/micromatch/picomatch/blob/master/README.md#extglobs) пока не поддерживаются ([rolldown-vite#365](https://github.com/vitejs/rolldown-vite/issues/365))
- Устаревший namespace TypeScript — частично. См. [документацию Oxc](https://oxc.rs/docs/guide/usage/transformer/typescript.html#partial-namespace-support)
- `define` для объектов не разделяет ссылку: каждая переменная — отдельная копия. См. [define в Oxc](https://oxc.rs/docs/guide/usage/transformer/global-variable-replacement#define)
- Изменения объекта `bundle` (`generateBundle` / `writeBundle`, результат `build`):
  - присваивание `bundle[foo]` не поддерживается — используйте `this.emitFile()`
  - ссылка не общая между хуками ([rolldown-vite#410](https://github.com/vitejs/rolldown-vite/issues/410))
  - `structuredClone(bundle)` даёт `DataCloneError` — клонируйте `structuredClone({ ...bundle })` ([rolldown-vite#128](https://github.com/vitejs/rolldown-vite/issues/128))
- Параллельные хуки Rollup в Rolldown выполняются последовательно. См. [документацию Rolldown](https://rolldown.rs/apis/plugin-api#sequential-hook-execution)
- `"use strict";` иногда не вставляется. См. [directives | Rolldown](https://rolldown.rs/in-depth/directives)
- Понижение до ES5 через plugin-legacy не поддерживается ([rolldown-vite#452](https://github.com/vitejs/rolldown-vite/issues/452))
- Несколько версий одного браузера в `build.target` — ошибка: раньше esbuild брал последнюю, что было неочевидно
- Нет в Rolldown — больше не поддерживается в Vite:
  - `build.rollupOptions.output.format: 'system'` ([rolldown#2387](https://github.com/rolldown/rolldown/issues/2387))
  - `build.rollupOptions.output.format: 'amd'` ([rolldown#2528](https://github.com/rolldown/rolldown/issues/2528))
  - хук `shouldTransformCachedModule` ([rolldown#4389](https://github.com/rolldown/rolldown/issues/4389))
  - хук `resolveImportMeta` ([rolldown#1010](https://github.com/rolldown/rolldown/issues/1010))
  - хук `renderDynamicImport` ([rolldown#4532](https://github.com/rolldown/rolldown/issues/4532))
  - хук `resolveFileUrl`
- `parseAst` / `parseAstAsync` устарели в пользу `parseSync` / `parse`

## Миграция с v6

Сначала [миграция с v6](https://v7.vite.dev/guide/migration) в документации Vite 7, затем изменения с этой страницы.
