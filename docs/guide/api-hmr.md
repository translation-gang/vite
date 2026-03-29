# HMR API {#hmr-api}

:::tip Примечание
Это клиентский HMR API. Обновления HMR в плагинах — см. [handleHotUpdate](./api-plugin#handlehotupdate).

Ручной HMR API в основном для авторов фреймворков и инструментов. Конечному пользователю HMR обычно уже настроен в шаблонах фреймворка.
:::

Ручной HMR API Vite доступен через объект `import.meta.hot`:

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type {
  CustomEventName,
  InferCustomEventPayload,
} from 'vite/types/customEvent.d.ts'

// ---cut---
interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends CustomEventName>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends CustomEventName>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends CustomEventName>(
    event: T,
    data?: InferCustomEventPayload<T>,
  ): void
}
```

## Обязательная проверка

Оборачивайте вызовы HMR в условие, чтобы в production их вырезало tree-shaking:

```js
if (import.meta.hot) {
  // HMR code
}
```

## IntelliSense в TypeScript

Типы для `import.meta.hot` в [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts). Добавьте `"vite/client"` в `types` в `tsconfig.json`:

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

## `hot.accept(cb)`

Самопринятие модуля: `import.meta.hot.accept` с колбэком, получающим обновлённый модуль:

```js twoslash
import 'vite/client'
// ---cut---
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // newModule is undefined when SyntaxError happened
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

Модуль, который «принимает» горячие обновления, считается **границей HMR**.

```dot
digraph hmr_boundary {
  rankdir=RL
  ranksep=0.3
  node [shape=box style="rounded,filled" fontname="Arial" fontsize=11 margin="0.2,0.1" fontcolor="${#3c3c43|#ffffff}" color="${#c2c2c4|#3c3f44}"]
  edge [color="${#67676c|#98989f}" fontname="Arial" fontsize=10 fontcolor="${#67676c|#98989f}"]
  bgcolor="transparent"

  root [label="main.js" fillcolor="${#f6f6f7|#2e2e32}"]
  parent [label="App.vue" fillcolor="${#f6f6f7|#2e2e32}"]
  boundary [label="Component.vue\n(HMR boundary)\nhot.accept()" fillcolor="${#def5ed|#15312d}" color="${#18794e|#3dd68c}" penwidth=2]
  edited [label="utils.js\n(edited)" fillcolor="${#fcf4dc|#38301a}" color="${#915930|#f9b44e}" penwidth=2]

  boundary -> edited [label="imports" color="${#915930|#f9b44e}" style=bold]
  parent -> boundary [label="imports" style=dashed]
  root -> parent [label="imports" style=dashed]
}
```

Vite на самом деле не подменяет исходно импортированный модуль: если граница HMR реэкспортирует зависимости, она должна обновлять эти реэкспорты (через `let`). Импортёры выше по графу от границы об изменении не уведомляются. Такой упрощённый HMR достаточен для большинства сценариев dev без дорогих прокси-модулей.

Вызов должен буквально выглядеть как `import.meta.hot.accept(` в исходнике (с учётом пробелов) — так работает статический анализ Vite для включения HMR у модуля.

## `hot.accept(deps, cb)`

Модуль может принимать обновления прямых зависимостей без собственной перезагрузки:

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---cut---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // the callback receives the updated './foo.js' module
    newFoo?.foo()
  })

  // Can also accept an array of dep modules:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // The callback receives an array where only the updated module is
      // non null. If the update was not successful (syntax error for ex.),
      // the array is empty
    },
  )
}
```

## `hot.dispose(cb)`

Самопринимающийся модуль или модуль, который ждёт принятия снаружи, может вызвать `hot.dispose` для очистки побочных эффектов старой версии:

```js twoslash
import 'vite/client'
// ---cut---
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // cleanup side effect
  })
}
```

## `hot.prune(cb)`

Колбэк при удалении модуля со страницы (больше не импортируется). По сравнению с `hot.dispose` — когда при обновлениях побочные эффекты вы чистите сами в коде, а при снятии модуля со страницы нужна отдельная очистка. Vite использует для импортов `.css`.

```js twoslash
import 'vite/client'
// ---cut---
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // cleanup side effect
  })
}
```

## `hot.data`

Объект `import.meta.hot.data` сохраняется между версиями одного и того же обновляемого модуля — можно передать данные от предыдущей версии к следующей.

Переприсваивать сам `data` нельзя — мутируйте свойства, чтобы не затереть данные от других обработчиков.

```js twoslash
import 'vite/client'
// ---cut---
// ok
import.meta.hot.data.someValue = 'hello'

// not supported
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

Сейчас no-op для обратной совместимости. Чтобы модуль не обновлялся по HMR, используйте `hot.invalidate()`.

## `hot.invalidate(message?: string)`

Самопринимающийся модуль может во время выполнения понять, что не может обработать обновление; тогда нужно пробросить инвалидацию импортёрам. `import.meta.hot.invalidate()` инвалидирует импортёров вызывающего модуля, как если бы он не был самопринимающимся. Сообщение попадёт в консоль браузера и в терминал.

Даже если сразу после этого вызываете `invalidate`, всё равно нужен `import.meta.hot.accept`, иначе клиент HMR не подпишется на дальнейшие изменения. Рекомендуется вызывать `invalidate` внутри колбэка `accept`:

```js twoslash
import 'vite/client'
// ---cut---
import.meta.hot.accept((module) => {
  // You may use the new module instance to decide whether to invalidate.
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)` {#hot-on-event-cb}

Подписка на событие HMR.

События, которые шлёт Vite:

- `'vite:beforeUpdate'` — перед применением обновления (замена модуля)
- `'vite:afterUpdate'` — после применения
- `'vite:beforeFullReload'` — перед полной перезагрузкой
- `'vite:beforePrune'` — перед удалением ненужных модулей
- `'vite:invalidate'` — при `import.meta.hot.invalidate()`
- `'vite:error'` — ошибка (например синтаксис)
- `'vite:ws:disconnect'` — обрыв WebSocket
- `'vite:ws:connect'` — соединение WebSocket (восстановлено)

Свои события могут слать плагины. См. [handleHotUpdate](./api-plugin#handlehotupdate).

## `hot.off(event, cb)`

Снять обработчик с события.

## `hot.send(event, data)` {#hot-send-event-payload}

Отправить кастомное событие на dev-сервер Vite.

Если вызвать до подключения, данные буферизуются до установки соединения.

Подробнее: [Обмен клиент–сервер](/guide/api-plugin.html#client-server-communication), в том числе [типизация своих событий](/guide/api-plugin.html#typescript-for-custom-events).

## Дополнительно

Как устроен HMR и как пользоваться API:

- [Hot Module Replacement is Easy](https://bjornlu.com/blog/hot-module-replacement-is-easy)
