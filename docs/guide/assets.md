# Работа со статическими ресурсами

- См. также: [Публичный базовый путь](./build#public-base-path)
- См. также: [опция конфигурации `assetsInclude`](/config/shared-options.md#assetsinclude)

## Импорт ресурса как URL

Импорт статического ресурса даёт публичный URL после отдачи:

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Например, в разработке `imgUrl` будет `/src/img.png`, а в production-сборке — `/assets/img.2d8efhg.png`.

Поведение близко к `file-loader` в webpack. Отличие в том, что импорт может быть абсолютным публичным путём (от корня проекта в dev) или относительным.

- Ссылки `url()` в CSS обрабатываются так же.

- С плагином Vue ссылки на ресурсы в шаблонах SFC автоматически превращаются в импорты.

- Распространённые типы изображений, медиа и шрифтов распознаются как ресурсы. Список расширяется [`assetsInclude`](/config/shared-options.md#assetsinclude).

- Упомянутые ресурсы входят в граф сборки, получают хэш в имени файла и могут обрабатываться плагинами.

- Ресурсы меньше порога [`assetsInlineLimit`](/config/build-options.md#build-assetsinlinelimit) инлайнятся как data URL в base64.

- Заглушки Git LFS автоматически не инлайнятся — в них нет содержимого файла. Для инлайна скачайте файлы через Git LFS до сборки.

- TypeScript по умолчанию не считает импорты статики валидными модулями. Подключите [`vite/client`](./features#client-types).

::: tip Инлайн SVG через `url()`
Если в JS вручную собираете `url()` для SVG, переменную с URL нужно обернуть в двойные кавычки.

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### Явные импорты URL

Ресурсы не из внутреннего списка и не из `assetsInclude` можно явно импортировать как URL с суффиксом `?url`. Полезно, например, для [Houdini Paint Worklets](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static).

```js twoslash
import 'vite/client'
// ---cut---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Явное управление инлайном

Ресурсы можно явно импортировать с инлайном или без: суффиксы `?inline` и `?no-inline`.

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### Импорт ресурса как строки

Строка — суффикс `?raw`.

```js twoslash
import 'vite/client'
// ---cut---
import shaderString from './shader.glsl?raw'
```

### Импорт скрипта как воркера

Веб-воркеры — суффиксы `?worker` или `?sharedworker`.

```js twoslash
import 'vite/client'
// ---cut---
// Separate chunk in the production build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---cut---
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---cut---
// Inlined as base64 strings
import InlineWorker from './shader.js?worker&inline'
```

Подробнее — в разделе [Web Workers](./features.md#web-workers).

## Каталог `public`

Подходит для ресурсов, которые:

- нигде не импортируются из кода (например `robots.txt`);
- должны сохранять точное имя файла (без хэша);
- или их не хочется импортировать только ради URL.

Такие файлы кладите в каталог `public` в корне проекта. В dev они отдаются с корня `/`, в dist копируются в корень как есть.

По умолчанию это `<root>/public`, путь задаётся [`publicDir`](/config/shared-options.md#publicdir).

Ссылайтесь на ресурсы из `public` абсолютным путём от корня: `public/icon.png` в коде — `/icon.png`.

::: tip Импорт или `public`

В общем случае предпочитайте **импорт ресурсов**, если не нужны гарантии, которые даёт каталог `public`.

:::

## `new URL(url, import.meta.url)`

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) в ESM даёт URL текущего модуля. Вместе с нативным [конструктором URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) можно получить полный URL статики по относительному пути из JS-модуля:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

В современных браузерах это работает нативно — в разработке Vite может вообще не трогать этот код.

Шаблонные строки дают динамические URL:

```js
function getImageUrl(name) {
  // note that this does not include files in subdirectories
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

В production Vite при необходимости преобразует код так, чтобы URL оставались верными после бандлинга и хэширования. Строка URL должна быть статически анализируемой, иначе код останется как есть — возможны ошибки во время выполнения, если `build.target` не поддерживает `import.meta.url`.

```js
// Vite will not transform this
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details Как это устроено

Vite может преобразовать `getImageUrl` примерно так:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Не работает с SSR
Этот шаблон не подходит для SSR на Vite: у `import.meta.url` разная семантика в браузере и в Node.js. В серверном бандле заранее неизвестен клиентский host URL.
:::
