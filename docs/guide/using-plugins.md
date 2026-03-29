# Использование плагинов

Vite расширяется плагинами, основанными на продуманном интерфейсе Rollup с несколькими опциями, специфичными для Vite. Пользователи Vite могут опираться на зрелую экосистему плагинов Rollup и при необходимости расширять dev-сервер и SSR.

<ScrimbaLink href="https://scrimba.com/intro-to-vite-c03p6pbbdq/~0y4g?via=vite" title="Плагины в Vite">Интерактивный урок на Scrimba</ScrimbaLink>

## Подключение плагина

Плагин добавляется в `devDependencies` проекта и в массив `plugins` в `vite.config.js`. Например, для поддержки устаревших браузеров можно использовать официальный [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy):

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

В `plugins` можно передавать пресеты — несколько плагинов одним элементом. Это удобно для сложных возможностей (например интеграции фреймворка), реализованных несколькими плагинами. Массив внутри схлопывается.

Плагины со значением falsy игнорируются — так можно просто включать и отключать плагины.

## Поиск плагинов

:::tip ПРИМЕЧАНИЕ
Vite стремится покрывать распространённые сценарии веб-разработки из коробки. Прежде чем искать плагин для Vite или совместимый с Rollup, посмотрите [руководство по возможностям](../guide/features.md). Многое из того, для чего в Rollup нужен плагин, в Vite уже есть.
:::

Официальные плагины описаны в разделе [Плагины](../plugins/). Сообщественные плагины в npm перечислены в [Vite Plugin Registry](https://registry.vite.dev/plugins).

## Порядок выполнения плагинов

Для совместимости с некоторыми плагинами Rollup иногда нужно зафиксировать порядок или применять плагин только при сборке. Для плагинов Vite это деталь реализации. Позицию задаёт модификатор `enforce`:

- `pre`: плагин до основных плагинов Vite
- по умолчанию: после основных плагинов Vite
- `post`: после плагинов сборки Vite

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

Подробности — в [руководстве по API плагинов](./api-plugin.md#plugin-ordering).

## Условное применение

По умолчанию плагины вызываются и при `serve`, и при `build`. Если плагин нужен только в одном режиме, используйте свойство `apply` со значением `'build'` или `'serve'`:

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## Разработка плагинов

См. [руководство по API плагинов](./api-plugin.md).
