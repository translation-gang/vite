# Опции оптимизации зависимостей

- **Связано:** [Предсборка зависимостей](/guide/dep-pre-bundling)

Если не указано иное, опции этого раздела применяются только к оптимизатору зависимостей, который используется в dev.

## optimizeDeps.entries <NonInheritBadge />

- **Тип:** `string | string[]`

По умолчанию Vite обходит все `.html` и ищет зависимости для предсборки (пропуская `node_modules`, `build.outDir`, `__tests__` и `coverage`). Если задан `build.rollupOptions.input`, используются эти точки входа.

Если это не подходит, задайте свои точки входа — значение: [шаблон `tinyglobby`](https://superchupu.dev/tinyglobby/comparison) или массив шаблонов относительно корня проекта Vite. Это заменяет вывод по умолчанию. При явном `optimizeDeps.entries` по умолчанию игнорируются только `node_modules` и `build.outDir`. Другие папки — через префикс `!` в списке. Для шаблонов, явно содержащих `node_modules`, `node_modules` не игнорируется.

## optimizeDeps.exclude <NonInheritBadge />

- **Тип:** `string[]`

Зависимости, исключаемые из предсборки.

:::warning CommonJS
CommonJS-зависимости не следует исключать из оптимизации. Если ESM-зависимость исключена, но у неё вложенная CJS-зависимость, последнюю добавьте в `optimizeDeps.include`. Пример:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include <NonInheritBadge />

- **Тип:** `string[]`

По умолчанию связанные пакеты вне `node_modules` не предсобираются. Эта опция принудительно включает предсборку.

**Экспериментально:** у библиотек с множеством глубоких импортов можно указать завершающий glob, чтобы предсобрать все глубокие импорты сразу и не пересобирать при каждом новом пути. [Обратная связь](https://github.com/vitejs/vite/discussions/15833). Пример:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.rolldownOptions <NonInheritBadge />

- **Тип:** <code>Omit<<a href="https://rolldown.rs/reference/Interface.RolldownOptions">RolldownOptions</a>, 'input' | 'logLevel' | 'output'> & { output?: Omit<<a href="https://rolldown.rs/reference/#:~:text=Output%20Options">RolldownOutputOptions</a>, 'format' | 'sourcemap' | 'dir' | 'banner'> }</code>

Опции для Rolldown при сканировании и оптимизации зависимостей.

Часть опций опущена: их изменение несовместимо с оптимизацией зависимостей Vite.

- `plugins` объединяются с dep-плагином Vite

## optimizeDeps.esbuildOptions <NonInheritBadge />

- **Тип:** <code>Omit<<a href="https://esbuild.github.io/api/#general-options">EsbuildBuildOptions</a>, 'bundle' | 'entryPoints' | 'external' | 'write' | 'watch' | 'outdir' | 'outfile' | 'outbase' | 'outExtension' | 'metafile'></code>
- **Устарело**

Внутри преобразуется в `optimizeDeps.rolldownOptions`. Используйте `optimizeDeps.rolldownOptions`.

## optimizeDeps.force <NonInheritBadge />

- **Тип:** `boolean`

При `true` — принудительная предсборка, кэш оптимизированных зависимостей игнорируется.

## optimizeDeps.noDiscovery <NonInheritBadge />

- **Тип:** `boolean`
- **По умолчанию:** `false`

При `true` автоматическое обнаружение зависимостей отключено; оптимизируются только перечисленные в `optimizeDeps.include`. CJS-only зависимости в dev должны быть в `optimizeDeps.include`.

## optimizeDeps.holdUntilCrawlEnd <NonInheritBadge />

- **Экспериментально:** [Обратная связь](https://github.com/vitejs/vite/discussions/15834)
- **Тип:** `boolean`
- **По умолчанию:** `true`

При включении первый результат оптимизации deps удерживается, пока на холодном старте не обойдены все статические импорты. Это снижает полные перезагрузки страницы при появлении новых зависимостей и общих чанков. Если сканер и `include` находят все зависимости, опцию можно отключить, чтобы браузер параллелил запросы.

## optimizeDeps.disabled <NonInheritBadge />

- **Устарело**
- **Экспериментально:** [Обратная связь](https://github.com/vitejs/vite/discussions/13839)
- **Тип:** `boolean | 'build' | 'dev'`
- **По умолчанию:** `'build'`

Устарело. С Vite 5.1 предсборка зависимостей при build убрана. `optimizeDeps.disabled: true` или `'dev'` отключает оптимизатор; `false` или `'build'` оставляет оптимизатор в dev включённым.

Чтобы полностью отключить оптимизатор: `optimizeDeps.noDiscovery: true` и пустой/не заданный `optimizeDeps.include`.

:::warning
Предсборка при build была **экспериментальной**. Проекты с `@rollup/plugin-commonjs` через `build.commonjsOptions: { include: [] }` получат предупреждение о необходимости снова включить поддержку CJS при бандлинге.
:::

## optimizeDeps.needsInterop <NonInheritBadge />

- **Экспериментально**
- **Тип:** `string[]`

Принудительный ESM-interop при импорте этих зависимостей. Vite обычно сам определяет interop; опция редко нужна. Разные комбинации зависимостей могут давать разную предсборку — добавление в `needsInterop` ускоряет холодный старт, избегая полных перезагрузок. При необходимости Vite выведет предупреждение с предложением добавить пакет в массив.
