# SSR с API `ModuleRunner`

::: tip Обратная связь
Оставьте отзыв в [обсуждении обратной связи по Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

`server.ssrLoadModule` заменён импортом из [Module Runner](/guide/api-environment#modulerunner).

Затронутая область: `авторы плагинов Vite`

::: warning Будущее устаревание
`ModuleRunner` впервые появился в `v6.0`. Отказ от `server.ssrLoadModule` запланирован на будущую мажорную версию. Чтобы найти использование, установите в конфиге Vite `future.removeSsrLoadModule` в `"warn"`.
:::

## Мотивация

`server.ssrLoadModule(url)` позволял импортировать модули только в среде `ssr` и выполнять их только в том же процессе, что и Vite dev-сервер. У приложений с пользовательскими средами каждая связана с `ModuleRunner`, который может работать в отдельном потоке или процессе. Для импорта модулей теперь используется `moduleRunner.import(url)`.

## Руководство по миграции

См. [Руководство по Environment API для фреймворков](../guide/api-environment-frameworks.md).

`server.ssrFixStacktrace` и `server.ssrRewriteStacktrace` не нужно вызывать при использовании API Module Runner. Стеки обновятся, если только `sourcemapInterceptor` не установлен в `false`.
