import path from 'node:path'
import fs from 'node:fs'
import type { HeadConfig } from 'vitepress'
import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { graphvizMarkdownPlugin } from 'vitepress-plugin-graphviz'
import llmstxt from 'vitepress-plugin-llms'
import { markdownItImageSize } from 'markdown-it-image-size'
import { extendConfig } from '@voidzero-dev/vitepress-theme/config'
import type { FooterLink } from '@voidzero-dev/vitepress-theme'
import packageJson from '../../packages/vite/package.json' with { type: 'json' }
import { buildEnd } from './buildEnd.config'

const viteVersion = vitePackageJson.version
const viteMajorVersion = +viteVersion.split('.')[0]

const ogDescription = 'Инструментарий нового поколения для фронтенда'
const ogImage = 'https://vite.dev/og-image.jpg'
const ogTitle = 'Vite'
const ogUrl = 'https://vite.dev'

// переменные окружения Netlify
const deployURL = process.env.DEPLOY_PRIME_URL || ''
const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const deployType = (() => {
  switch (deployURL) {
    case 'https://main--vite-docs-main.netlify.app':
      return 'main'
    case '':
      return 'local'
    default:
      return 'release'
  }
})()
const additionalTitle = ((): string => {
  switch (deployType) {
    case 'main':
      return ' (ветка main)'
    case 'local':
      return ' (локально)'
    case 'release':
      return ''
  }
})()
const versionLinks = (() => {
  const links: FooterLink[] = []

  if (deployType !== 'main') {
    links.push({
      text: 'Документация (невыпущенная)',
      link: 'https://main.vite.dev',
    })
  }

  if (deployType === 'main' || deployType === 'local') {
    links.push({
      text: `Документация Vite ${viteMajorVersion} (релиз)`,
      link: 'https://vite.dev',
    })
  }

  // Ссылки на документацию версий, начиная с v2
  for (let i = viteMajorVersion - 1; i >= 2; i--) {
    links.push({
      text: `Документация Vite ${i}`,
      link: `https://v${i}.vite.dev`,
    })
  }

  return links
})()

function inlineScript(file: string): HeadConfig {
  return [
    'script',
    {},
    fs.readFileSync(
      path.resolve(import.meta.dirname, `./inlined-scripts/${file}`),
      'utf-8',
    ),
  ]
}

