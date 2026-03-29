<!-- При желании удалите примечание ниже в своём форке -->
## Этот репозиторий — шаблон для [репозиториев переводов документации Vite.js](https://github.com/vitejs?q=docs). См. [руководство](/.github/CONTRIBUTING.md).

---
<p align="center">
  <br>
  <br>
  <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://vite.dev/vite-light.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://vite.dev/vite-dark.svg">
      <img alt="логотип Vite" src="https://vite.dev/vite-dark.svg" height="60">
    </picture>
  </a>
  <br>
  <br>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/vite"><img src="https://img.shields.io/npm/v/vite.svg" alt="npm-пакет"></a>
  <a href="https://nodejs.org/en/about/previous-releases"><img src="https://img.shields.io/node/v/vite.svg" alt="совместимость с Node"></a>
  <a href="https://github.com/vitejs/vite/actions/workflows/ci.yml"><img src="https://github.com/vitejs/vite/actions/workflows/ci.yml/badge.svg?branch=main" alt="статус сборки"></a>
  <a href="https://docs.warp.dev/support-and-community/community/open-source-partnership"><img src="https://img.shields.io/badge/Oz%20agents-triaging%20issues-white?logo=warp" alt="разбор issues с помощью Oz"></a>
  <a href="https://chat.vite.dev"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="чат в Discord"></a>
</p>
<br/>

# Vite ⚡

> Инструментарий нового поколения для фронтенда

- 💡 Мгновенный старт dev-сервера
- ⚡️ Молниеносный HMR
- 🛠️ Богатый набор возможностей
- 📦 Оптимизированная сборка
- 🔩 Универсальный интерфейс плагинов
- 🔑 Полностью типизированные API

Vite (французское слово «быстро», произносится [`/viːt/`](https://cdn.jsdelivr.net/gh/vitejs/vite@main/docs/public/vite.mp3), как «вит») — новый тип инструментов сборки фронтенда, который заметно улучшает опыт разработки. Он состоит из двух крупных частей:

- Dev-сервер, отдающий исходники через [нативные ES-модули](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), с [встроенными возможностями](https://vite.dev/guide/features.html) и невероятно быстрым [горячим обновлением модулей (HMR)](https://vite.dev/guide/features.html#hot-module-replacement).

- [Команда сборки](https://vite.dev/guide/build.html), которая бандлит код с помощью [Rollup](https://rollupjs.org), заранее настроенная на выдачу высокооптимизированных статических ресурсов для продакшена.

Кроме того, Vite легко расширяется через [Plugin API](https://vite.dev/guide/api-plugin.html) и [JavaScript API](https://vite.dev/guide/api-javascript.html) с полной поддержкой типов.

[Читайте документацию, чтобы узнать больше](https://vite.dev).

## Пакеты

| Пакет                                           | Версия (клик — changelog)                                                                                                        |
| ----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| [vite](packages/vite)                           | [![версия vite](https://img.shields.io/npm/v/vite.svg?label=%20)](packages/vite/CHANGELOG.md)                                    |
| [@vitejs/plugin-legacy](packages/plugin-legacy) | [![версия plugin-legacy](https://img.shields.io/npm/v/@vitejs/plugin-legacy.svg?label=%20)](packages/plugin-legacy/CHANGELOG.md) |
| [create-vite](packages/create-vite)             | [![версия create-vite](https://img.shields.io/npm/v/create-vite.svg?label=%20)](packages/create-vite/CHANGELOG.md)               |

## Участие в проекте

См. [Руководство по участию](CONTRIBUTING.md).

## Лицензия

[MIT](LICENSE).

## Спонсоры

<p align="center">
  <a target="_blank" href="https://github.com/sponsors/yyx990803">
    <img alt="спонсоры" src="https://sponsors.vuejs.org/vite.svg?v2">
  </a>
</p>
