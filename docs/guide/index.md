# Начало работы

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Обзор

Vite (франц. «быстро», произносится `/viːt/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" aria-label="pronounce" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="../images/voice.svg?no-inline#voice" /></svg></button>, как «вит») — инструмент сборки, который даёт более быстрый и лёгкий опыт разработки современных веб-проектов. Состоит из двух основных частей:

- Dev-сервер с [расширенными возможностями](./features) поверх [нативных ES-модулей](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), в том числе очень быстрый [Hot Module Replacement (HMR)](./features#hot-module-replacement).

- Команда сборки, которая бандлит код через [Rolldown](https://rolldown.rs) с настройками по умолчанию для высокооптимизированной статики в production.

Vite задаёт разумные умолчания «из коробки». Что можно делать — в [руководстве по возможностям](./features). Фреймворки и интеграции — через [плагины](./using-plugins). Раздел [Конфигурация](../config/) объясняет, как подстроить Vite под проект.

Расширяемость — через [Plugin API](./api-plugin) и [JavaScript API](./api-javascript) с полной типизацией.

Почему проект устроен именно так — в разделе [Почему Vite](./why).

<ScrimbaLink href="https://scrimba.com/intro-to-vite-c03p6pbbdq?via=vite" title="Бесплатный курс Vite на Scrimba">Изучайте Vite на интерактивных уроках Scrimba</ScrimbaLink>

## Поддержка браузеров

В разработке Vite рассчитывает на современный браузер: актуальные возможности JavaScript и CSS. Поэтому цель трансформации — [`esnext`](https://oxc.rs/docs/guide/usage/transformer/lowering.html#target): без лишнего даунлевелинга модули максимально близки к исходникам. Для работы dev-сервера подмешивается немного рантайма на возможностях из [Baseline](https://web-platform-dx.github.io/web-features/) Newly Available на дату мажорного релиза (для этой мажорной версии — 2026-01-01).

В production по умолчанию цель — браузеры [Baseline](https://web-platform-dx.github.io/web-features/) Widely Available (выпущены не менее 2,5 лет назад). Цель можно понизить в конфиге. Устаревшие браузеры — официальный [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy). Подробнее — в [Сборка для production](./build).

## Попробовать Vite онлайн

Онлайн — на [StackBlitz](https://vite.new/): окружение на Vite прямо в браузере, почти как локально, без установки. Шаблон: `vite.new/{template}`.

Поддерживаемые пресеты:

|             JavaScript              |                TypeScript                 |
| :---------------------------------: | :---------------------------------------: |
| [vanilla](https://vite.new/vanilla) | [vanilla-ts](https://vite.new/vanilla-ts) |
|     [vue](https://vite.new/vue)     |     [vue-ts](https://vite.new/vue-ts)     |
|   [react](https://vite.new/react)   |   [react-ts](https://vite.new/react-ts)   |
|  [preact](https://vite.new/preact)  |  [preact-ts](https://vite.new/preact-ts)  |
|     [lit](https://vite.new/lit)     |     [lit-ts](https://vite.new/lit-ts)     |
|  [svelte](https://vite.new/svelte)  |  [svelte-ts](https://vite.new/svelte-ts)  |
|   [solid](https://vite.new/solid)   |   [solid-ts](https://vite.new/solid-ts)   |
|    [qwik](https://vite.new/qwik)    |    [qwik-ts](https://vite.new/qwik-ts)    |

## Создание первого проекта на Vite

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

```bash [Deno]
$ deno init --npm vite
```

:::

Дальше следуйте подсказкам.

<ScrimbaLink href="https://scrimba.com/intro-to-vite-c03p6pbbdq/~0yhj?via=vite" title="Первый проект на Vite">Интерактивный урок на Scrimba</ScrimbaLink>

::: tip Совместимость
Нужен [Node.js](https://nodejs.org/en/) 20.19+, 22.12+. Отдельные шаблоны могут требовать новее — обновите Node, если об этом предупредит менеджер пакетов.
:::

:::: details create vite с опциями командной строки

Имя проекта и шаблон можно задать сразу в CLI. Например, Vite + Vue:

::: code-group

```bash [npm]
# npm 7+: нужен дополнительный двойной дефис (--):
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

```bash [Deno]
$ deno init --npm vite my-vue-app --template vue
```

:::

Шаблоны: см. [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) — `vanilla`, `vanilla-ts`, `vue`, `vue-ts`, `react`, `react-ts`, `react-swc`, `react-swc-ts`, `preact`, `preact-ts`, `lit`, `lit-ts`, `svelte`, `svelte-ts`, `solid`, `solid-ts`, `qwik`, `qwik-ts`.

В качестве имени проекта можно указать `.`, чтобы создать файлы в текущем каталоге.

Без интерактива — флаг `--no-interactive`.

::::

## Шаблоны сообщества

create-vite — быстрый старт с базовых шаблонов для популярных фреймворков. Другие инструменты и фреймворки — в Awesome Vite, раздел [шаблоны сообщества](https://github.com/vitejs/awesome-vite#templates).

Для репозитория `https://github.com/user/project` онлайн: `https://github.stackblitz.com/user/project` (вставьте `.stackblitz` после `github`).

Скaffolding с шаблоном — например [tiged](https://github.com/tiged/tiged). Если проект на GitHub и ветка по умолчанию `main`:

```bash
npx tiged user/project my-project
cd my-project

npm install
npm run dev
```

## Ручная установка

CLI `vite` в проекте:

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

```bash [Deno]
$ deno add -D npm:vite
```

:::

Файл `index.html`:

```html
<p>Hello Vite!</p>
```

Запуск в терминале:

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

```bash [Deno]
$ deno run -A npm:vite
```

:::

`index.html` откроется на `http://localhost:5173`.

## `index.html` и корень проекта

В проекте Vite `index.html` в центре, а не спрятан в `public` — так задумано: в разработке Vite — сервер, а `index.html` — вход в приложение.

Vite считает `index.html` исходником и частью графа модулей. Разрешает `<script type="module" src="...">` на ваш JS. Инлайновый `<script type="module">` и CSS через `<link href>` тоже получают возможности Vite. URL внутри `index.html` автоматически пересчитываются — плейсхолдеры вроде `%PUBLIC_URL%` не нужны.

Как у статического HTTP-сервера, есть «корневой каталог», откуда отдаются файлы. В документации он обозначается `<root>`. Абсолютные URL в исходниках резолвятся от корня проекта — можно писать код как для обычного статического сервера (только с гораздо большими возможностями). Vite умеет зависимости вне корня ФС — удобно в монорепозиториях.

Поддерживаются [мультистраничные приложения](./build#multi-page-app) с несколькими `.html` точками входа.

#### Другой корень

`vite` стартует с корнем = текущая рабочая директория. Другой корень: `vite serve some/sub/dir`.
Конфиг [например `vite.config.js`](/config/#configuring-vite) ищется в корне проекта — при смене корня его нужно перенести.

## Интерфейс командной строки

В проекте с Vite вызывайте бинарник `vite` из npm-скриптов или `npx vite`. Типичные скрипты:

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

Дополнительные опции CLI: `--port`, `--open` и др. Полный список: `npx vite --help`.

Подробнее: [интерфейс командной строки](./cli.md)

## Неопубликованные коммиты

Чтобы опробовать свежие изменения до релиза, установите конкретный коммит через https://pkg.pr.new:

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

Подставьте `SHA` из [коммитов Vite](https://github.com/vitejs/vite/commits/main/). Работают коммиты примерно за последний месяц — старые сборки удаляются.

Либо клонируйте [репозиторий vite](https://github.com/vitejs/vite), соберите и слинкуйте локально (нужен [pnpm](https://pnpm.io/)):

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link # use your preferred package manager for this step
```

В проекте на Vite: `pnpm link vite` (или ваш менеджер). Перезапустите dev-сервер.

О релизах — [Releases](../releases.md).

::: tip Зависимости, тянущие Vite
Чтобы заменить версию Vite у транзитивных зависимостей, используйте [npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides) или [pnpm overrides](https://pnpm.io/9.x/package_json#pnpmoverrides).
:::

## Сообщество

Вопросы и помощь: [Discord](https://chat.vite.dev) и [GitHub Discussions](https://github.com/vitejs/vite/discussions).
