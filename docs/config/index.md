---
title: Настройка Vite
---

# Настройка Vite

При запуске `vite` из командной строки Vite автоматически пытается найти файл конфигурации с именем `vite.config.js` в [корне проекта](/guide/#index-html-and-project-root) (поддерживаются и другие расширения JS и TS).

Минимальный файл конфигурации выглядит так:

```js [vite.config.js]
export default {
  // config options
}
```

Обратите внимание: Vite поддерживает синтаксис ES-модулей в файле конфигурации даже если проект не использует нативный Node ESM, например `"type": "module"` в `package.json`. В этом случае файл конфигурации перед загрузкой автоматически предобрабатывается.

Также можно явно указать файл конфигурации через опцию CLI `--config` (разрешается относительно `cwd`):

```bash
vite --config my-config.js
```

<ScrimbaLink href="https://scrimba.com/intro-to-vite-c03p6pbbdq/~05jg?via=vite" title="Настройка Vite">Интерактивный урок на Scrimba</ScrimbaLink>

::: tip ЗАГРУЗКА КОНФИГУРАЦИИ
По умолчанию Vite использует [Rolldown](https://rolldown.rs/) для сборки конфига во временный файл и его загрузки. Это может вызывать проблемы при импорте TypeScript-файлов в монорепозитории. Если такой подход даёт сбои, укажите `--configLoader runner`, чтобы использовать [module runner](/guide/api-environment-runtimes.html#modulerunner) — временный конфиг не создаётся, файлы преобразуются на лету. Учтите: module runner не поддерживает CJS в файлах конфигурации, внешние CJS-пакеты должны работать как обычно.

Либо, если ваша среда поддерживает TypeScript (например `node --experimental-strip-types`) или вы пишете только обычный JavaScript, можно указать `--configLoader native` и загружать конфиг нативной средой выполнения. Обновления модулей, импортируемых конфигом, не отслеживаются, поэтому сервер Vite не перезапустится автоматически.
:::

## Подсказки IDE для конфигурации

В Vite есть типы TypeScript — можно использовать подсказки IDE с jsdoc:

```js
/** @type {import('vite').UserConfig} */
export default {
  // ...
}
```

Альтернатива — хелпер `defineConfig`: подсказки без jsdoc:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Поддерживаются и TypeScript-файлы конфигурации: `vite.config.ts` с `defineConfig` или с оператором `satisfies`:

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## Условная конфигурация

Если опции должны зависеть от команды (`serve` или `build`), [режима](/guide/env-and-mode#modes), SSR-сборки (`isSsrBuild`) или предпросмотра (`isPreview`), можно экспортировать функцию:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // dev specific config
    }
  } else {
    // command === 'build'
    return {
      // build specific config
    }
  }
})
```

В API Vite значение `command` равно `serve` в режиме разработки (в CLI [`vite`](/guide/cli#vite), `vite dev` и `vite serve` — синонимы) и `build` при production-сборке ([`vite build`](/guide/cli#vite-build)).

`isSsrBuild` и `isPreview` — дополнительные флаги для различения видов команд `build` и `serve`. Некоторые инструменты, загружающие конфиг Vite, могут не передавать эти флаги и подставят `undefined`. Рекомендуется явно сравнивать с `true` и `false`.

## Асинхронная конфигурация

Если конфиг должен вызывать асинхронные функции, экспортируйте асинхронную функцию. Её можно обернуть в `defineConfig` для лучших подсказок IDE:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // vite config
  }
})
```

## Переменные окружения в конфиге

Пока вычисляется сам конфиг, доступны только переменные, уже присутствующие в окружении процесса (`process.env`). Vite намеренно откладывает загрузку файлов `.env*` до **после** разрешения пользовательского конфига: набор файлов зависит от опций вроде [`root`](/guide/#index-html-and-project-root) и [`envDir`](/config/shared-options.md#envdir), а также от итогового `mode`.

Итого: переменные из `.env`, `.env.local`, `.env.[mode]` или `.env.[mode].local` **не** попадают автоматически в `process.env` во время выполнения `vite.config.*`. Позже они загружаются и доступны коду приложения через `import.meta.env` (с префиксом `VITE_` по умолчанию), как в [Переменных окружения и режимах](/guide/env-and-mode.html). Если нужно только передать значения из `.env*` в приложение, в конфиге ничего вызывать не обязательно.

Если значения из `.env*` должны влиять на сам конфиг (например `server.port`, условное включение плагинов или подстановки `define`), загрузите их вручную через экспортируемый хелпер [`loadEnv`](/guide/api-javascript.html#loadenv).

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      // Provide an explicit app-level constant derived from an env var.
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    // Example: use an env var to set the dev server port conditionally.
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173,
    },
  }
})
```

## Отладка файла конфигурации в VS Code

При поведении по умолчанию `--configLoader bundle` Vite записывает сгенерированный временный конфиг в `node_modules/.vite-temp`, из‑за чего при отладке с точками останова в конфиге возникает ошибка «файл не найден». Чтобы исправить, добавьте в `.vscode/settings.json`:

```json
{
  "debug.javascript.terminalOptions": {
    "resolveSourceMapLocations": [
      "${workspaceFolder}/**",
      "!**/node_modules/**",
      "**/node_modules/.vite-temp/**"
    ]
  }
}
```
