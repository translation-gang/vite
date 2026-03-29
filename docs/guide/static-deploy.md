<!--
  ПРОЧИТАЙТЕ ЭТО, ЕСЛИ ХОТИТЕ ДОБАВИТЬ НОВУЮ ПЛАТФОРМУ ДЕПЛОЯ.

  Можете прислать PR с новым разделом и ссылкой на руководство по деплою вашей платформы,
  если оно соответствует критериям:

  1. Пользователи должны иметь возможность бесплатно задеплоить сайт.
  2. Бесплатный тариф должен хостить сайт неограниченно по времени, без ограничения срока.
     Ограничение по вычислительным ресурсам или числу сайтов — допустимо.
  3. В связанных руководствах не должно быть вредоносного контента.

  Новые разделы добавляйте в конец файла. Ориентируйтесь на существующие разделы внизу файла.

  Команда Vite может менять критерии и пересматривать список.
  Перед удалением раздела мы свяжемся с авторами исходного PR.
-->

# Деплой статического сайта

Нижеприведённые руководства опираются на общие предположения:

- Используется каталог сборки по умолчанию (`dist`). Его [можно изменить через `build.outDir`](/config/build-options.md#build-outdir); тогда шаги из руководств нужно адаптировать.
- Используется npm. При Yarn или другом менеджере пакетов используйте эквивалентные команды.
- Vite установлен как локальная dev-зависимость, настроены такие npm-скрипты:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Важно: `vite preview` предназначен для локального просмотра сборки, а не как production-сервер.

::: tip ПРИМЕЧАНИЕ
Здесь описан статический деплой сайта на Vite. Vite также поддерживает SSR — фронтенд-фреймворки, где одно приложение запускается в Node.js, пререндерится в HTML и затем гидратируется на клиенте. См. [руководство по SSR](./ssr). Для интеграции с классическими серверными фреймворками см. [интеграцию с бэкендом](./backend-integration).
:::

## Сборка приложения

Соберите приложение командой `npm run build`.

```bash
$ npm run build
```

По умолчанию результат попадёт в `dist`. Эту папку можно задеплоить на любую выбранную платформу.

### Локальная проверка

После сборки проверьте результат локально: `npm run preview`.

```bash
$ npm run preview
```

`vite preview` поднимает локальный статический сервер и отдаёт файлы из `dist` по адресу `http://localhost:4173` — удобно убедиться, что production-сборка выглядит корректно.

Порт задаётся флагом `--port`:

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Тогда preview будет на `http://localhost:8080`.

## GitHub Pages

1. **Обновите конфиг Vite**

   Укажите верный `base` в `vite.config.js`.

   Для `https://<USERNAME>.github.io/` или своего домена через GitHub Pages (например `www.example.com`) задайте `base: '/'` или уберите `base` (по умолчанию `'/'`).

   Для `https://<USERNAME>.github.io/<REPO>/` (репозиторий `https://github.com/<USERNAME>/<REPO>`) задайте `base: '/<REPO>/'`.

2. **Включите GitHub Pages**

   В репозитории: **Settings → Pages**. В **Build and deployment** в **Source** выберите **GitHub Actions**.

   Деплой пойдёт через [workflow](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows) GitHub Actions — для Vite нужен шаг сборки.

3. **Создайте workflow**

   Файл `.github/workflows/deploy.yml`. Можно нажать **«create your own»** на предыдущем шаге — сгенерируется заготовка.

   Пример: npm, сборка и деплой при пуше в `main`:

   <<< ./static-deploy-github-pages.yaml#content [.github/workflows/deploy.yml]

## GitLab Pages и GitLab CI

1. Укажите `base` в `vite.config.js`.

   Для `https://<USERNAME or GROUP>.gitlab.io/` `base` можно не задавать (по умолчанию `'/'`).

   Для `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` (репозиторий `https://gitlab.com/<USERNAME>/<REPO>`) задайте `base: '/<REPO>/'`.

2. В корне проекта создайте `.gitlab-ci.yml` ниже — сборка и деплой при изменениях:

   ```yaml [.gitlab-ci.yml]
   image: node:lts
   pages:
     stage: deploy
     cache:
       key:
         files:
           - package-lock.json
         prefix: npm
       paths:
         - node_modules/
     script:
       - npm install
       - npm run build
       - cp -a dist/. public/
     artifacts:
       paths:
         - public
     rules:
       - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
   ```

## Netlify

### Netlify CLI

1. Установите [Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/): `npm install -g netlify-cli`.
2. Создайте сайт: `netlify init`.
3. Деплой: `netlify deploy`.

CLI выдаст preview URL. Для production: `netlify deploy --prod`.

### Netlify с Git

1. Запушьте код в репозиторий (GitHub, GitLab, BitBucket, Azure DevOps).
2. [Импортируйте проект](https://app.netlify.com/start) в Netlify.
3. Выберите ветку, каталог вывода, при необходимости переменные окружения.
4. Нажмите **Deploy**.
5. Приложение задеплоено.

После импорта пуши в ветки, отличные от production, и pull request дают [Preview Deployments](https://docs.netlify.com/deploy/deploy-types/deploy-previews/); изменения в production-ветке (часто `main`) — [Production Deployment](https://docs.netlify.com/deploy/deploy-overview/#definitions).

## Vercel

### Vercel CLI

1. Установите [Vercel CLI](https://vercel.com/cli): `npm i -g vercel`, затем `vercel`.
2. Vercel определит Vite и подставит нужные настройки.
3. Деплой готов (например [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/)).

### Vercel с Git

1. Запушьте код в репозиторий (GitHub, GitLab, Bitbucket).
2. [Импортируйте проект Vite](https://vercel.com/new) в Vercel.
3. Vercel настроит Vite автоматически.
4. Деплой готов (например [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/)).

После импорта пуши в ветки дают [Preview Deployments](https://vercel.com/docs/concepts/deployments/environments#preview), изменения в production-ветке — [Production Deployment](https://vercel.com/docs/concepts/deployments/environments#production).

Подробнее: [Git Integration](https://vercel.com/docs/concepts/git) у Vercel.

## Cloudflare

### Cloudflare Workers

[Плагин Cloudflare Vite](https://developers.cloudflare.com/workers/vite-plugin/) интегрирует Workers и использует Environment API Vite, чтобы серверный код в dev шёл в рантайме Workers.

Добавление Workers в существующий проект:

```bash
$ npm install --save-dev @cloudflare/vite-plugin
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  plugins: [cloudflare()],
})
```

```jsonc [wrangler.jsonc]
{
  "name": "my-vite-app",
}
```

После `npm run build` деплой: `npx wrangler deploy`.

Бэкенд-API к приложению можно добавить для безопасной работы с ресурсами Cloudflare — в dev это Workers, вместе с фронтендом. См. [туториал по плагину](https://developers.cloudflare.com/workers/vite-plugin/tutorial/).

### Cloudflare Pages

#### Cloudflare Pages с Git

Cloudflare Pages деплоит без обязательного Wrangler-файла.

1. Запушьте код (GitHub, GitLab).
2. В Cloudflare: **Account Home** > **Workers & Pages**.
3. **Create a new Project** → **Pages** → Git.
4. Выберите репозиторий → **Begin setup**
5. В настройках сборки выберите пресет под ваш Vite-фреймворк или укажите команды и каталог вывода.
6. Сохраните и задеплойте.
7. Сайт доступен (например `https://<PROJECTNAME>.pages.dev/`).

Дальнейшие пуши в ветки дают [Preview Deployments](https://developers.cloudflare.com/pages/platform/preview-deployments/), если не отключено в [branch build controls](https://developers.cloudflare.com/pages/platform/branch-build-controls/). Изменения в production-ветке — production-деплой.

Свои домены и настройки сборки: [Cloudflare Pages Git Integration](https://developers.cloudflare.com/pages/get-started/#manage-your-site).

## Google Firebase

1. Установите [firebase-tools](https://www.npmjs.com/package/firebase-tools): `npm i -g firebase-tools`.

2. В корне проекта создайте файлы:

   ::: code-group

   ```json [firebase.json]
   {
     "hosting": {
       "public": "dist",
       "ignore": [],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

   ```js [.firebaserc]
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

   :::

3. После `npm run build`: `firebase deploy`.

## Surge

1. Установите [surge](https://www.npmjs.com/package/surge): `npm i -g surge`.
2. `npm run build`.
3. `surge dist`.

Свой домен: `surge dist yourdomain.com` — см. [custom domain](https://surge.sh/help/adding-a-custom-domain).

## Azure Static Web Apps

Быстрый деплой через Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps):

- Аккаунт Azure и подписка. [Бесплатный аккаунт](https://azure.microsoft.com/free).
- Код в [GitHub](https://github.com).
- Расширение [SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) в [VS Code](https://code.visualstudio.com).

В VS Code: расширение Static Web Apps, вход в Azure, «+» для нового приложения, выбор подписки. В мастере — имя, пресет фреймворка, корень приложения (обычно `/`) и папка сборки `/dist`. Создастся GitHub Action в `.github`.

По завершении workflow откройте сайт из окна расширения (**Browse Website**).

## Render

Статический сайт на [Render](https://render.com/):

1. [Аккаунт Render](https://dashboard.render.com/register).
2. В [Dashboard](https://dashboard.render.com/): **New** → **Static Site**.
3. Подключите GitHub/GitLab или публичный репозиторий.
4. Имя проекта и ветка.
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. **Create Static Site**. URL вида `https://<PROJECTNAME>.onrender.com/`.

Новые коммиты в ветку обычно запускают деплой. [Auto-Deploy](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) настраивается в проекте.

[Свой домен](https://render.com/docs/custom-domains) можно подключить отдельно.

## Flightcontrol

Статический сайт на [Flightcontrol](https://www.flightcontrol.dev/?ref=docs-vite) — по [инструкции](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite).

## Kinsta Static Site Hosting

[Инструкция Kinsta](https://kinsta.com/docs/static-site-hosting/static-site-quick-start/react-static-site-examples/#react-with-vite) для [хостинга статики](https://kinsta.com/static-site-hosting/).

## xmit Static Site Hosting

[Руководство xmit](https://xmit.dev/posts/vite-quickstart/) для [xmit](https://xmit.co).

## Zephyr Cloud

[Zephyr Cloud](https://zephyr-cloud.io) встраивается в процесс сборки и даёт глобальное edge-распространение для module federation и других сценариев.

В отличие от классических провайдеров, Zephyr связан с процессом сборки Vite: при `build` или `dev` приложение автоматически деплоится в Zephyr Cloud.

Шаги: [руководство по деплою Vite](https://docs.zephyr-cloud.io/bundlers/vite).

## EdgeOne Pages

Статический сайт на [EdgeOne Pages](https://edgeone.ai/products/pages) — по [инструкции](https://pages.edgeone.ai/document/vite).
