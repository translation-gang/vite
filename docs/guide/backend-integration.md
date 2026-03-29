# Интеграция с бэкендом

:::tip Примечание
Если HTML отдаёт классический бэкенд (Rails, Laravel и т.д.), а ассеты — Vite, посмотрите готовые интеграции в [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends).

Свою связку можно собрать по шагам ниже.
:::

1. В конфиге Vite укажите вход и включите манифест сборки:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---cut---
   export default defineConfig({
     server: {
       cors: {
         // the origin you will be accessing via browser
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // generate .vite/manifest.json in outDir
       manifest: true,
       rollupOptions: {
         // overwrite default .html entry
         input: '/path/to/main.js',
       },
     },
   })
   ```

   Если не отключён [полифил module preload](/config/build-options.md#build-polyfillmodulepreload), импортируйте его в начале entry:

   ```js
   // add the beginning of your app entry
   import 'vite/modulepreload-polyfill'
   ```

2. В dev в шаблон HTML сервера вставьте (замените `http://localhost:5173` на URL вашего Vite):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   Чтобы ассеты открывались корректно:
   - проксируйте запросы к статике на Vite, или
   - задайте [`server.origin`](/config/server-options.md#server-origin), чтобы URL ассетов строились от URL бэкенда, а не относительно страницы.

   Нужно для картинок и прочих ассетов.

   С React и `@vitejs/plugin-react` перед этими скриптами добавьте (снова подставьте URL Vite):

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. После `vite build` рядом с ассетами появится `.vite/manifest.json`. Пример:

   ```json [.vite/manifest.json] style:max-height:400px
   {
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "_shared-ChJ_j-JJ.css": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-ChJ_j-JJ.css"
     },
     "logo.svg": {
       "file": "assets/logo-BuPIv-2h.svg",
       "src": "logo.svg"
     },
     "baz.js": {
       "file": "assets/baz-B2H3sXNv.js",
       "name": "baz",
       "src": "baz.js",
       "isDynamicEntry": true
     },
     "views/bar.js": {
       "file": "assets/bar-gkvgaI9m.js",
       "name": "bar",
       "src": "views/bar.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "dynamicImports": ["baz.js"]
     },
     "views/foo.js": {
       "file": "assets/foo-BRBmoGS9.js",
       "name": "foo",
       "src": "views/foo.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "css": ["assets/foo-5UjPuW-k.css"]
     }
   }
   ```

   Манифест сопоставляет исходные файлы с выходными и зависимостями:

   ```dot
   digraph manifest {
     rankdir=TB
     node [shape=box style="rounded,filled" fontname="Arial" fontsize=10 margin="0.2,0.1" fontcolor="${#3c3c43|#ffffff}" color="${#c2c2c4|#3c3f44}"]
     edge [color="${#67676c|#98989f}" fontname="Arial" fontsize=9 fontcolor="${#67676c|#98989f}"]
     bgcolor="transparent"

     foo [label="views/foo.js\n(entry)" fillcolor="${#e9eaff|#222541}"]
     bar [label="views/bar.js\n(entry)" fillcolor="${#e9eaff|#222541}"]
     shared [label="_shared-B7PI925R.js\n(common chunk)" fillcolor="${#f2ecfc|#2c273e}"]
     baz [label="baz.js\n(dynamic import)" fillcolor="${#fcf4dc|#38301a}"]
     foocss [label="foo.css" shape=ellipse fillcolor="${#fde4e8|#3a1d27}"]
     sharedcss [label="shared.css" shape=ellipse fillcolor="${#fde4e8|#3a1d27}"]
     logo [label="logo.svg\n(asset)" shape=ellipse fillcolor="${#def5ed|#15312d}"]

     foo -> shared [label="imports"]
     bar -> shared [label="imports"]
     bar -> baz [label="dynamicImports" style=dashed]
     foo -> foocss [label="css"]
     shared -> sharedcss [label="css"]
   }
   ```

   Структура `Record<name, chunk>`, чанк соответствует интерфейсу `ManifestChunk`:

   ```ts style:max-height:400px
   interface ManifestChunk {
     /**
      * The input file name of this chunk / asset if known
      */
     src?: string
     /**
      * The output file name of this chunk / asset
      */
     file: string
     /**
      * The list of CSS files imported by this chunk
      */
     css?: string[]
     /**
      * The list of asset files imported by this chunk, excluding CSS files
      */
     assets?: string[]
     /**
      * Whether this chunk or asset is an entry point
      */
     isEntry?: boolean
     /**
      * The name of this chunk / asset if known
      */
     name?: string
     /**
      * Whether this chunk is a dynamic entry point
      *
      * This field is only present in JS chunks.
      */
     isDynamicEntry?: boolean
     /**
      * The list of statically imported chunks by this chunk
      *
      * The values are the keys of the manifest. This field is only present in JS chunks.
      */
     imports?: string[]
     /**
      * The list of dynamically imported chunks by this chunk
      *
      * The values are the keys of the manifest. This field is only present in JS chunks.
      */
     dynamicImports?: string[]
   }
   ```

   Каждая запись — один из типов:
   - **Entry chunks**: из [`build.rollupOptions.input`](https://rollupjs.org/configuration-options/#input). `isEntry: true`, ключ — относительный путь от корня.
   - **Dynamic entry chunks**: динамические импорты. `isDynamicEntry: true`, ключ — относительный путь.
   - **Non-entry chunks**: ключ — имя файла с префиксом `_`.
   - **Asset chunks**: картинки, шрифты и т.д.; ключ — относительный путь к исходнику.
   - **CSS**: при [`build.cssCodeSplit`](/config/build-options.md#build-csscodesplit) `false` — один файл с ключом `style.css`. Иначе ключи по аналогии с JS (entry без `_`, остальные с `_`).

   JS-чанки содержат статические и динамические импорты (ключи манифеста), а также связанные CSS и ассеты.

4. По манифесту генерируйте `<link>` и preload с хэшированными именами.

   Ниже — иллюстративный HTML; подставьте свой шаблонизатор. Функция `importedChunks` для примера, в Vite её нет.

   ```html
   <!-- if production -->

   <!-- for cssFile of manifest[name].css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <!-- for chunk of importedChunks(manifest, name) -->
   <!-- for cssFile of chunk.css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <script type="module" src="/{{ manifest[name].file }}"></script>

   <!-- for chunk of importedChunks(manifest, name) -->
   <link rel="modulepreload" href="/{{ chunk.file }}" />
   ```

   Рекомендуемый порядок тегов для производительности:
   1. `<link rel="stylesheet">` для каждого файла из `css` entry-чанка (если есть).
   2. Рекурсивно по `imports` entry — `<link rel="stylesheet">` для всех `css` импортированных чанков.
   3. Тег для `file` entry: `<script type="module">` для JS или `<link rel="stylesheet">` для CSS.
   4. По желанию: `<link rel="modulepreload">` для `file` каждого импортированного JS-чанка (рекурсивно от entry).

   Для entry `views/foo.js`:

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   Для `views/bar.js`:

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Псевдореализация `importedChunks`
   Пример на TypeScript (адаптируйте под свой язык и шаблоны):

   ```ts
   import type { Manifest, ManifestChunk } from 'vite'

   export default function importedChunks(
     manifest: Manifest,
     name: string,
   ): ManifestChunk[] {
     const seen = new Set<string>()

     function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
       const chunks: ManifestChunk[] = []
       for (const file of chunk.imports ?? []) {
         const importee = manifest[file]
         if (seen.has(file)) {
           continue
         }
         seen.add(file)

         chunks.push(...getImportedChunks(importee))
         chunks.push(importee)
       }

       return chunks
     }

     return getImportedChunks(manifest[name])
   }
   ```

   :::
