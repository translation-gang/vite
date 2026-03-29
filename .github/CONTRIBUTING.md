# Руководство по переводу документации

Этот репозиторий — шаблон для [репозиториев переводов документации Vite.js](https://github.com/vitejs?q=docs).

## Создание репозитория перевода

1. Нажмите [*Use this template*](https://github.com/tony19/vite-docs-template/generate), чтобы создать новый репозиторий перевода в своём аккаунте GitHub.

2. Настройте права для workflow (обязательно):

   - Откройте в репозитории «Settings» > «Actions» > «General» > «Workflow permissions»
   - Выберите «Read and write permissions»
   - Нажмите «Save»

   Это стандартное требование для GitHub Actions, которым нужно создавать issues или менять репозиторий. Без этих прав действие завершится ошибкой `403 "Resource not accessible by integration"` при попытке создать issue или управлять метками.

3. В репозитории используется GitHub Action [`yuki-no`](https://github.com/Gumball12/yuki-no), чтобы синхронизироваться с изменениями из [`docs` Vite](https://github.com/vitejs/vite/tree/main/docs). Он создаёт issues в этом репозитории для отслеживания изменений в upstream, которые нужно перевести.

   Нужно задать следующее поле в [`/.github/workflows/yuki-no.yml`](/.github/workflows/yuki-no.yml):

    * `track-from` — стартовая точка отслеживания: Yuki-no учитывает только коммиты **после** этого хэша из головного репозитория (vitejs/vite). Старый хэш сильно замедлит первый запуск (обработка всей истории). После первого успешного запуска уже обработанные коммиты пропускаются автоматически.

      В [`/.github/workflows/yuki-no.yml`](/.github/workflows/yuki-no.yml) уже подставлен актуальный на момент настройки хэш `main` из `vitejs/vite`. Чтобы обновить точку отсчёта:

      ```bash
      git ls-remote https://github.com/vitejs/vite.git refs/heads/main
      ```

      Первое поле в выводе — полный SHA; вставьте его в `track-from:`.

      ```yaml
      track-from: <SHA_ИЗ_ls-remote>
      ```

   По умолчанию `yuki-no` использует бота `github-actions`. Для своего бота задайте:

    * `username` — имя пользователя GitHub [machine user](https://docs.github.com/en/developers/overview/managing-deploy-keys#machine-users) (например, `ci-bot`)
    * `email` — email, привязанный к этому пользователю
    * `access-token` — [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) machine user (храните в [секрете репозитория](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), можно указать `access-token: ${{ secrets.MY_SECRET_TOKEN }}`)

   Дополнительные опции — в [документации `yuki-no`](https://github.com/Gumball12/yuki-no).

4. Переведите на целевой язык все пользовательские строки (если не указано иначе) в следующих файлах:

    * [`/docs/.vitepress/config.ts`](/docs/.vitepress/config.ts) (поля `og*`, `footer.*`, `text` и `link`)
    * блок спонсоров на главной: в этой ветке он задаётся темой [`@voidzero-dev/vitepress-theme`](https://github.com/voidzero-dev/vitepress-theme) и [`theme/composables/sponsor.ts`](/docs/.vitepress/theme/composables/sponsor.ts) (поля `tier`). Отдельного `HomeSponsors.vue` в репозитории может не быть — при необходимости оверрайдите компонент в `docs/.vitepress/theme/`.
    * [`/docs/.vitepress/theme/composables/sponsor.ts`](/docs/.vitepress/theme/composables/sponsor.ts) (поля `tier`)
    * [`/docs/_data/team.js`](/docs/_data/team.js) (поля `title` и `desc`)
    * `/docs/**/*.md`
    * [`/CONTRIBUTING.md`](/CONTRIBUTING.md)
    * [`/README.md`](/README.md)
    * `/docs/images/*.svg` (крупные диаграммы вроде `vite-environments.svg` можно оставить на английском, если перевод подписей невыполним без правки макета)

   💡 *Советы:*

    * *Напишите в канал [`#docs`](https://discord.com/channels/804011606160703521/855049073157341234) в [Discord](https://chat.vitejs.dev) или в [GitHub Discussions](https://github.com/vitejs/vite/discussions/categories/general) — там могут помочь с переводом.*
    * *Отправляйте pull request’ы в своём репозитории, чтобы соавторы могли вычитать перевод.*

   **Algolia DocSearch.** В [`docs/.vitepress/config.ts`](/docs/.vitepress/config.ts) для поиска задано `searchParameters.facetFilters: ['tags:ru']` — в индексе Algolia записи вашего сайта должны иметь атрибут `tags` со значением `ru` (настраивается в [конфигурации краулера DocSearch](https://docsearch.algolia.com/docs/legacy/configuring-file) для URL публикации перевода). Пока в общем индексе `vitejs` нет страниц с тегом `ru`, результаты поиска будут пустыми: согласуйте с [командой Vite](https://github.com/vitejs/vite) добавление локали в краулер или временно переключите `themeConfig.search.provider` на `'local'`.

5. Создайте [pull request в основной репозиторий Vite](https://github.com/vitejs/vite/pulls), чтобы обновить [ссылки на локали в `docs/.vitepress/config.ts`](https://github.com/vitejs/vite/blob/1e078ad1902ae980741d6920fc3a72d182fcf179/docs/.vitepress/config.ts#L55-L62) и добавить новый язык в выпадающий список на сайте Vite. В `localeLinks.items[]` добавьте объект с полями:

    - `text` — название языка на нём самом (например, `Español`)
    - `link` — URL сайта: [код ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) как поддомен `https://vitejs.dev` (например, `https://es.vitejs.dev`)

    *Пример для французского:*

    ```js
    localeLinks: {
      items: [
        { text: 'Française', link: 'https://fr.vitejs.dev' },
      ]
    },
    ```

6. В описании PR укажите URL вашего репозитория с переводом. Будьте готовы [передать репозиторий](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository) в организацию [`vitejs`](https://github.com/vitejs) по просьбе [команды Vite](https://github.com/orgs/vitejs/people). После передачи вас автоматически добавят соавтором. Репозиторий переименуют в `docs-КОД_ЯЗЫКА` (например, `docs-fr`).

   **Спасибо за вклад!** ❤️
