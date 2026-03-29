# Руководство по участию в Vite

Привет! Мы очень рады, что вы хотите внести вклад в Vite! Перед отправкой изменений прочитайте это руководство. Также рекомендуем [философию проекта](https://vitejs.dev/guide/philosophy) в документации.

Для исправления багов или реализации функций можно использовать [StackBlitz Codeflow](https://stackblitz.com/codeflow). На issues есть кнопка Codeflow для начала PR; на PR — для ревью без локального клонирования. В Codeflow репозиторий Vite клонируется в онлайн-редактор, пакет Vite собирается в watch-режиме для проверки изменений. Подробнее — [документация Codeflow](https://developer.stackblitz.com/codeflow/what-is-codeflow).

[![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://pr.new/vitejs/vite)

## Настройка репозитория

Форкните репозиторий Vite и клонируйте его локально. Vite — монорепозиторий на pnpm workspaces. Для установки и линковки зависимостей нужен [pnpm](https://pnpm.io/).

Для разработки и тестирования пакета `vite`:

1. В корне Vite выполните `pnpm i`.

2. В корне выполните `pnpm run build`.

3. Если вы правите сам Vite, перейдите в `packages/vite` и запустите `pnpm run dev` — Vite будет пересобираться при изменениях кода.

Альтернатива — [Vite.js Docker Dev](https://github.com/nystudio107/vitejs-docker-dev) для контейнеризованной среды.

> Vite использует pnpm v8. Если у вас несколько проектов с разными версиями pnpm, включите [Corepack](https://github.com/nodejs/corepack): `corepack enable`.

### Игнорирование коммитов в `git blame`

Файл `.git-blame-ignore-revs` отсекает коммиты с форматированием. Чтобы `git blame` его учитывал:

```sh
git config --local blame.ignoreRevsFile .git-blame-ignore-revs
```

## Отладка

Для точек останова и пошагового выполнения используйте [«Run and Debug»](https://code.visualstudio.com/docs/editor/debugging) в VS Code.

1. Поставьте `debugger` в нужном месте.

2. Откройте иконку «Run and Debug» на панели активностей — откроется [_представление Run and Debug_](https://code.visualstudio.com/docs/editor/debugging#_run-and-debug-view).

3. Нажмите «JavaScript Debug Terminal» — откроется терминал в VS Code.

4. В этом терминале перейдите в `playground/xxx` и выполните `pnpm run dev`.

5. Выполнение остановится на `debugger`; дальше — [панель отладки](https://code.visualstudio.com/docs/editor/debugging#_debug-actions): продолжить, шаг и т.д.

### Отладка ошибок в тестах Vitest через Playwright (Chromium)

Часть ошибок скрыта из‑за Vitest, Playwright и Chromium. Чтобы увидеть консоль DevTools:

1. Добавьте `debugger` в хук `afterAll` в `playground/vitestSetup.ts` — выполнение остановится перед выходом тестов и закрытием браузера.

2. Запустите тесты с `debug-serve`: `pnpm run debug-serve resolve`.

3. Дождитесь открытия inspector DevTools и подключения отладчика.

4. В панели Sources нажмите play, чтобы продолжить — откроется Chromium.

5. В фокусе Chromium откройте DevTools и смотрите консоль.

6. Остановите процесс тестов в терминале.

## Тестирование Vite с внешними пакетами

Чтобы проверить локально изменённый Vite на другом пакете, после сборки можно использовать [`pnpm.overrides`](https://pnpm.io/package_json#pnpmoverrides). `pnpm.overrides` задаётся в корневом `package.json`, пакет должен быть в `dependencies` корня:

```json
{
  "dependencies": {
    "vite": "^4.0.0"
  },
  "pnpm": {
    "overrides": {
      "vite": "link:../path/to/vite/packages/vite"
    }
  }
}
```

Затем снова `pnpm install`.

## Запуск тестов

### Интеграционные тесты

В каждом пакете под `playground/` есть каталог `__tests__`. Тесты — [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) с обвязкой. Конфигурация в `vitest.config.e2e.js` и `playground/vitest*`.

У части playground есть варианты конфигурации: для вложенной папки в `__tests__` ищется `vite.config-{имяПапки}.js` в корне playground. Пример — [playground assets](https://github.com/vitejs/vite/tree/main/playground/assets).

Перед тестами [соберите Vite](#настройка-репозитория). На Windows может понадобиться [режим разработчика](https://docs.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development) из‑за [симлинков](https://github.com/vitejs/vite/issues/7390). Также можно [включить `core.symlinks` в git](https://github.com/vitejs/vite/issues/5242).

Каждый интеграционный тест можно гонять в режиме dev или build.

- `pnpm test` — все интеграционные (serve + build) и юнит-тесты.

- `pnpm run test-serve` — только serve.

- `pnpm run test-build` — только build.

- `pnpm run test-serve [фильтр]` или `pnpm run test-build [фильтр]` — пакеты по фильтру, напр. `pnpm run test-serve asset` для `playground/asset` и `vite/src/node/__tests__/asset` в режиме serve.

  Для `pnpm test` фильтр пакетов недоступен — всегда полный прогон.

### Юнит-тесты

Помимо `playground/`, в пакетах могут быть юниты в `__tests__/`. Движок — [Vitest](https://vitest.dev/), конфиги в `vitest.config.ts`.

- `pnpm run test-unit` — юниты во всех пакетах.

- `pnpm run test-unit [фильтр]` — по фильтру.

### Окружение и хелперы тестов

В тестах playground импортируйте `page` из `~utils` — это Playwright [`Page`](https://playwright.dev/docs/api/class-page), уже открывший страницу текущего playground. Пример:

```js
import { page } from '~utils'

test('should work', async () => {
  expect(await page.textContent('.foo')).toMatch('foo')
})
```

Общие хелперы (`testDir`, `isBuild`, `editFile` и др.) — в `playground/test-utils.ts`.

Примечание: в тестовой сборке [другой набор дефолтов Vite](https://github.com/vitejs/vite/blob/main/playground/vitestSetup.ts#L102-L122), чтобы ускорить тесты. Результат может отличаться от обычной production-сборки.

### Расширение набора тестов

Ищите подходящий playground (или создайте новый). Например, статика — [assets playground](https://github.com/vitejs/vite/tree/main/playground/assets). Для `?raw` в `index.html` есть [секция](https://github.com/vitejs/vite/blob/main/playground/assets/index.html#L121):

```html
<h2>?raw import</h2>
<code class="raw"></code>
```

Данные подставляются [импортом файла](https://github.com/vitejs/vite/blob/main/playground/assets/index.html#L151):

```js
import rawSvg from './nested/fragment.svg?raw'
text('.raw', rawSvg)
```

Утилита `text`:

```js
function text(el, text) {
  document.querySelector(el).textContent = text
}
```

В [спеках](https://github.com/vitejs/vite/blob/main/playground/assets/__tests__/assets.spec.ts#L180):

```js
test('?raw import', async () => {
  expect(await page.textContent('.raw')).toMatch('SVG')
})
```

## Зависимости в тестах

Моки часто делают через `link:` и `file:`. У `pnpm` `link:` — симлинки, `file:` — хардлинки. Чтобы зависимость вела себя как скопированная в `node_modules`, используйте `file:`, иначе `link:`.

Для мок-пакетов добавляйте префикс `@vitejs/test-` к имени, чтобы избежать ложных срабатываний.

## Отладочные логи

Переменная `DEBUG` включает логи, напр. `DEBUG="vite:resolve"`. Все области: `DEBUG="vite:*"` (очень шумно). Список областей: `grep -r "createDebugger('vite:" packages/vite/src/`.

## Правила pull request

- Ветка от базовой (например `main`), merge обратно в неё.

- Новая фича:

  - Тесты.
  - Обоснование; лучше сначала issue с предложением и одобрение.

- Исправление бага:

  - Для конкретного issue в заголовке PR добавьте `(fix #xxxx[,#xxxx])` для changelog (напр. `fix: update entities encoding/decoding (fix #3899)`).
  - Подробное описание; желательно живой пример.
  - Тесты, если уместно.

- Несколько мелких коммитов в PR — нормально; при merge GitHub может схлопнуть.

- Тесты должны проходить.

- Стиль кода подхватит Prettier при коммите ([git hooks](https://git-scm.com/docs/githooks) через [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)), если установлены dev-зависимости.

- Заголовок PR — по [соглашению о коммитах](./.github/commit-convention.md) для автогенерации changelog.

## Руководство для мейнтейнеров

> Ниже в основном для тех, у кого есть commit access, но полезно и при серьёзном вкладе в код.

### Разбор issues

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./.github/issue-workflow-dark.png">
  <img src="./.github/issue-workflow.png">
</picture>

### Ревью pull request

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./.github/pr-workflow-dark.png">
  <img src="./.github/pr-workflow.png">
</picture>

## О зависимостях

Vite стремится быть лёгким, в том числе по числу и размеру npm-зависимостей.

Большинство зависимостей пребандлятся Rollup перед публикацией! Поэтому даже runtime-зависимости по умолчанию добавляют в `devDependencies`. Отсюда ограничения в коде.

### Использование `require()`

Иногда зависимости подгружают лениво для старта. Простой `require('somedep')` в ESM не попадёт в бандл, а в опубликованном пакете зависимости может не быть.

Вместо этого: `(await import('somedep')).default`.

### Прежде чем добавлять зависимость

Обычно — в `devDependencies`, даже для runtime. Исключения:

- Типы, напр. `@types/*`.
- Пакеты с бинарниками, которые нельзя нормально забандлить, напр. `esbuild`.
- Пакеты с типами, которые попадают в публичные типы Vite, напр. `rollup`.

Избегайте тяжёлых транзитивных зависимостей ради малой функциональности. Например, `http-proxy` + типы ~1MB, а `http-proxy-middleware` тянет ~7MB, хотя простой middleware на `http-proxy` — пара строк.

### Поддержка типов

Vite должен нормально подключаться в TypeScript-проектах (в т.ч. VitePress) и в `vite.config.ts`. Значит, зависимость с экспортируемыми типами теоретически в `dependencies`, но тогда её нельзя забандлить.

Часть типов инлайнится в `packages/vite/src/types`, чтобы экспортировать типы и при этом бандлить исходники.

`pnpm run build-types-check` — проверка, что собранные типы не тянут `devDependencies`.

Общие клиент/Node типы — в `packages/vite/types` (публикуются как есть, внутренние). Типы зависимостей в этом каталоге устарели; новые — в `packages/vite/src/types`.

### Прежде чем добавлять ещё одну опцию

Опций уже много; не стоит лечить каждую проблему новой. Перед добавлением подумайте:

- стоит ли проблема того;
- нельзя ли умнее дефолт;
- нет ли обхода существующими опциями;
- не решит ли плагин.

## Релиз

Если есть права на публикацию, релиз пакета в два этапа: «Release» и «Publish».

«Release» локально — changelog и теги:

1. Remote `https://github.com/vitejs/vite` должен называться `origin`.
2. В `main`: `git pull`, `pnpm i`.
3. `pnpm release` по подсказкам — changelog, тег, push в `origin`. Для пробы: `--dry`.
4. В конце будет ссылка на https://github.com/vitejs/vite/actions/workflows/publish.yml.
5. Откройте и продолжите ниже.

«Publish» в GitHub Actions — выкладка в npm:

1. Появится workflow, ожидающий подтверждения.
2. Откройте его.
3. «Review deployments» в жёлтом блоке.
4. Отметьте «Release», «Approve and deploy».
5. Пакет публикуется в npm.

## Перевод документации

Чтобы добавить язык в документацию Vite, см. [`vite-docs-template`](https://github.com/tony19/vite-docs-template/blob/main/.github/CONTRIBUTING.md).
