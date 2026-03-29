# Опции сборки

Если не указано иное, опции этого раздела применяются только к build.

## build.target

- **Тип:** `string | string[]`
- **По умолчанию:** `'baseline-widely-available'`
- **См. также:** [Совместимость с браузерами](/guide/build#browser-compatibility)

Целевая совместимость браузеров для итогового бандла. Значение по умолчанию — специальное для Vite `'baseline-widely-available'`: браузеры из [Baseline](https://web-platform-dx.github.io/web-features/) Widely Available на 2026-01-01. Конкретно: `['chrome111', 'edge111', 'firefox114', 'safari16.4']`.

Другое специальное значение — `'esnext'`: предполагается нативная поддержка динамического `import`, выполняется минимальный транспилинг.

Трансформация через Oxc Transformer; значение должно быть допустимой [целью Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer/lowering#target). Можно указать версию ES (например `es2015`), браузер с версией (например `chrome58`) или массив строк.

При невозможности безопасно транспилировать возможности кода сборка выведет предупреждение. Подробнее в [документации Oxc](https://oxc.rs/docs/guide/usage/transformer/lowering#warnings).

## build.modulePreload

- **Тип:** `boolean | { polyfill?: boolean, resolveDependencies?: ResolveModulePreloadDependenciesFn }`
- **По умолчанию:** `{ polyfill: true }`

По умолчанию подключается [полифилл module preload](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill). Он вставляется в прокси-модуль каждой точки входа `index.html`. Если вход не HTML, а кастомный через `build.rollupOptions.input`, полифилл нужно импортировать вручную:

```js
import 'vite/modulepreload-polyfill'
```

Полифилл **не** действует в [режиме библиотеки](/guide/build#library-mode). Для браузеров без нативного dynamic import в библиотеке лучше не полагаться на него.

Отключить: `{ polyfill: false }`.

Список чанков для preload при динамическом импорте вычисляет Vite. По умолчанию используется абсолютный путь с учётом `base`. Если `base` относительный (`''` или `'./'`), в рантайме применяется `import.meta.url`, чтобы не зависеть от финального базового пути.

Экспериментально: тонкий контроль списка и путей через `resolveDependencies`. [Обратная связь](https://github.com/vitejs/vite/discussions/13841). Тип функции `ResolveModulePreloadDependenciesFn`:

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

Функция вызывается для каждого динамического импорта со списком зависимых чанков и для чанков из HTML-входов. Можно вернуть новый массив с фильтрацией, доп. зависимостями и изменёнными путями. Пути в `deps` относительны к `build.outDir`. Возвращаемые пути — относительно `build.outDir`.

```js twoslash
/** @type {import('vite').UserConfig} */
const config = {
  // prettier-ignore
  build: {
// ---cut-before---
modulePreload: {
  resolveDependencies: (filename, deps, { hostId, hostType }) => {
    return deps.filter(condition)
  },
},
// ---cut-after---
  },
}
```

Пути можно дополнительно менять через [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options).

## build.polyfillModulePreload

- **Тип:** `boolean`
- **По умолчанию:** `true`
- **Устарело** — используйте `build.modulePreload.polyfill`

Автоматическая вставка [полифилла module preload](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill).

## build.outDir

- **Тип:** `string`
- **По умолчанию:** `dist`

Каталог вывода (относительно [корня проекта](/guide/#index-html-and-project-root)).

## build.assetsDir

- **Тип:** `string`
- **По умолчанию:** `assets`

Вложенная папка для сгенерированных ассетов (относительно `build.outDir`). Не используется в [режиме библиотеки](/guide/build#library-mode).

## build.assetsInlineLimit

- **Тип:** `number` | `((filePath: string, content: Buffer) => boolean | undefined)`
- **По умолчанию:** `4096` (4 KiB)

Импортируемые или ссылаемые ассеты меньше порога встраиваются как base64, чтобы сократить HTTP-запросы. `0` — отключить встраивание.

Если передан колбэк, можно явно включить/выключить; без возврата — логика по умолчанию.

Заглушки Git LFS не встраиваются — в них нет реального содержимого.

::: tip Примечание
При `build.lib` опция `build.assetsInlineLimit` игнорируется: ассеты всегда встраиваются независимо от размера и LFS.
:::

## build.cssCodeSplit

- **Тип:** `boolean`
- **По умолчанию:** `true`

Включить/выключить разбиение CSS. При включении CSS из асинхронных JS-чанков остаётся отдельными чанками и подгружается вместе с JS.

При выключении весь CSS проекта извлекается в один файл.

::: tip Примечание
При `build.lib` по умолчанию `build.cssCodeSplit` равен `false`.
:::

## build.cssTarget

- **Тип:** `string | string[]`
- **По умолчанию:** как у [`build.target`](#build-target)

Отдельная цель браузеров для минификации CSS (не для JS).

Имеет смысл для нетипичных браузеров. Пример: Android WeChat WebView — современный JS, но без [шестнадцатеричной нотации `#RGBA` в CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_colors). Тогда задайте `build.cssTarget: 'chrome61'`, чтобы Vite не превращал `rgba()` в `#RGBA`.

## build.cssMinify

- **Тип:** `boolean | 'lightningcss' | 'esbuild'`
- **По умолчанию:** `'lightningcss'`, но `false`, если [`build.minify`](#build-minify) отключён для клиентской сборки

Переопределение минификации CSS независимо от `build.minify`. По умолчанию — [Lightning CSS](https://lightningcss.dev/minification.html); настройки в [`css.lightningcss`](./shared-options.md#css-lightningcss). Значение `'esbuild'` — минификация через esbuild.

Для `'esbuild'` нужен установленный пакет esbuild.

```sh
npm add -D esbuild
```

## build.sourcemap

- **Тип:** `boolean | 'inline' | 'hidden'`
- **По умолчанию:** `false`

Source map для production. `true` — отдельный файл. `'inline'` — data URI в выходном файле. `'hidden'` — как `true`, но без комментариев source map в бандле.

## build.rolldownOptions

- **Тип:** [`RolldownOptions`](https://rolldown.rs/reference/)

Прямая настройка нижележащего бандла Rolldown; те же опции, что в конфиге Rolldown, сливаются с внутренними опциями Vite. Подробнее в [документации Rolldown](https://rolldown.rs/reference/).

## build.rollupOptions

- **Тип:** `RolldownOptions`
- **Устарело**

Псевдоним `build.rolldownOptions`. Используйте `build.rolldownOptions`.

## build.dynamicImportVarsOptions

- **Тип:** `{ include?: string | RegExp | (string | RegExp)[], exclude?: string | RegExp | (string | RegExp)[] }`
- **См. также:** [Динамический импорт](/guide/features#dynamic-import)

Трансформировать динамические импорты с переменными.

## build.lib

- **Тип:** `{ entry: string | string[] | { [entryAlias: string]: string }, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string | ((format: ModuleFormat, entryName: string) => string), cssFileName?: string }`
- **См. также:** [Режим библиотеки](/guide/build#library-mode)

Сборка как библиотеки. `entry` обязателен — HTML не используется. `name` — глобальная переменная, нужна при `formats` с `'umd'` или `'iife'`. По умолчанию `formats`: `['es', 'umd']` или `['es', 'cjs']` при нескольких входах.

`fileName` — имя выходного файла пакета; по умолчанию `"name"` из `package.json`. Можно функция `(format, entryName) => имя`.

Если пакет импортирует CSS, `cssFileName` задаёт имя CSS. По умолчанию совпадает со строковым `fileName`, иначе снова `"name"` из `package.json`.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/main.js'],
      fileName: (format, entryName) => `my-lib-${entryName}.${format}.js`,
      cssFileName: 'my-lib-style',
    },
  },
})
```

## build.license

- **Тип:** `boolean | { fileName?: string }`
- **По умолчанию:** `false`
- **См. также:** [Лицензии](/guide/features#license)

При `true` создаётся `.vite/license.md` со сводкой лицензий зависимостей в бандле.

`fileName` — имя файла относительно `outDir`. Если заканчивается на `.json`, пишется сырой JSON для дальнейшей обработки. Пример:

```json
[
  {
    "name": "dep-1",
    "version": "1.2.3",
    "identifier": "CC0-1.0",
    "text": "CC0 1.0 Universal\n\n..."
  },
  {
    "name": "dep-2",
    "version": "4.5.6",
    "identifier": "MIT",
    "text": "MIT License\n\n..."
  }
]
```

::: tip

Чтобы сослаться на файл лицензий в собранном коде, используйте [`build.rolldownOptions.output.postBanner`](https://rolldown.rs/reference/OutputOptions.postBanner#postbanner) для комментария в начале файлов. Пример:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    license: true,
    rolldownOptions: {
      output: {
        postBanner:
          '/* See licenses of bundled dependencies at https://example.com/license.md */',
      },
    },
  },
})
```

:::

## build.manifest

- **Тип:** `boolean | string`
- **По умолчанию:** `false`
- **См. также:** [Интеграция с бэкендом](/guide/backend-integration)

Генерировать manifest: соответствие нехешированных имён ассетов хешированным версиям для шаблонов на сервере.

Строка — путь к manifest относительно `build.outDir`. `true` — `.vite/manifest.json`.

В плагинах для обхода чанков/ассетов и CSS можно использовать [`viteMetadata` в метаданных вывода](/guide/api-plugin#output-bundle-metadata).

## build.ssrManifest

- **Тип:** `boolean | string`
- **По умолчанию:** `false`
- **См. также:** [SSR](/guide/ssr)

SSR manifest для ссылок на стили и preload ассетов в production.

Строка — путь относительно `build.outDir`. `true` — `.vite/ssr-manifest.json`.

## build.ssr

- **Тип:** `boolean | string`
- **По умолчанию:** `false`
- **См. также:** [SSR](/guide/ssr)

Сборка с ориентацией на SSR. Строка — явный SSR entry; `true` — entry через `rollupOptions.input`.

## build.emitAssets

- **Тип:** `boolean`
- **По умолчанию:** `false`

В не-клиентских сборках статические ассеты не эмитятся (ожидается клиентская сборка). Опция заставляет эмитить; фреймворк должен объединить ассеты после сборки.

## build.ssrEmitAssets

- **Тип:** `boolean`
- **По умолчанию:** `false`

При SSR-сборке ассеты по умолчанию не эмитятся (ожидается клиент). Опция эмитит в клиенте и SSR; объединение — задача фреймворка. После стабилизации Environment API заменяется на `build.emitAssets`.

## build.minify

- **Тип:** `boolean | 'oxc' | 'terser' | 'esbuild'`
- **По умолчанию:** `'oxc'` для клиента, `false` для SSR

`false` — без минификации; иначе выбор минификатора. По умолчанию [Oxc Minifier](https://oxc.rs/docs/guide/usage/minifier) — примерно в 30–90 раз быстрее terser при сжатии хуже на 0,5–2%. [Бенчмарки](https://github.com/privatenumber/minification-benchmarks)

`build.minify: 'esbuild'` устарело и будет удалено.

В режиме lib с форматом `'es'` пробелы не минифицируются — иначе теряются pure-аннотации и ломается tree-shaking.

Для `'esbuild'` или `'terser'` нужны установленные пакеты.

```sh
npm add -D esbuild
npm add -D terser
```

## build.terserOptions

- **Тип:** `TerserOptions`

Дополнительные [опции минификации](https://terser.org/docs/api-reference#minify-options) для Terser.

Можно передать `maxWorkers: number` — число воркеров; по умолчанию число CPU минус 1.

## build.write

- **Тип:** `boolean`
- **По умолчанию:** `true`

`false` — не писать бандл на диск. Чаще для [программного `build()`](/guide/api-javascript#build) с постобработкой перед записью.

## build.emptyOutDir

- **Тип:** `boolean`
- **По умолчанию:** `true`, если `outDir` внутри `root`

По умолчанию Vite очищает `outDir` при сборке, если он внутри корня проекта. Если `outDir` вне корня — предупреждение против случайного удаления. Явная опция подавляет предупреждение. В CLI: `--emptyOutDir`.

## build.copyPublicDir

- **Тип:** `boolean`
- **По умолчанию:** `true`

По умолчанию файлы из `publicDir` копируются в `outDir`. `false` — отключить.

## build.reportCompressedSize

- **Тип:** `boolean`
- **По умолчанию:** `true`

Отчёт о размере после gzip. На больших проектах отключение ускоряет сборку.

## build.chunkSizeWarningLimit

- **Тип:** `number`
- **По умолчанию:** `500`

Порог предупреждения о размере чанка (кБ). Сравнивается с несжатым размером — [размер JS связан со временем выполнения](https://v8.dev/blog/cost-of-javascript-2019).

## build.watch

- **Тип:** [`WatcherOptions`](https://rolldown.rs/reference/InputOptions.watch)`| null`
- **По умолчанию:** `null`

`{}` — включить watcher Rolldown. Для плагинов только на этапе сборки или интеграций.

::: warning Vite в WSL2

Слежение за ФС в WSL2 может не работать.
См. [`server.watch`](./server-options.md#server-watch).

:::
