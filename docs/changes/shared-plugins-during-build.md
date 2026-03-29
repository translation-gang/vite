# Общие плагины во время сборки

::: tip Обратная связь
Оставьте отзыв в [обсуждении обратной связи по Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

См. [Общие плагины во время сборки](/guide/api-environment-plugins.md#shared-plugins-during-build).

Затронутая область: `авторы плагинов Vite`

::: warning Будущее изменение по умолчанию
`builder.sharedConfigBuild` впервые появился в `v6.0`. Можно установить его в `true`, чтобы проверить, как плагины работают с общей конфигурацией. Мы собираем обратную связь о смене значения по умолчанию в будущей мажорной версии, когда экосистема плагинов будет готова.
:::

## Мотивация

Согласовать конвейеры плагинов в dev и при сборке.

## Руководство по миграции

Чтобы делить плагины между средами, состояние плагина должно быть привязано к текущей среде. Плагин следующего вида подсчитывает число трансформированных модулей по всем средам.

```js
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}
```

Если нужно считать число трансформированных модулей для каждой среды отдельно, храните карту:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    }
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

Чтобы упростить этот паттерн, Vite экспортирует хелпер `perEnvironmentState`:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = perEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    }
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```
