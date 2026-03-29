# Производительность

Vite быстр из коробки, но по мере роста проекта возможны проблемы. Здесь — как находить и устранять типичные узкие места:

- долгий старт сервера
- медленная загрузка страницы
- медленная сборка

## Проверьте браузер

Расширения могут мешать запросам и замедлять старт и перезагрузку, особенно с открытыми DevTools. Имеет смысл отдельный профиль без расширений или режим инкогнито при работе с dev-сервером Vite.

Vite агрессивно кэширует pre-bundle зависимостей и отдаёт 304 для исходников. Опция «Disable Cache» в DevTools сильно бьёт по старту и полной перезагрузке — отключайте только когда действительно нужно.

## Аудит плагинов Vite

Внутренние и официальные плагины стараются делать минимум работы. В dev часто regex, в build — полный разбор для корректности.

Сообщество-плагины Vite не контролирует. На что смотреть:

1. Тяжёлые зависимости, нужные не всегда — подгружать динамически, чтобы ускорить старт Node. Примеры: [vite-plugin-react#212](https://github.com/vitejs/vite-plugin-react/pull/212), [vite-plugin-pwa#224](https://github.com/vite-pwa/vite-plugin-pwa/pull/244).

2. Хуки `buildStart`, `config`, `configResolved` не должны долго блокировать — на них ждёт старт dev-сервера.

3. `resolveId`, `load`, `transform` могут неравномерно тормозить файлы. Имеет смысл ранние проверки (ключевое слово в `code`, расширение `id`) до тяжёлой трансформации.

   Чем дольше transform файла, тем выше водопад запросов в браузере.

   Длительность: `vite --debug plugin-transform` или [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect). Асинхронность даёт приблизительные цифры, но картина по «дорогим» операциям обычно ясна.

::: tip Профилирование
`vite --profile`, открыть сайт, в терминале `p` + Enter — запись `.cpuprofile`. Анализ в [speedscope](https://www.speedscope.app). Профили можно обсудить с командой Vite в [чате](https://chat.vite.dev).
:::

## Меньше операций resolve

Разрешение путей импорта в худшем случае дорогое. Например, [`resolve.extensions`](/config/shared-options.md#resolve-extensions) по умолчанию `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`.

Импорт `./Component` при наличии `./Component.jsx` даёт до 6 проверок ФС.

Явные пути (`import './Component.jsx'`) и сужение `resolve.extensions` уменьшают проверки (учитывайте `node_modules`).

Авторам плагинов: вызывайте [`this.resolve`](https://rollupjs.org/plugin-development/#this-resolve) только когда нужно.

::: tip TypeScript
`"moduleResolution": "bundler"` и `"allowImportingTsExtensions": true` в `tsconfig.json` — можно писать расширения `.ts`/`.tsx` в импортах.
:::

## Избегайте barrel-файлов

Barrel переэкспортирует API из каталога:

```js [src/utils/index.js]
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

При `import { slash } from './utils'` подтягиваются и обрабатываются все модули бочки — лишняя работа при первой загрузке.

Лучше `import { slash } from './utils/slash.js'`. Подробнее: [issue #8237](https://github.com/vitejs/vite/issues/8237).

## Прогрев часто используемых файлов

Dev-сервер трансформирует по запросу браузера — быстрый старт. Водопады возможны, если часть файлов долго трансформируется:

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

Граф импортов виден после transform родителя. [`server.warmup`](/config/server-options.md#server-warmup) заранее прогревает известные файлы (например `big-utils.js`).

Логи: `vite --debug transform`

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js [vite.config.js]
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

Прогревайте только реально частые файлы, иначе перегрузите старт. См. [`server.warmup`](/config/server-options.md#server-warmup).

[`--open` или `server.open`](/config/server-options.html#server-open) тоже ускоряют: Vite прогревает entry или URL для открытия.

## Меньше или нативные инструменты

С ростом кодовой базы важно снижать объём работы над JS/TS/CSS.

Меньше работы:

- CSS вместо Sass/Less/Stylus, где возможно (вложенность — PostCSS / Lightning CSS)
- Не превращать SVG в компоненты фреймворка — импорт как строка или URL

Нативные инструменты:

Ядро Vite уже на нативных решениях; часть фич по умолчанию остаётся на JS для совместимости.

- Экспериментальный [LightningCSS](https://github.com/vitejs/vite/discussions/13835)
