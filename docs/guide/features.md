# Возможности

В простейшем случае разработка на Vite мало отличается от статического файлового сервера. Но поверх нативных ESM-импортов Vite добавляет многое из того, что обычно дают сборщики.

## Разрешение npm-зависимостей и предсборка

Нативные ES-импорты не поддерживают «голые» импорты модуля вроде:

```js
import { someMethod } from 'my-dep'
```

Такой импорт в браузере вызовет ошибку. Vite находит голые импорты во всех отдаваемых исходниках и делает следующее:

1. [Предсобирает](./dep-pre-bundling) их для ускорения загрузки и переводит CommonJS / UMD в ESM. Предсборка выполняется через [Rolldown](https://rolldown.rs/) и сильно ускоряет холодный старт по сравнению с JS-бандлерами.

2. Переписывает импорты в валидные URL вроде `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`, чтобы браузер мог их загрузить.

**Зависимости сильно кэшируются**

Запросы к зависимостям кэшируются через HTTP-заголовки. Чтобы править зависимость локально, см. [здесь](./dep-pre-bundling#browser-cache).

## Hot Module Replacement (HMR)

Поверх нативного ESM доступен [HMR API](./api-hmr). Фреймворки с HMR могут давать мгновенные точечные обновления без перезагрузки страницы и потери состояния. Официальные интеграции: [Vue SFC](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) и [React Fast Refresh](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react). Для Preact — [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite).

Настраивать вручную обычно не нужно: при [создании приложения через `create-vite`](./) выбранные шаблоны уже это включают.

## TypeScript

Импорт `.ts` поддерживается из коробки.

### Только транспиляция

Vite **только** транспилирует `.ts` и **не** выполняет проверку типов. Проверка типов — задача IDE и вашего процесса сборки.

Транспиляция и проверка типов устроены по-разному: транспиляция идёт по файлам и хорошо сочетается с по требованию компиляцией Vite; проверка типов требует знания всего графа модулей. Встраивание проверки типов в пайплайн трансформаций неизбежно убьёт скорость Vite.

Задача Vite — как можно быстрее привести модули к виду, который можно выполнить в браузере. Статический анализ (включая ESLint) лучше вынести из трансформаций Vite.

- В production можно дополнительно запускать `tsc --noEmit` рядом с `vite build`.

- В разработке, если нужно больше, чем подсказки IDE, запускайте `tsc --noEmit --watch` отдельно или [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), чтобы видеть ошибки типов в браузере.

Для TS → JS используется [Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer.html) — быстрее «голого» `tsc`; обновления HMR могут попадать в браузер быстрее 50 ms.

Используйте синтаксис [type-only import/export](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export), чтобы избежать ошибочного бандлинга чисто типовых импортов, например:

```ts
import type { T } from 'only/types'
export type { T }
```

### Опции компилятора TypeScript

Vite учитывает часть настроек из `tsconfig.json` и выставляет соответствующие опции Oxc Transformer. Для каждого файла берётся ближайший родительский `tsconfig.json`. Если в нём есть [`references`](https://www.typescriptlang.org/tsconfig/#references), используется указанный конфиг, подходящий под [`include`](https://www.typescriptlang.org/tsconfig/#include) и [`exclude`](https://www.typescriptlang.org/tsconfig/#exclude).

Если опция задана и в конфиге Vite, и в `tsconfig.json`, приоритет у конфига Vite.

Некоторые поля `compilerOptions` в `tsconfig.json` требуют внимания.

#### `isolatedModules`

- [Документация TypeScript](https://www.typescriptlang.org/tsconfig#isolatedModules)

Должно быть `true`.

Oxc транспилирует без информации о типах и не поддерживает, например, const enum и неявные type-only импорты.

Задайте `"isolatedModules": true` в `compilerOptions`, чтобы TypeScript предупреждал о несовместимых с изолированной транспиляцией возможностях.

Если зависимость плохо живёт с `"isolatedModules": true`, временно поможет `"skipLibCheck": true`, пока не исправят upstream.

#### `useDefineForClassFields`

- [Документация TypeScript](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

По умолчанию `true`, если `target` TypeScript — `ES2022` или новее, включая `ESNext`, как в [TypeScript 4.3.2+](https://github.com/microsoft/TypeScript/pull/42663).
Для более старых target по умолчанию `false`.

`true` соответствует стандартному поведению ECMAScript в рантайме.

Если библиотека сильно завязана на поля классов, сверьтесь с её ожиданиями.
Чаще ждут `"useDefineForClassFields": true`; при необходимости явно задайте `useDefineForClassFields: false`.

#### `target`

- [Документация TypeScript](https://www.typescriptlang.org/tsconfig#target)

Vite игнорирует `target` из `tsconfig.json`, как [esbuild](https://esbuild.github.io/).

Цель в dev — [`oxc.target`](/config/shared-options.html#oxc), по умолчанию `esnext` для минимальной транспиляции. В сборках приоритетнее [`build.target`](/config/build-options.html#build-target) над `oxc.target`.

#### `emitDecoratorMetadata`

- [Документация TypeScript](https://www.typescriptlang.org/tsconfig#emitDecoratorMetadata)

Поддержка частичная. Полная требует вывода типов компилятором TypeScript, чего нет. Подробности — [в документации Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer/typescript#decorators).

#### `paths`

- [Документация TypeScript](https://www.typescriptlang.org/tsconfig/#paths)

`resolve.tsconfigPaths: true` заставляет Vite резолвить импорты по `paths` из `tsconfig.json`.

Есть цена по производительности; команда TypeScript [не рекомендует](https://www.typescriptlang.org/tsconfig/#paths:~:text=Note%20that%20this%20feature%20does%20not%20change%20how%20import%20paths%20are%20emitted%20by%20tsc%2C%20so%20paths%20should%20only%20be%20used%20to%20inform%20TypeScript%20that%20another%20tool%20has%20this%20mapping%20and%20will%20use%20it%20at%20runtime%20or%20when%20bundling.) менять поведение внешних инструментов только через `paths`.

#### Другие опции, влияющие на результат сборки

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)

::: tip `skipLibCheck`
В стартовых шаблонах Vite по умолчанию `"skipLibCheck": "true"`, чтобы не проверять типы в зависимостях — они могут рассчитывать на конкретные версии TS. Подробнее: [vuejs/vue-cli#5688](https://github.com/vuejs/vue-cli/pull/5688).
:::

### Типы для клиента

Типы Vite по умолчанию относятся к Node.js API. Для шима окружения клиентского кода добавьте `vite/client` в `compilerOptions.types` в `tsconfig.json`:

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

Если задан [`compilerOptions.types`](https://www.typescriptlang.org/tsconfig#types), в глобальную область попадут только эти пакеты (не все видимые `@types`). Так рекомендуется с TS 5.9.

::: details Тройной слэш-директивой

Либо добавьте файл объявлений `d.ts`:

```typescript [vite-env.d.ts]
/// <reference types="vite/client" />
```

:::

`vite/client` даёт шимы для:

- импорта ресурсов (например `.svg`);
- [констант](./env-and-mode#env-variables), которые подставляет Vite, на `import.meta.env`;
- [HMR API](./api-hmr) на `import.meta.hot`.

::: tip
Чтобы переопределить типы по умолчанию, добавьте файл с объявлениями и подключите ссылку на типы **перед** `vite/client`.

Например, чтобы импорт `*.svg` по умолчанию был React-компонентом:

- `vite-env-override.d.ts` (ваши объявления):
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- При `compilerOptions.types` включите файл в `tsconfig.json`:
  ```json [tsconfig.json]
  {
    "include": ["src", "./vite-env-override.d.ts"]
  }
  ```
- При тройном слэше обновите файл со ссылкой на `vite/client` (обычно `vite-env.d.ts`):
  ```ts
  /// <reference types="./vite-env-override.d.ts" />
  /// <reference types="vite/client" />
  ```

:::

## HTML

HTML — [в центре](/guide/#index-html-and-project-root) проекта на Vite: точки входа приложения, удобно для SPA и [MPA](/guide/build.html#multi-page-app).

Любой HTML в корне доступен по соответствующему пути:

- `<root>/index.html` -> `http://localhost:5173/`
- `<root>/about.html` -> `http://localhost:5173/about.html`
- `<root>/blog/index.html` -> `http://localhost:5173/blog/index.html`

Ресурсы из `<script type="module" src>`, `<link href>` и перечисленных ниже элементов обрабатываются и попадают в бандл приложения. Поддерживаемые элементы:

- `<audio src>`
- `<embed src>`
- `<img src>` and `<img srcset>`
- `<image href>` and `<image xlink:href>`
- `<input src>`
- `<link href>` and `<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>` and `<source srcset>`
- `<track src>`
- `<use href>` and `<use xlink:href>`
- `<video src>` and `<video poster>`
- `<meta content>`
  - только если атрибут `name` — `msapplication-tileimage`, `msapplication-square70x70logo`, `msapplication-square150x150logo`, `msapplication-wide310x150logo`, `msapplication-square310x310logo`, `msapplication-config` или `twitter:image`
  - или если атрибут `property` — `og:image`, `og:image:url`, `og:image:secure_url`, `og:audio`, `og:audio:secure_url`, `og:video` или `og:video:secure_url`

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Чтобы не обрабатывать отдельные теги, добавьте атрибут `vite-ignore` — удобно для внешних ресурсов или CDN.

## Фреймворки

Современные фреймворки поддерживают Vite. Плагины чаще всего ведут команды фреймворков; официальные плагины Vue и React для Vite — в организации vite:

- Vue support via [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- Vue JSX support via [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- React support via [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- React using SWC support via [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react-swc)
- [React Server Components (RSC)](https://react.dev/reference/rsc/server-components) support via [@vitejs/plugin-rsc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc)

Подробнее — [руководство по плагинам](/plugins/).

## JSX

`.jsx` и `.tsx` поддерживаются из коробки; трансформация JSX — через [Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer/).

Выбранный фреймворк обычно уже настраивает JSX (для Vue — [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx): HMR, глобальные компоненты, директивы, слоты).

Для своего фреймворка задайте `jsxFactory` и `jsxFragment` через [`oxc`](/config/shared-options.md#oxc). Например, для Preact:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  oxc: {
    jsx: {
      importSource: 'preact',
    },
  },
})
```

Подробнее — [документация Oxc Transformer по JSX](https://oxc.rs/docs/guide/usage/transformer/jsx.html).

Хелперы JSX можно подставить через `jsxInject` (опция только у Vite), без ручных импортов:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  oxc: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

Импорт `.css` вставляет стили на страницу через `<style>` с поддержкой HMR.

### Инлайн `@import` и пересчёт путей

`@import` в CSS инлайнится через `postcss-import`; алиасы Vite учитываются и в `@import`. Все `url()` в CSS, даже из файлов в других каталогах, пересчитываются для корректных путей.

То же для Sass и Less — см. [препроцессоры CSS](#css-pre-processors).

### PostCSS

Если есть валидный конфиг PostCSS (любой формат [postcss-load-config](https://github.com/postcss/postcss-load-config), например `postcss.config.js`), он применяется ко всем импортируемым CSS.

Минификация CSS идёт после PostCSS и использует [`build.cssTarget`](/config/build-options.md#build-csstarget).

### CSS Modules

Файлы с суффиксом `.module.css` — [CSS Modules](https://github.com/css-modules/css-modules). Импорт возвращает объект модуля:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---cut---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

Поведение настраивается [`css.modules`](/config/shared-options.md#css-modules).

Если `css.modules.localsConvention` включает camelCase для локальных имён (например `localsConvention: 'camelCaseOnly'`), доступны именованные импорты:

```js twoslash
import 'vite/client'
// ---cut---
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### Препроцессоры CSS

Vite ориентирован на современные браузеры: разумны нативные CSS-переменные и PostCSS-плагины по черновикам CSSWG (например [postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting)) и «чистый» CSS к будущим стандартам.

Встроенная поддержка есть для `.scss`, `.sass`, `.less`, `.styl` и `.stylus`. Отдельные плагины Vite не нужны, но сам препроцессор установить нужно:

```bash
# .scss and .sass
npm add -D sass-embedded # or sass

# .less
npm add -D less

# .styl and .stylus
npm add -D stylus
```

Во Vue SFC это автоматически включает `<style lang="sass">` и аналоги.

Для Sass и Less Vite улучшает разрешение `@import` с учётом алиасов; относительные `url()` во вложенных файлах пересчитываются. `url()` от переменных или интерполяции — не поддерживается из‑за ограничений API.

Для Stylus алиасы в `@import` и пересчёт `url()` не поддерживаются — ограничения API.

CSS Modules с препроцессором: добавьте `.module` к расширению, например `style.module.scss`.

### Без вставки CSS на страницу

Автовставку можно отключить параметром `?inline`: строка CSS по-прежнему в default export модуля, но в DOM не добавляется.

```js twoslash
import 'vite/client'
// ---cut---
import './foo.css' // will be injected into the page
import otherStyles from './bar.css?inline' // will not be injected
```

::: tip ПРИМЕЧАНИЕ
С Vite 5 default и именованные импорты из CSS (например `import style from './foo.css'`) убраны. Используйте `?inline`.
:::

### Lightning CSS

По умолчанию для минификации CSS в production используется [Lightning CSS](https://lightningcss.dev/); остальная обработка — через PostCSS.

Экспериментально можно перевести всю обработку CSS на Lightning CSS: [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer).

Опции Lightning CSS — в [`css.lightningcss`](../config/shared-options.md#css-lightningcss). Для CSS Modules в этом режиме — [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html), а не [`css.modules`](../config/shared-options.md#css-modules) (оно для PostCSS).

## Статические ресурсы

<ScrimbaLink href="https://scrimba.com/intro-to-vite-c03p6pbbdq/~05pq?via=vite" title="Статические ресурсы в Vite">Интерактивный урок на Scrimba</ScrimbaLink>

Импорт статики даёт публичный URL при отдаче:

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Специальные query меняют способ загрузки ресурсов:

```js twoslash
import 'vite/client'
// ---cut---
// Explicitly load assets as URL (automatically inlined depending on the file size)
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
// ---cut---
// Load assets as strings
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
// ---cut---
// Load Web Workers
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
// ---cut---
// Web Workers inlined as base64 strings at build time
import InlineWorker from './worker.js?worker&inline'
```

Подробнее — [статические ресурсы](./assets).

## JSON

JSON импортируется напрямую; поддерживаются именованные импорты:

```js twoslash
import 'vite/client'
// ---cut---
// import the entire object
import json from './example.json'
// import a root field as named exports - helps with tree-shaking!
import { field } from './example.json'
```

## Glob-импорт

Несколько модулей с диска — через `import.meta.glob`:

```js twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob('./dir/*.js')
```

Превращается в:

```js
// code produced by vite
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

Дальше можно обойти ключи объекта `modules` и подгрузить модули:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Совпавшие файлы по умолчанию подгружаются лениво через динамический `import` и при сборке попадают в отдельные чанки. Чтобы импортировать все сразу (например нужны побочные эффекты до остального кода), передайте вторым аргументом `{ eager: true }`:

```js twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

Превращается в:

```js
// code produced by vite
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### Несколько шаблонов

Первым аргументом может быть массив glob-шаблонов, например:

```js twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### Отрицательные шаблоны

Поддерживаются отрицательные glob (префикс `!`). Чтобы исключить файлы из результата, добавьте паттерны исключения в первый аргумент:

```js twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// code produced by vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### Именованные импорты

Можно импортировать только части модулей через опцию `import`.

```ts twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// code produced by vite
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

Вместе с `eager` для этих модулей возможен tree-shaking.

```ts twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// code produced by vite:
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

Задайте `import: 'default'` для импорта default-экспорта.

```ts twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// code produced by vite:
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### Пользовательские query

Опция `query` задаёт суффиксы импорта, например ресурс [как строка](/guide/assets.html#importing-asset-as-string) или [как URL](/guide/assets.html#importing-asset-as-url):

```ts twoslash
import 'vite/client'
// ---cut---
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// code produced by vite:
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

Произвольные query можно передать для обработки другими плагинами:

```ts twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

#### Базовый путь

Опция `base` задаёт базовый каталог для импортов:

```ts twoslash
import 'vite/client'
// ---cut---
const modulesWithBase = import.meta.glob('./**/*.js', {
  base: './base',
})
```

```ts
// code produced by vite:
const modulesWithBase = {
  './dir/foo.js': () => import('./base/dir/foo.js'),
  './dir/bar.js': () => import('./base/dir/bar.js'),
}
```

`base` — только путь к каталогу относительно файла с импортом или абсолютный от корня проекта. Алиасы и виртуальные модули не поддерживаются.

Относительно разрешённого `base` интерпретируются только glob’ы с относительными путями.

Ключи результирующих модулей при необходимости пересчитываются относительно `base`.

### Ограничения glob-импорта

Имейте в виду:

- это возможность только Vite, не стандарт веба или ES;
- glob обрабатываются как спецификаторы импорта: относительные (`./`), абсолютные от корня проекта (`/`) или алиас (см. [`resolve.alias`](/config/shared-options.md#resolve-alias));
- сопоставление через [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) — см. [поддерживаемые шаблоны](https://superchupu.dev/tinyglobby/comparison);
- все аргументы `import.meta.glob` должны быть **литералами**; переменные и выражения нельзя.

## Динамический import

Как и [glob-импорт](#glob-import), поддерживается динамический `import` с переменными.

```ts
const module = await import(`./dir/${file}.js`)
```

Переменная задаёт только имя файла на один уровень вложенности. Если `file` — `'foo/bar'`, импорт упадёт. Для сложных случаев используйте [glob-импорт](#glob-import).

Чтобы такой импорт попал в бандл, должны выполняться правила:

- начало с `./` или `../`: ``import(`./dir/${foo}.js`)`` допустимо, ``import(`${foo}.js`)`` — нет;
- обязательно расширение файла: ``import(`./dir/${foo}.js`)`` ок, ``import(`./dir/${foo}`)`` — нет;
- в своей директории нужен паттерн имени: ``import(`./prefix-${foo}.js`)`` ок, ``import(`./${foo}.js`)`` — нет.

Так исключают случайный импорт лишних файлов; иначе `import(foo)` мог бы затянуть всю файловую систему.

## WebAssembly

Скомпилированные `.wasm` импортируются с `?init`.
Default export — функция инициализации, возвращающая Promise с [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance):

```js twoslash
import 'vite/client'
// ---cut---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

Функция `init` может принять `importObject` — второй аргумент [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate):

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---cut---
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

В production `.wasm` меньше `assetInlineLimit` инлайнятся в base64; иначе это [статический ресурс](./assets) и подгружается по запросу.

::: tip ПРИМЕЧАНИЕ
[ES Module Integration для WebAssembly](https://github.com/WebAssembly/esm-integration) пока не поддерживается.
Используйте [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) или другие плагины сообщества.
:::

::: warning Для SSR поддерживаются только среды, совместимые с Node.js

Универсального способа прочитать файл нет: реализация `.wasm?init` опирается на `node:fs`. Для SSR-сборок это работает только в средах, совместимых с Node.js.

:::

### Доступ к модулю WebAssembly

Если нужен объект `Module` (например несколько инстансов), возьмите [явный импорт URL](./assets#explicit-url-imports) и инстанцируйте вручную:

```js twoslash
import 'vite/client'
// ---cut---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

## Web Workers

### Через конструкторы

Скрипт воркера подключают через [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) и [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker). По сравнению с суффиксами `?worker` это ближе к стандартам и **рекомендуемый** способ.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

У конструктора есть опции, например для «модульных» воркеров:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

Распознавание сработает только если `new URL()` вызывается прямо внутри `new Worker()`. Параметры опций должны быть статическими (строковые литералы).

### Через суффиксы в импорте

Скрипт воркера можно импортировать с `?worker` или `?sharedworker`. Default export — конструктор воркера:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

В скрипте воркера можно использовать ESM `import` вместо `importScripts()`. **Важно**: в dev нужна [нативная поддержка module worker](https://caniuse.com/?search=module%20worker) в браузере; в production это компилируется.

По умолчанию воркер — отдельный чанк в production. Для инлайна в base64 добавьте query `inline`:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker&inline'
```

Чтобы получить URL воркера, добавьте `url`:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker&url'
```

Настройка бандлинга всех воркеров — [Worker Options](/config/worker-options.md).

## Content Security Policy (CSP)

Из‑за внутреннего устройства Vite для CSP нужны определённые директивы или настройки.

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

Если задан [`html.cspNonce`](/config/shared-options#html-cspnonce), Vite добавляет атрибут `nonce` с указанным значением к `<script>`, `<style>`, а также к `<link>` стилей и module preload. Также вставляется `<meta property="csp-nonce" nonce="PLACEHOLDER" />`.

Значение nonce из meta с `property="csp-nonce"` Vite подставляет при необходимости и в dev, и после сборки.

:::warning
Подставляйте уникальный nonce на каждый запрос вместо плейсхолдера — иначе политику ресурса легко обойти.
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

По умолчанию при сборке мелкая статика инлайнится как data URI. Нужно разрешить `data:` в соответствующих директивах (например [`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src), [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src)) или отключить инлайн через [`build.assetsInlineLimit: 0`](/config/build-options#build-assetsinlinelimit).

:::warning
Не разрешайте `data:` в [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) — это открывает путь к произвольным скриптам.
:::

## Лицензии

Опция [`build.license`](/config/build-options.md#build-license) генерирует файл со сводкой лицензий зависимостей сборки; его можно отдавать со статики для отображения и благодарностей.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    license: true,
  },
})
```

Будет создан `.vite/license.md` примерно такого вида:

```md
# Лицензии

В приложении используются зависимости со следующими лицензиями:

## dep-1 - 1.2.3 (CC0-1.0)

CC0 1.0 Universal

...

## dep-2 - 4.5.6 (MIT)

MIT License

...
```

Чтобы отдавать файл по другому пути, передайте например `{ fileName: 'license.md' }` — тогда URL будет вроде `https://example.com/license.md`. Подробнее — [`build.license`](/config/build-options.md#build-license).

## Оптимизации сборки

> Ниже перечисленное включается автоматически в процессе сборки; отдельная настройка не нужна, если вы сами не отключаете поведение.

### Разбиение CSS (CSS code splitting)

Vite выносит CSS, используемый модулями асинхронного чанка, в отдельный файл. CSS подключается через `<link>` при загрузке этого чанка, а выполнение чанка откладывается до загрузки стилей, чтобы избежать [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.).

Чтобы весь CSS был в одном файле, отключите разбиение: [`build.cssCodeSplit`](/config/build-options.md#build-csscodesplit) = `false`.

### Генерация preload-директив

Vite сам добавляет `<link rel="modulepreload">` для entry-чанков и их прямых импортов в собранном HTML.

### Оптимизация загрузки асинхронных чанков

В реальных приложениях Rollup часто выделяет «общие» чанки — код, общий для двух и более чанков. Вместе с динамическими импортами типична такая картина:

<script setup>
import graphSvg from '../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

Без оптимизации при импорте асинхронного чанка `A` браузер сначала запрашивает и парсит `A`, и только потом узнаёт про общий чанк `C` — лишний сетевой раундтрип:

```
Entry ---> A ---> C
```

Vite переписывает разбитые динамические импорты с шагом preload: при запросе `A` чанк `C` запрашивается **параллельно**:

```
Entry ---> (A + C)
```

У `C` могут быть свои импорты — без оптимизации раундтрипов станет ещё больше. Оптимизация Vite прослеживает прямые импорты и убирает лишние раундтрипы на любой глубине.
