# Переход к API для каждой среды

::: tip Обратная связь
Оставьте отзыв в [обсуждении обратной связи по Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

Несколько API у `ViteDevServer`, связанных с графом модулей и трансформацией модулей, перенесены в экземпляры `DevEnvironment`.

Затронутая область: `авторы плагинов Vite`

::: warning Будущее устаревание
Экземпляр `Environment` впервые появился в `v6.0`. Отказ от `server.moduleGraph` и других методов, теперь находящихся в средах, запланирован на будущую мажорную версию. Пока не рекомендуем отказываться от методов сервера. Чтобы найти использование, задайте в конфиге Vite:

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerReloadModule: 'warn',
  removeServerPluginContainer: 'warn',
  removeServerHot: 'warn',
  removeServerTransformRequest: 'warn',
  removeServerWarmupRequest: 'warn',
}
```

:::

## Мотивация

В Vite v5 и раньше у одного Vite dev-сервера всегда было две среды (`client` и `ssr`). В `server.moduleGraph` смешивались модули обеих сред. Узлы связывались списками `clientImportedModules` и `ssrImportedModules` (но для каждого поддерживался один список `importers`). Трансформированный модуль задавался `id` и булевым `ssr`. Этот флаг нужно было передавать в API, например `server.moduleGraph.getModuleByUrl(url, ssr)` и `server.transformRequest(url, { ssr })`.

В Vite v6 можно создать любое число пользовательских сред (`client`, `ssr`, `edge` и т.д.). Одного булева `ssr` уже недостаточно. Вместо изменения API на вид `server.transformRequest(url, { environment })` эти методы перенесены в экземпляр среды, чтобы их можно было вызывать без Vite dev-сервера.

## Руководство по миграции

- `server.moduleGraph` → [`environment.moduleGraph`](/guide/api-environment-instances#separate-module-graphs)
- `server.reloadModule(module)` → `environment.reloadModule(module)`
- `server.pluginContainer` → `environment.pluginContainer`
- `server.transformRequest(url, ssr)` → `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` → `environment.warmupRequest(url)`
- `server.hot` → `server.client.environment.hot`
