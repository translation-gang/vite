# Опции SSR

Если не указано иное, опции этого раздела применяются и к dev, и к build.

## ssr.external

- **Тип:** `string[] | true`
- **См. также:** [Внешние зависимости SSR](/guide/ssr#ssr-externals)

Вынести указанные зависимости и их транзитивные зависимости за пределы бандла SSR. По умолчанию все зависимости внешние, кроме связанных (linked) — для HMR. Чтобы вынести и linked-зависимость, укажите её имя здесь.

При `true` внешними становятся все зависимости, включая linked.

Явно перечисленные в `string[]` зависимости имеют приоритет, даже если они также указаны в `ssr.noExternal` (в любом виде).

## ssr.noExternal

- **Тип:** `string | RegExp | (string | RegExp)[] | true`
- **См. также:** [Внешние зависимости SSR](/guide/ssr#ssr-externals)

Не выносить перечисленные зависимости наружу при SSR — они попадут в бандл при сборке. По умолчанию только linked-зависимости не внешние (для HMR). Чтобы вынести linked-зависимость, укажите её в `ssr.external`.

При `true` ни одна зависимость не внешняя. Исключение: явно перечисленные в `ssr.external` (`string[]`) могут остаться внешними. При `ssr.target: 'node'` встроенные модули Node по умолчанию тоже внешние.

Если заданы и `ssr.noExternal: true`, и `ssr.external: true`, приоритет у `ssr.noExternal` — зависимости не внешние.

## ssr.target

- **Тип:** `'node' | 'webworker'`
- **По умолчанию:** `node`

Целевая среда для SSR-сервера.

## ssr.resolve.conditions

- **Тип:** `string[]`
- **По умолчанию:** `['module', 'node', 'development|production']` (`defaultServerConditions`) (`['module', 'browser', 'development|production']` (`defaultClientConditions`) при `ssr.target === 'webworker'`)
- **См. также:** [Условия разрешения](./shared-options.md#resolve-conditions)

Условия в конвейере плагинов; влияют только на невнешние зависимости при SSR-сборке. Для внешних импортов используйте `ssr.resolve.externalConditions`.

## ssr.resolve.externalConditions

- **Тип:** `string[]`
- **По умолчанию:** `['node']`

Условия при SSR-импорте (включая `ssrLoadModule`) прямых внешних зависимостей (внешних зависимостей, импортируемых Vite).

:::tip

При использовании этой опции запускайте Node с [флагом `--conditions`](https://nodejs.org/docs/latest/api/cli.html#-c-condition---conditionscondition) с теми же значениями в dev и после build для согласованного поведения.

Например, для `['node', 'custom']` в dev: `NODE_OPTIONS='--conditions custom' vite`, после сборки: `NODE_OPTIONS="--conditions custom" node ./dist/server.js`.

:::

## ssr.resolve.mainFields

- **Тип:** `string[]`
- **По умолчанию:** `['module', 'jsnext:main', 'jsnext']`

Поля `package.json`, перебираемые при разрешении точки входа пакета. Ниже приоритета, чем conditional exports из `exports`: если точка входа найдена через `exports`, main-поля игнорируются. Влияет только на невнешние зависимости.
