# Плагинный хук HMR `hotUpdate`

::: tip Обратная связь
Оставьте отзыв в [обсуждении обратной связи по Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

Планируется отказ от плагинного хука `handleHotUpdate` в пользу хука [`hotUpdate`](/guide/api-environment#the-hotupdate-hook), учитывающего [Environment API](/guide/api-environment.md), и обработки дополнительных событий наблюдения: `create` и `delete`.

Затронутая область: `авторы плагинов Vite`

::: warning Будущее устаревание
`hotUpdate` впервые появился в `v6.0`. Отказ от `handleHotUpdate` запланирован на будущую мажорную версию. Пока не рекомендуем отказываться от `handleHotUpdate`. Для экспериментов и обратной связи можно задать в конфиге Vite `future.removePluginHookHandleHotUpdate` в `"warn"`.
:::

## Мотивация

Хук [`handleHotUpdate`](/guide/api-plugin.md#handlehotupdate) позволяет выполнять пользовательскую обработку HMR-обновлений. В `HmrContext` передаётся список модулей для обновления.

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Этот хук вызывается один раз для всех сред, а переданные модули содержат смешанную информацию только из сред Client и SSR. Когда фреймворки перейдут на пользовательские среды, нужен новый хук, вызываемый для каждой из них.

Новый хук `hotUpdate` работает так же, как `handleHotUpdate`, но вызывается для каждой среды и получает экземпляр `HotUpdateOptions`:

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Текущую dev-среду можно получить так же, как в других хуках плагина, через `this.environment`. Список `modules` теперь содержит только узлы модулей текущей среды. Для каждой среды можно задать свою стратегию обновления.

Хук также вызывается для дополнительных событий наблюдения, а не только для `'update'`. Различайте их по полю `type`.

## Руководство по миграции

Отфильтруйте и сузьте список затронутых модулей, чтобы HMR был точнее.

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// Миграция на:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

Верните пустой массив и выполните полную перезагрузку:

```js
handleHotUpdate({ server, modules, timestamp }) {
  // инвалидация модулей вручную
  const invalidatedModules = new Set()
  for (const mod of modules) {
    server.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  server.ws.send({ type: 'full-reload' })
  return []
}

// Миграция на:

hotUpdate({ modules, timestamp }) {
  // инвалидация модулей вручную
  const invalidatedModules = new Set()
  for (const mod of modules) {
    this.environment.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  this.environment.hot.send({ type: 'full-reload' })
  return []
}
```

Верните пустой массив и выполните полностью пользовательскую обработку HMR, отправив на клиент пользовательские события:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// Миграция на:

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
