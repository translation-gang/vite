# Устранение неполадок

См. также [руководство по troubleshooting Rollup](https://rollupjs.org/troubleshooting/).

Если советы не помогли — [GitHub Discussions](https://github.com/vitejs/vite/discussions) или канал `#help` в [Vite Land Discord](https://chat.vite.dev).

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

В пути к проекту может быть `&`, что ломает `npm` на Windows ([npm/cmd-shim#45](https://github.com/npm/cmd-shim/issues/45)).

Варианты:

- Другой менеджер пакетов (`pnpm`, `yarn`)
- Убрать `&` из пути

## Config

### This package is ESM only

При импорте ESM-only пакета через `require`:

> Failed to resolve "foo". This package is ESM only but it was tried to load by `require`.

> Error [ERR_REQUIRE_ESM]: require() of ES Module /path/to/dependency.js from /path/to/vite.config.js not supported.
> Instead change the require of index.js in /path/to/vite.config.js to a dynamic import() which is available in all CommonJS modules.

В Node.js ≤22 ESM по умолчанию не грузится через [`require`](https://nodejs.org/docs/latest-v22.x/api/esm.html#require).

Даже если сработает [`--experimental-require-module`](https://nodejs.org/docs/latest-v22.x/api/modules.html#loading-ecmascript-modules-using-require) или Node &gt;22, лучше перевести конфиг на ESM:

- `"type": "module"` в ближайшем `package.json`
- переименовать `vite.config.js`/`vite.config.ts` в `vite.config.mjs`/`vite.config.mts`

## Dev Server

### Requests are stalled forever

На Linux часто упираются в лимиты дескрипторов и inotify. Vite не бандлит большинство файлов, браузер запрашивает много файлов — лимит превышается.

Решение:

- Поднять лимит дескрипторов (`ulimit`)

  ```shell
  # Check current limit
  $ ulimit -Sn
  # Change limit (temporary)
  $ ulimit -Sn 10000 # You might need to change the hard limit too
  # Restart your browser
  ```

- Лимиты inotify через `sysctl`

  ```shell
  # Check current limits
  $ sysctl fs.inotify
  # Change limits (temporary)
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

Если не помогло, в файлах (без комментария `#`) добавьте `DefaultLimitNOFILE=65536`:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

В Ubuntu иногда достаточно строки `* - nofile 65536` в `/etc/security/limits.conf`.

Настройки сохраняются, нужен **перезапуск**.

Если сервер в VS Code devcontainer, запросы могут «висеть» — см. [Dev Containers / VS Code Port Forwarding](#dev-containers-vs-code-port-forwarding).

### Vite crashes with ENOSPC error

На Linux:

> Error: ENOSPC: System limit for number of file watchers reached

Слишком много файлов в проекте (картинки, ассеты) — превышен лимит inotify (часто ~8192–10000).

Решение:

- Увеличить лимит наблюдателей:

  ```shell
  # Check current limit
  $ cat /proc/sys/fs/inotify/max_user_watches
  # Increase limit (temporary)
  $ sudo sysctl fs.inotify.max_user_watches=524288
  # Make it permanent - add to /etc/sysctl.conf (or edit if it already exists)
  $ echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
  $ sudo sysctl -p
  ```

- Исключить тяжёлые каталоги из watch: [`server.watch.ignored`](/config/server-options#server-watch)
- Polling: [`server.watch.usePolling`](/config/server-options#server-watch) — выше нагрузка на CPU

### Network requests stop loading

С самоподписанным SSL Chrome игнорирует кэш-директивы; Vite на них опирается.

Используйте доверенный сертификат.

См. [Cache problems](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html), [Chrome issue](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8)

#### macOS

Доверенный сертификат через CLI:

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

Или импорт в «Связку ключей» и доверие «Всегда доверять».

### 431 Request Header Fields Too Large

Большой HTTP-заголовок — запрос отбрасывается, в логе предупреждение.

> Server responded with status code 431. See https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large.

Node.js ограничивает размер заголовков из‑за [CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121).

Уменьшите заголовки (например, длинные cookie) или задайте [`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize).

### Dev Containers / VS Code Port Forwarding

В Dev Container или при port forwarding в VS Code задайте [`server.host`](/config/server-options.md#server-host) в `127.0.0.1`.

[Port forwarding в VS Code не поддерживает IPv6](https://github.com/microsoft/vscode-remote-release/issues/7029).

Подробнее: [#16522](https://github.com/vitejs/vite/issues/16522).

## HMR

### Vite detects a file change but the HMR is not working

Возможен разный регистр в импорте. Есть `src/foo.js`, а в `src/bar.js`:

```js
import './Foo.js' // should be './foo.js'
```

Связанный issue: [#964](https://github.com/vitejs/vite/issues/964)

### Vite does not detect a file change

Под WSL2 иногда не срабатывает watch. См. опцию [`server.watch`](/config/server-options.md#server-watch).

### A full reload happens instead of HMR

Если HMR не обрабатывается Vite или плагином — остаётся полная перезагрузка.

Если HMR есть, но есть циклическая зависимость — тоже full reload. Разорвите цикл. Для диагностики: `vite --debug hmr`.

## Build

### Built file does not work because of CORS error

При открытии HTML через `file://` скрипты не выполнятся:

> Access to script at 'file:///foo/bar.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome, https, chrome-untrusted.

> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///foo/bar.js. (Reason: CORS request not http).

См. [Reason: CORS request not HTTP - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp).

Открывайте через `http`, например `npx vite preview`.

### No such file or directory error due to case sensitivity

`ENOENT` / `Module not found` часто из‑за разного регистра ФС: разработка на Windows/macOS (без учёта регистра), сборка на Linux. Проверьте регистр в импортах.

### `Failed to fetch dynamically imported module` error

> TypeError: Failed to fetch dynamically imported module

Возможные причины:

- Расхождение версий (version skew)
- Плохая сеть
- Расширения браузера

#### Version skew

После деплоя старый HTML в кэше ссылается на удалённые чанки.

1. У пользователя закэширована старая версия
2. Новый деплой с другими именами чанков
3. Старый HTML запрашивает несуществующие чанки

Сначала смотрите документацию фреймворка.

Что можно сделать:

- **Временно хранить старые чанки** после выката
- **Service worker** с префетчем и кэшем
- **Префетч динамических чанков** (не поможет, если HTML закэширован по `Cache-Control`)
- **Обработка ошибки импорта** и перезагрузка страницы. См. [Load Error Handling](./build.md#load-error-handling)

#### Poor network conditions

Сбои сети или сервера. Повторить динамический импорт в браузере нельзя ([whatwg/html#6768](https://github.com/whatwg/html/issues/6768)).

#### Browser extensions blocking requests

Блокировщики и др. могут резать запросы. Иногда помогает смена шаблона имён чанков: [`build.rolldownOptions.output.chunkFileNames`](../config/build-options.md#build-rolldownoptions) (часто режут по подстрокам вроде `ad`, `track`).

## Optimized Dependencies

### Outdated pre-bundled deps when linking to a local package

Инвалидация pre-bundle зависит от lockfile, патчей и опций Vite, влияющих на бандл `node_modules`. Переопределения ([npm overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)) учитываются; [`npm link`](https://docs.npmjs.com/cli/v9/commands/npm-link) — нет: после link/unlink перезапускайте с `vite --force`. Предпочтительнее overrides ([pnpm overrides](https://pnpm.io/9.x/package_json#pnpmoverrides), [yarn resolutions](https://yarnpkg.com/configuration/manifest/#resolutions)).

## Performance Bottlenecks

Медленная загрузка — профилируйте встроенным инспектором Node при dev или build:

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
После загрузки страницы в браузере в терминале нажмите `p` (остановка инспектора), затем `q` (остановка dev-сервера).
:::

Появится `vite-profile-0.cpuprofile` в корне. Загрузите на https://www.speedscope.app/ через `BROWSE`.

Плагин [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) показывает промежуточное состояние плагинов и узкие места (dev и build). См. readme плагина.

## Others

### Module externalized for browser compatibility

При использовании Node-модуля в браузере Vite выдаст предупреждение:

> Module "fs" has been externalized for browser compatibility. Cannot access "fs.readFile" in client code.

Vite не полифилит Node API в браузере.

Лучше не тянуть Node-модули в клиентский код; полифилы — вручную. Если импорт из сторонней библиотеки, ориентированной на браузер — сообщите авторам.

### Syntax Error / Type Error happens

Vite не поддерживает код только для non-strict (sloppy) режима: ESM всегда [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).

Примеры:

> [ERROR] With statements cannot be used with the "esm" output format due to strict mode

> TypeError: Cannot create property 'foo' on boolean 'false'

В зависимостях можно попробовать [`patch-package`](https://github.com/ds300/patch-package), [`yarn patch`](https://yarnpkg.com/cli/patch), [`pnpm patch`](https://pnpm.io/cli/patch).

### Browser extensions

Расширения могут блокировать запросы к dev-серверу Vite — белый экран без явных ошибок или:

> TypeError: Failed to fetch dynamically imported module

Попробуйте отключить расширения.

### Cross drive links on Windows

Перекрёстные ссылки между дисками могут ломать Vite:

- виртуальный диск через `subst`
- symlink/junction на другой диск (`mklink`, например глобальный кэш Yarn)

Issue: [#10802](https://github.com/vitejs/vite/issues/10802)

<script setup lang="ts">
// redirect old links with hash to old version docs
if (typeof window !== "undefined") {
  const hashForOldVersion = {
    'vite-cjs-node-api-deprecated': 6
  }

  const version = hashForOldVersion[location.hash.slice(1)]
  if (version) {
    // update the scheme and the port as well so that it works in local preview (it is http and 4173 locally)
    location.href = `https://v${version}.vite.dev` + location.pathname + location.search + location.hash
  }
}
</script>
