# Переменные окружения и режимы

Vite выставляет ряд констант в объекте `import.meta.env`. В dev они доступны как глобальные переменные, при сборке подставляются статически, чтобы tree-shaking работал эффективно.

:::details Пример

```js
if (import.meta.env.DEV) {
  // code inside here will be tree-shaken in production builds
  console.log('Dev mode')
}
```

:::

<ScrimbaLink href="https://scrimba.com/intro-to-vite-c03p6pbbdq/~05an?via=vite" title="Env Variables in Vite">Интерактивный урок на Scrimba</ScrimbaLink>

## Встроенные константы

Всегда доступны:

- **`import.meta.env.MODE`**: {string} [режим](#modes), в котором работает приложение.

- **`import.meta.env.BASE_URL`**: {string} базовый URL, с которого отдаётся приложение. Задаётся опцией [`base`](/config/shared-options.md#base).

- **`import.meta.env.PROD`**: {boolean} production-режим (dev-сервер с `NODE_ENV='production'` или собранное приложение с `NODE_ENV='production'`).

- **`import.meta.env.DEV`**: {boolean} режим разработки (всегда противоположно `import.meta.env.PROD`)

- **`import.meta.env.SSR`**: {boolean} выполнение на [сервере](./ssr.md#conditional-logic).

## Переменные окружения

Vite автоматически пробрасывает переменные окружения в `import.meta.env` как строки.

Переменные с префиксом `VITE_` попадают в клиентский бандл после обработки Vite. Чтобы случайно не утекали секреты, не используйте этот префикс для чувствительных данных. Пример:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

Значение `VITE_SOME_KEY` — `"123"` — будет на клиенте; `DB_PASSWORD` — нет. Проверка в коде:

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // undefined
```

Свой префикс: опция [envPrefix](/config/shared-options.html#envprefix).

:::tip Разбор env
Как видно, `VITE_SOME_KEY` числовой в `.env`, но в коде это строка. То же для boolean. При использовании приводите к нужному типу.
:::

:::warning Секреты

В `VITE_*` не кладите чувствительные данные (API-ключи и т.п.): значения попадают в исходный код при сборке. В production секреты держите на бэкенде или в serverless/edge-функциях.

:::

### Файлы `.env` {#env-files}

Vite через [dotenv](https://github.com/motdotla/dotenv) подгружает переменные из файлов в [каталоге окружения](/config/shared-options.md#envdir):

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Приоритет загрузки env

Файл для конкретного режима (например `.env.production`) важнее общего `.env`.

Vite всегда грузит `.env` и `.env.local` вместе с `.env.[mode]`. Переменные из mode-файлов перекрывают общие, но объявленные только в `.env` / `.env.local` остаются доступны.

Переменные, уже заданные в окружении при запуске Vite, имеют наивысший приоритет и `.env` их не перезапишет. Например: `VITE_SOME_KEY=123 vite build`.

Файлы `.env` читаются при старте Vite. После правок перезапустите сервер.

:::

:::warning Пользователи Bun

У [Bun](https://bun.sh) `.env` подгружаются до скрипта и попадают в `process.env`, что может мешать Vite: существующие значения `process.env` имеют приоритет. Обходы: [oven-sh/bun#5515](https://github.com/oven-sh/bun/issues/5515).

:::

Также используется [dotenv-expand](https://github.com/motdotla/dotenv-expand) для подстановок. Синтаксис: [документация](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow).

Символ `$` в значении экранируйте `\`.

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

::: details Подстановка в обратном порядке

Vite поддерживает разворачивание переменных в обратном порядке.
Например, для `.env` ниже получится `VITE_FOO=foobar`, `VITE_BAR=bar`.

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

В shell и в `docker compose` так не работает.
Vite сохраняет поведение `dotenv-expand` и экосистемы JS.

Чтобы не ловить несовместимость, лучше на это не опираться. В будущем Vite может начать предупреждать.

:::

:::warning Локальные `.env`

`.env.*.local` только локально и могут содержать секреты. Добавьте `*.local` в `.gitignore`.

:::

## IntelliSense в TypeScript

По умолчанию типы для `import.meta.env` в [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts). Для своих `VITE_*` удобно расширить типы.

Создайте `vite-env.d.ts` в `src` и дополните `ImportMetaEnv`:

```typescript [vite-env.d.ts]
interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Если нужны типы DOM / WebWorker, обновите поле [lib](https://www.typescriptlang.org/tsconfig#lib) в `tsconfig.json`.

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Импорты ломают augmentation

Если augmentation не срабатывает, убедитесь, что в `vite-env.d.ts` нет `import`. См. [документацию TypeScript](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined).

:::

## Подстановка констант в HTML

В HTML можно использовать синтаксис `%ИМЯ_КОНСТАНТЫ%` для полей из `import.meta.env`:

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

Если переменной нет в `import.meta.env` (например `%NON_EXISTENT%`), плейсхолдер не трогается; в JS `import.meta.env.NON_EXISTENT` станет `undefined`.

Vite намеренно не делает сложных условных подстановок. Расширяйте через [плагин из экосистемы](https://github.com/vitejs/awesome-vite#transformers) или свой с хуком [`transformIndexHtml`](./api-plugin#transformindexhtml).

## Режимы {#modes}

По умолчанию dev-сервер (`dev`) в режиме `development`, `build` — в `production`.

То есть при `vite build` подгружается `.env.production`, если он есть:

```[.env.production]
VITE_APP_TITLE=My App
```

В приложении: `import.meta.env.VITE_APP_TITLE`.

Другой режим для сборки: флаг `--mode`, например staging:

```bash
vite build --mode staging
```

Файл `.env.staging`:

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

`vite build` по умолчанию — production-сборка; dev-сборку можно получить другим режимом и `.env`:

```[.env.testing]
NODE_ENV=development
```

### NODE_ENV и режимы

`NODE_ENV` (`process.env.NODE_ENV`) и **режим** Vite — разные вещи. Зависимость от команды:

| Команда                                              | NODE_ENV        | Режим           |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

Отражение в `import.meta.env`:

| Команда                | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| Команда              | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` в `.env`

`NODE_ENV=...` можно задать в команде или в `.env`. Если в `.env.[mode]`, режим влияет на значение. Концепции `NODE_ENV` и mode остаются раздельными.

Плюс задания `NODE_ENV` в команде: Vite видит значение раньше; в конфиге Vite можно читать `process.env.NODE_ENV` до полной загрузки env-файлов.
:::
