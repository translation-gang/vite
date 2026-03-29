# Плагины

:::tip ПРИМЕЧАНИЕ
Vite стремится поддерживать из коробки распространённые паттерны веб-разработки. Прежде чем искать плагин Vite или совместимый с Rollup, загляните в [руководство по возможностям](../guide/features.md). Много случаев, где в проекте на Rollup нужен был бы плагин, в Vite уже покрыты.
:::

Как пользоваться плагинами — в разделе [Использование плагинов](../guide/using-plugins).

## Официальные плагины

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

Поддержка однофайловых компонентов Vue 3.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

Поддержка JSX во Vue 3 (через [отдельную трансформацию Babel](https://github.com/vuejs/babel-plugin-jsx)).

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

Поддержка React Fast Refresh через [Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer).

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react-swc)

В режиме разработки Oxc заменяется на [SWC](https://swc.rs/) для использования плагинов SWC. При production-сборке при наличии плагинов используются SWC и Oxc Transformer. В крупных проектах с пользовательскими плагинами холодный старт и горячая замена модулей (HMR) могут быть заметно быстрее, если плагин также доступен для SWC.

### [@vitejs/plugin-rsc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc)

Vite поддерживает [React Server Components (RSC)](https://react.dev/reference/rsc/server-components) через этот плагин. Используется [Environment API](/guide/api-environment), чтобы дать низкоуровневые примитивы, которыми могут пользоваться React-фреймворки для интеграции RSC. Минимальное автономное RSC-приложение можно попробовать так:

```bash
npm create vite@latest -- --template rsc
```

Подробнее — в [документации плагина](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc).

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

Поддержка устаревших браузеров в production-сборке.

## Плагины сообщества

Список плагинов, опубликованных в npm — в [реестре плагинов Vite](https://registry.vite.dev/plugins).

## Встроенные плагины Rolldown

Под капотом Vite использует [Rolldown](https://rolldown.rs/) и предоставляет несколько встроенных плагинов для типовых сценариев.

Подробнее — в [разделе встроенных плагинов Rolldown](https://rolldown.rs/builtin-plugins/).

## Плагины Rolldown / Rollup

[Плагины Vite](../guide/api-plugin) расширяют интерфейс плагинов Rollup. Дополнительно — [раздел о совместимости с плагинами Rollup](../guide/api-plugin#rolldown-plugin-compatibility).
