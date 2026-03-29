# Сборка для production

Когда приложение готово к деплою, выполните `vite build`. По умолчанию точка входа — `<root>/index.html`, на выходе — бандл для статического хостинга. Инструкции по популярным сервисам — в [Деплой статического сайта](./static-deploy).

<ScrimbaLink href="https://scrimba.com/intro-to-vite-c03p6pbbdq/~037q?via=vite" title="Сборка для production">Интерактивный урок на Scrimba</ScrimbaLink>

## Совместимость с браузерами

По умолчанию production-бандл рассчитан на современные браузеры из целей [Baseline](https://web-platform-dx.github.io/web-features/) Widely Available. Диапазон по умолчанию:

<!-- Search for the `ESBUILD_BASELINE_WIDELY_AVAILABLE_TARGET` constant for more information -->

- Chrome >=111
- Edge >=111
- Firefox >=114
- Safari >=16.4

Свои цели задаются [`build.target`](/config/build-options.md#build-target); минимальная цель — `es2015`. Ниже Vite всё равно опирается на минимальные версии из‑за [нативного динамического `import` ESM](https://caniuse.com/es6-module-dynamic-import) и [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta):

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- Chrome >=64
- Firefox >=67
- Safari >=11.1
- Edge >=79

По умолчанию Vite делает только синтаксические трансформации и **не подключает полифиллы**. См. https://cdnjs.cloudflare.com/polyfill/ — бандлы полифиллов по User-Agent.

Устаревшие браузеры поддерживаются [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy): отдельные legacy-чанки и полифиллы языка; legacy грузится только там, где нет нативного ESM.

## Публичный базовый путь

- См. также: [Работа с ресурсами](./assets)

Если сайт в подкаталоге, задайте [`base`](/config/shared-options.md#base) — пути к ресурсам перепишутся. То же можно передать в CLI, например `vite build --base=/my/public/path/`.

URL ресурсов из JS, `url()` в CSS и ссылки в `.html` при сборке учитывают эту опцию.

Исключение — динамическая сборка URL в рантайме: используйте глобальную переменную `import.meta.env.BASE_URL` (публичный базовый путь). Она подставляется статически при сборке и должна быть записана буквально (`import.meta.env['BASE_URL']` не сработает).

Сложные сценарии — в [Расширенные опции base](#advanced-base-options).

### Относительный base

Если базовый путь заранее неизвестен, можно задать относительный: `"base": "./"` или `"base": ""`. Все сгенерированные URL станут относительными к каждому файлу.

:::warning Поддержка старых браузеров при относительном base

Для относительного base нужна поддержка `import.meta`. Для [браузеров без `import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) используйте [плагин `legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy).

:::

## Настройка сборки

Параметры — в [опциях сборки](/config/build-options.md). Нижележащие [опции Rolldown](https://rolldown.rs/reference/) задаются через `build.rolldownOptions`:

```js [vite.config.js]
export default defineConfig({
  build: {
    rolldownOptions: {
      // https://rolldown.rs/reference/
    },
  },
})
```

Так можно задать несколько выходов Rolldown с плагинами только для сборки.

## Стратегия разбиения на чанки

Разбиение настраивается [`build.rolldownOptions.output.codeSplitting`](https://rolldown.rs/reference/OutputOptions.codeSplitting) (см. [документацию Rolldown](https://rolldown.rs/in-depth/manual-code-splitting)). Во фреймворке смотрите их документацию.

## Ошибки загрузки

При сбое динамического импорта Vite генерирует событие `vite:preloadError`. В `event.payload` — исходная ошибка импорта. Вызов `event.preventDefault()` подавит выброс ошибки.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // for example, refresh the page
})
```

После нового деплоя хостинг может удалить артефакты старого. Пользователь со старой вкладкой может получить ошибку импорта: на клиенте старые чанки пытаются подтянуть уже удалённые файлы. Это событие помогает обработать такой случай. Для HTML задайте `Cache-Control: no-cache`, иначе ссылки на старые ресурсы сохранятся.

## Пересборка при изменении файлов

Включите watcher Rollup: `vite build --watch` или `build.watch`:

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rolldown.rs/reference/InputOptions.watch
    },
  },
})
```

С `--watch` изменения отслеживаемых файлов вызывают пересборку. Изменения конфига и его зависимостей требуют перезапуска команды сборки.

## Многостраничное приложение (MPA)

Структура исходников:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

В dev переходите на `/nested/` — как у обычного статического сервера.

При сборке укажите несколько `.html` как точки входа:

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        nested: resolve(import.meta.dirname, 'nested/index.html'),
      },
    },
  },
})
```

Если корень другой, помните: `import.meta.dirname` — каталог `vite.config.js`, к путям в `resolve` нужно добавить ваш `root`.

Для HTML Vite игнорирует ключи в `rolldownOptions.input` и ориентируется на разрешённый id файла при генерации HTML в dist — как в dev-сервере.

## Режим библиотеки

При разработке браузерной библиотеки часто есть демо-страница, импортирующая библиотеку. В Vite для этого удобен `index.html` и обычный dev-опыт.

Для публикации библиотеки используйте [`build.lib`](/config/build-options.md#build-lib). Вынесите в `external` зависимости, которые не должны попасть в бандл, например `vue` или `react`:

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'lib/main.js'),
      name: 'MyLib',
      // the proper extensions will be added
      fileName: 'my-lib',
    },
    rolldownOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(import.meta.dirname, 'lib/main.js'),
        secondary: resolve(import.meta.dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rolldownOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

В точке входа — экспорты для потребителей пакета:

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

С таким конфигом `vite build` использует пресет Rollup для библиотек и выдаёт:

- `es` и `umd` (одна точка входа)
- `es` и `cjs` (несколько точек)

Форматы настраиваются [`build.lib.formats`](/config/build-options.md#build-lib).

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

Рекомендуемый `package.json` для библиотеки:

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### Поддержка CSS

Если библиотека импортирует CSS, рядом с JS появится один CSS-файл, например `dist/my-lib.css`. Имя по умолчанию из `build.lib.fileName`, можно задать [`build.lib.cssFileName`](/config/build-options.md#build-lib).

Экспорт CSS в `package.json` для потребителей:

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip Расширения файлов
Если в `package.json` нет `"type": "module"`, Vite выдаёт другие расширения для совместимости с Node.js: `.js` → `.mjs`, `.cjs` → `.js`.
:::

::: tip Переменные окружения
В режиме библиотеки все обращения [`import.meta.env.*`](./env-and-mode.md) статически подставляются в production. Обращения `process.env.*` — нет, чтобы потребители могли менять их в рантайме. Чтобы зафиксировать, используйте например `define: { 'process.env.NODE_ENV': '"production"' }` или [`esm-env`](https://github.com/benmccann/esm-env) для лучшей совместимости со сборщиками и средами.
:::

::: warning Продвинутые сценарии
Режим библиотеки — простая сфокусированная конфигурация для браузерных и JS-фреймворк-библиотек. Для небраузерных библиотек или сложных пайплайнов используйте [tsdown](https://tsdown.dev/) или [Rolldown](https://rolldown.rs/) напрямую.
:::

## Расширенные опции base

::: warning
Экспериментальная возможность. [Обратная связь](https://github.com/vitejs/vite/discussions/13834).
:::

В сложных случаях собранные ресурсы и публичные файлы могут жить по разным путям (разные стратегии кэша). Возможны три группы:

- сгенерированные HTML точек входа (в т.ч. после SSR);
- собранные ресурсы с хэшем (JS, CSS, изображения и др.);
- скопированные [публичные файлы](assets.md#the-public-directory)

Одного статического [base](#public-base-path) недостаточно. В сборке есть экспериментальная поддержка через `experimental.renderBuiltUrl`.

```ts twoslash
import type { UserConfig } from 'vite'
// prettier-ignore
const config: UserConfig = {
// ---cut-before---
experimental: {
  renderBuiltUrl(filename, { hostType }) {
    if (hostType === 'js') {
      return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    } else {
      return { relative: true }
    }
  },
},
// ---cut-after---
}
```

Если хэшированные ресурсы и публичные файлы деплоятся отдельно, для групп можно задать разные правила по `type` во втором параметре `context`:

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// prettier-ignore
const config: UserConfig = {
// ---cut-before---
experimental: {
  renderBuiltUrl(filename, { hostId, hostType, type }) {
    if (type === 'public') {
      return 'https://www.domain.com/' + filename
    } else if (path.extname(hostId) === '.js') {
      return {
        runtime: `window.__assetsPath(${JSON.stringify(filename)})`
      }
    } else {
      return 'https://cdn.domain.com/assets/' + filename
    }
  },
},
// ---cut-after---
}
```

`filename` приходит как декодированный URL; если функция возвращает строку URL, она тоже должна быть декодированной — кодирование при отрисовке сделает Vite. Если возвращается объект с `runtime`, кодирование в рантайме — ваша ответственность.
