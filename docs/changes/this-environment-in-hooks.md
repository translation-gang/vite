# `this.environment` в хуках

::: tip Обратная связь
Оставьте отзыв в [обсуждении обратной связи по Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

До Vite 6 были доступны только две среды: `client` и `ssr`. Единственный аргумент хука плагина `options.ssr` в `resolveId`, `load` и `transform` позволял авторам плагинов различать эти две среды при обработке модулей в хуках плагинов. В Vite 6 приложение Vite может определять любое количество именованных сред по необходимости. В контекст плагина добавляется `this.environment` для работы со средой текущего модуля в хуках.

Затронутая область: `авторы плагинов Vite`

::: warning Будущее устаревание
`this.environment` появился в `v6.0`. Отказ от `options.ssr` запланирован на будущую мажорную версию. Тогда мы начнём рекомендовать миграцию плагинов на новый API. Чтобы найти использование, установите в конфиге Vite `future.removePluginHookSsrArgument` в `"warn"`.
:::

## Мотивация

`this.environment` позволяет не только узнать имя текущей среды в реализации хука плагина, но и получить доступ к опциям конфигурации среды, информации о графе модулей и конвейеру трансформаций (`environment.config`, `environment.moduleGraph`, `environment.transformRequest()`). Наличие экземпляра среды в контексте позволяет авторам плагинов не зависеть от всего dev-сервера (обычно кэшируемого при старте через хук `configureServer`).

## Руководство по миграции

Для быстрой миграции существующего плагина замените аргумент `options.ssr` на `this.environment.config.consumer === 'server'` в хуках `resolveId`, `load` и `transform`:

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [!code --]
      const isSSR = this.environment.config.consumer === 'server' // [!code ++]

      if (isSSR) {
        // логика для SSR
      } else {
        // логика для клиента
      }
    },
  }
}
```

Для более устойчивой долгосрочной реализации хук плагина должен учитывать [несколько сред](/guide/api-environment-plugins.html#accessing-the-current-environment-in-hooks), используя детальные опции среды вместо опоры только на имя среды.