const config = defineConfig({
  title: `Vite${additionalTitle}`,
  description: 'Инструментарий нового поколения для фронтенда',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://vite.dev',
  },
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/logo-without-border.svg' },
    ],
    [
      'link',
      { rel: 'alternate', type: 'application/rss+xml', href: '/blog.rss' },
    ],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    inlineScript('banner.js'),
    ['link', { rel: 'me', href: 'https://m.webtoo.ls/@vite' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { property: 'og:site_name', content: 'vitejs' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@vite_js' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'CBDFBSLI',
        'data-spa': 'auto',
        defer: '',
      },
    ],
  ],

  locales: {
    root: { label: 'Русский' },
    zh: { label: '简体中文', link: 'https://cn.vite.dev' },
    ja: { label: '日本語', link: 'https://ja.vite.dev' },
    es: { label: 'Español', link: 'https://es.vite.dev' },
    pt: { label: 'Português', link: 'https://pt.vite.dev' },
    ko: { label: '한국어', link: 'https://ko.vite.dev' },
    de: { label: 'Deutsch', link: 'https://de.vite.dev' },
    fa: { label: 'فارسی', link: 'https://fa.vite.dev' },
  },

  themeConfig: {
    variant: 'vite',
    logo: '/logo.svg',

    banner: {
      id: 'viteplus-alpha',
      text: 'Анонс Vite+ Alpha: открытый код. Единая платформа. Новое поколение.',
      url: 'https://voidzero.dev/posts/announcing-vite-plus-alpha?utm_source=vite&utm_content=top_banner',
    },

    editLink: {
      pattern: 'https://github.com/translation-gang/vite/edit/main/docs/:path',
      text: 'Предложить правки к этой странице',
    },

    socialLinks: [
      { icon: 'bluesky', link: 'https://bsky.app/profile/vite.dev' },
      { icon: 'mastodon', link: 'https://elk.zone/m.webtoo.ls/@vite' },
      { icon: 'x', link: 'https://x.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vite.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' },
    ],

    search: {
      provider: 'algolia',
      options: {
        appId: '7H67QR5P0A',
        apiKey: '208bb9c14574939326032b937431014b',
        indexName: 'vitejs',
        // Должно совпадать с facet `tags` в индексе Algolia DocSearch для этого сайта (см. .github/CONTRIBUTING.md).
        placeholder: 'Поиск по документации',
        searchParameters: {
          facetFilters: ['tags:ru'],
        },
        translations: {
          button: {
            buttonText: 'Поиск',
            buttonAriaLabel: 'Поиск по документации',
          },
          modal: {
            searchBox: {
              resetButtonTitle: 'Сбросить запрос',
              resetButtonAriaLabel: 'Сбросить запрос',
              cancelButtonText: 'Отмена',
              cancelButtonAriaLabel: 'Отмена',
            },
            footer: {
              selectText: 'выбрать',
              navigateText: 'навигация',
              closeText: 'закрыть',
              searchByText: 'Поиск',
            },
            startScreen: {
              recentSearchesTitle: 'Недавние',
              noRecentSearchesText: 'Нет недавних запросов',
              saveRecentSearchButtonTitle: 'Сохранить этот запрос',
              removeRecentSearchButtonTitle: 'Удалить из недавних',
              favoriteSearchesTitle: 'Избранное',
              removeFavoriteSearchButtonTitle: 'Удалить из избранного',
            },
            errorScreen: {
              titleText: 'Не удалось получить результаты',
              helpText: 'Проверьте подключение к сети.',
            },
            noResultsScreen: {
              noResultsText: 'Ничего не найдено по запросу',
              suggestedQueryText: 'Попробуйте другой запрос',
              reportMissingResultsText: 'Считаете, что поиск неполный?',
              reportMissingResultsLinkText: 'Сообщите об этом.',
            },
          },
        },
        insights: true,
      },
    },

    carbonAds: {
      code: 'CEBIEK3N',
      placement: 'vitejsdev',
    },

    footer: {
      copyright: `© 2019–настоящее время VoidZero Inc. и участники Vite. (${commitRef})`,
      nav: [
        {
          title: 'Vite',
          items: [
            { text: 'Руководство', link: '/guide/' },
            { text: 'Конфигурация', link: '/config/' },
            { text: 'Плагины', link: '/plugins/' },
          ],
        },
        {
          title: 'Ресурсы',
          items: [
            { text: 'Команда', link: '/team' },
            { text: 'Блог', link: '/blog' },
            {
              text: 'Релизы',
              link: 'https://github.com/vitejs/vite/releases',
            },
          ],
        },
        {
          title: 'Версии',
          items: versionLinks,
        },
      ],
      social: [
        { icon: 'github', link: 'https://github.com/vitejs/vite' },
        { icon: 'discord', link: 'https://chat.vite.dev' },
        { icon: 'bluesky', link: 'https://bsky.app/profile/vite.dev' },
        { icon: 'x', link: 'https://x.com/vite_js' },
      ],
    },

    nav: [
      { text: 'Руководство', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Конфигурация', link: '/config/', activeMatch: '/config/' },
      { text: 'Плагины', link: '/plugins/', activeMatch: '/plugins/' },
      {
        text: 'Ресурсы',
        items: [
          { text: 'Команда', link: '/team' },
          { text: 'Блог', link: '/blog' },
          { text: 'Релизы', link: '/releases' },
          { text: 'Благодарности', link: '/acknowledgements' },
          {
            text: 'Реестр плагинов',
            link: 'https://registry.vite.dev/plugins',
          },
          {
            text: 'Документальный фильм',
            link: 'https://www.youtube.com/watch?v=bmWQqAKLgT4',
          },
          {
            items: [
              {
                text: 'Bluesky',
                link: 'https://bsky.app/profile/vite.dev',
              },
              {
                text: 'Mastodon',
                link: 'https://elk.zone/m.webtoo.ls/@vite',
              },
              {
                text: 'X',
                link: 'https://x.com/vite_js',
              },
              {
                text: 'Чат в Discord',
                link: 'https://chat.vite.dev',
              },
              {
                text: 'Подборка Awesome Vite',
                link: 'https://github.com/vitejs/awesome-vite',
              },
              {
                text: 'Конференция ViteConf',
                link: 'https://viteconf.org',
              },
              {
                text: 'Сообщество DEV',
                link: 'https://dev.to/t/vite',
              },
            ],
          },
        ],
      },
      {
        text: `v${viteVersion}`,
        items: [
          {
            text: 'Журнал изменений',
            link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
          },
          {
            text: 'Участие в проекте',
            link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
          },
          {
            items: versionLinks,
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Введение',
          items: [
            {
              text: 'Начало работы',
              link: '/guide/',
            },
            {
              text: 'Философия',
              link: '/guide/philosophy',
            },
            {
              text: 'Зачем Vite',
              link: '/guide/why',
            },
          ],
        },
        {
          text: 'Руководство',
          items: [
            {
              text: 'Возможности',
              link: '/guide/features',
            },
            {
              text: 'Командная строка (CLI)',
              link: '/guide/cli',
            },
            {
              text: 'Использование плагинов',
              link: '/guide/using-plugins',
            },
            {
              text: 'Предсборка зависимостей',
              link: '/guide/dep-pre-bundling',
            },
            {
              text: 'Статические ресурсы',
              link: '/guide/assets',
            },
            {
              text: 'Сборка для продакшена',
              link: '/guide/build',
            },
            {
              text: 'Деплой статического сайта',
              link: '/guide/static-deploy',
            },
            {
              text: 'Переменные окружения и режимы',
              link: '/guide/env-and-mode',
            },
            {
              text: 'Серверный рендеринг (SSR)',
              link: '/guide/ssr',
            },
            {
              text: 'Интеграция с бэкендом',
              link: '/guide/backend-integration',
            },
            {
              text: 'Устранение неполадок',
              link: '/guide/troubleshooting',
            },
            {
              text: 'Производительность',
              link: '/guide/performance',
            },
            {
              text: `Миграция с v${viteMajorVersion - 1}`,
              link: '/guide/migration',
            },
            {
              text: 'Критические изменения',
              link: '/changes/',
            },
          ],
        },
        {
          text: 'API',
          items: [
            {
              text: 'API плагинов',
              link: '/guide/api-plugin',
            },
            {
              text: 'API HMR',
              link: '/guide/api-hmr',
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript',
            },
            {
              text: 'Справочник конфигурации',
              link: '/config/',
            },
          ],
        },
        {
          text: 'API окружений',
          items: [
            {
              text: 'Введение',
              link: '/guide/api-environment',
            },
            {
              text: 'Экземпляры окружений',
              link: '/guide/api-environment-instances',
            },
            {
              text: 'Плагины',
              link: '/guide/api-environment-plugins',
            },
            {
              text: 'Фреймворки',
              link: '/guide/api-environment-frameworks',
            },
            {
              text: 'Рантаймы',
              link: '/guide/api-environment-runtimes',
            },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Конфигурация',
          items: [
            {
              text: 'Настройка Vite',
              link: '/config/',
            },
            {
              text: 'Общие опции',
              link: '/config/shared-options',
            },
            {
              text: 'Опции сервера',
              link: '/config/server-options',
            },
            {
              text: 'Опции сборки',
              link: '/config/build-options',
            },
            {
              text: 'Опции предпросмотра',
              link: '/config/preview-options',
            },
            {
              text: 'Опции оптимизации зависимостей',
              link: '/config/dep-optimization-options',
            },
            {
              text: 'Опции SSR',
              link: '/config/ssr-options',
            },
            {
              text: 'Опции Worker',
              link: '/config/worker-options',
            },
          ],
        },
      ],
      '/changes/': [
        {
          text: 'Критические изменения',
          link: '/changes/',
        },
        {
          text: 'Текущие',
          items: [],
        },
        {
          text: 'Будущие',
          items: [
            {
              text: 'this.environment в хуках',
              link: '/changes/this-environment-in-hooks',
            },
            {
              text: 'Плагинный хук HMR hotUpdate',
              link: '/changes/hotupdate-hook',
            },
            {
              text: 'Переход к API по окружениям',
              link: '/changes/per-environment-apis',
            },
            {
              text: 'SSR через API ModuleRunner',
              link: '/changes/ssr-using-modulerunner',
            },
            {
              text: 'Общие плагины при сборке',
              link: '/changes/shared-plugins-during-build',
            },
          ],
        },
        {
          text: 'Прошлые',
          items: [],
        },
      ],
    },

    outline: {
      level: [2, 3],
    },
  },
  transformHead(ctx) {
    const path = ctx.page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')

    if (path !== '404') {
      const canonicalUrl = path ? `${ogUrl}/${path}` : ogUrl
      ctx.head.push(
        ['link', { rel: 'canonical', href: canonicalUrl }],
        ['meta', { property: 'og:title', content: ctx.pageData.title }],
      )
    }

    // На главной поднять ссылки на Google Fonts выше для лучшей производительности
    if (path === '') {
      const googleFontLinks: HeadConfig[] = []
      for (let i = 0; i < ctx.head.length; i++) {
        const tag = ctx.head[i]
        if (
          tag[0] === 'link' &&
          (tag[1]?.href?.includes('fonts.googleapis.com') ||
            tag[1]?.href?.includes('fonts.gstatic.com'))
        ) {
          ctx.head.splice(i, 1)
          googleFontLinks.push(tag)
          i--
        }
      }
      ctx.head.unshift(...googleFontLinks)
    }
  },
  markdown: {
    // языки для twoslash и JSDoc в twoslash
    languages: ['ts', 'js', 'json'],
    codeTransformers: [
      transformerTwoslash(),
      // поддержка `style:*` в метаданных блока кода
      {
        root(hast) {
          const meta = this.options.meta?.__raw
            ?.split(' ')
            .find((m) => m.startsWith('style:'))
          if (meta) {
            const style = meta.slice('style:'.length)
            const rootPre = hast.children.find(
              (n): n is typeof n & { type: 'element'; tagName: 'pre' } =>
                n.type === 'element' && n.tagName === 'pre',
            )
            if (rootPre) {
              rootPre.properties.style += '; ' + style
            }
          }
        },
      },
    ],
    async config(md) {
      md.use(groupIconMdPlugin, {
        titleBar: {
          includeSnippet: true,
        },
      })
      md.use(markdownItImageSize, {
        publicDir: path.resolve(import.meta.dirname, '../public'),
      })
      await graphvizMarkdownPlugin(md)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          firebase: 'vscode-icons:file-type-firebase',
          '.gitlab-ci.yml': 'vscode-icons:file-type-gitlab',
        },
      }),
      llmstxt({
        ignoreFiles: ['blog/*', 'blog.md', 'index.md', 'team.md'],
        description: 'Инструмент сборки для веба',
        details: `\
- 💡 Мгновенный старт dev-сервера
- ⚡️ Молниеносный HMR
- 🛠️ Богатый набор возможностей
- 📦 Оптимизированная сборка
- 🔩 Универсальный интерфейс плагинов
- 🔑 Полностью типизированные API

Vite — новый тип инструментов сборки фронтенда, который заметно улучшает опыт разработки. Он состоит из двух крупных частей:

- Dev-сервер, отдающий исходники через [нативные ES-модули](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), с [встроенными возможностями](https://vite.dev/guide/features.md) и невероятно быстрым [горячим обновлением модулей (HMR)](https://vite.dev/guide/features.md#hot-module-replacement).

- [Команда сборки](https://vite.dev/guide/build.md), которая бандлит код с помощью [Rollup](https://rollupjs.org), заранее настроенная на выдачу высокооптимизированных статических ресурсов для продакшена.

Кроме того, Vite легко расширяется через [API плагинов](https://vite.dev/guide/api-plugin.md) и [JavaScript API](https://vite.dev/guide/api-javascript.md) с полной поддержкой типов.`,
      }),
    ],
    optimizeDeps: {
      include: ['@shikijs/vitepress-twoslash/client'],
    },
    define: {
      __VITE_VERSION__: JSON.stringify(viteVersion),
    },
  },
  buildEnd,
})

export default extendConfig(config)
