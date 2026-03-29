# Опции preview

Если не указано иное, опции этого раздела применяются только к preview.

## preview.host

- **Тип:** `string | boolean`
- **По умолчанию:** [`server.host`](./server-options#server-host)

IP-адреса, на которых сервер должен слушать.
Установите `0.0.0.0` или `true`, чтобы слушать на всех адресах, включая LAN и публичные.

Задаётся в CLI через `--host 0.0.0.0` или `--host`.

::: tip ПРИМЕЧАНИЕ

Иногда отвечают другие серверы, а не Vite.
Подробнее см. [`server.host`](./server-options#server-host).

:::

## preview.allowedHosts

- **Тип:** `string[] | true`
- **По умолчанию:** [`server.allowedHosts`](./server-options#server-allowedhosts)

Имена хостов, на которые Vite может отвечать.

Подробнее см. [`server.allowedHosts`](./server-options#server-allowedhosts).

## preview.port

- **Тип:** `number`
- **По умолчанию:** `4173`

Порт сервера. Если порт занят, Vite попробует следующий свободный — фактический порт может отличаться.

**Пример:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **Тип:** `boolean`
- **По умолчанию:** [`server.strictPort`](./server-options#server-strictport)

При `true` процесс завершится, если порт занят, вместо перебора следующего порта.

## preview.https

- **Тип:** `https.ServerOptions`
- **По умолчанию:** [`server.https`](./server-options#server-https)

Включить TLS + HTTP/2.

Подробнее см. [`server.https`](./server-options#server-https).

## preview.open

- **Тип:** `boolean | string`
- **По умолчанию:** [`server.open`](./server-options#server-open)

Автоматически открыть приложение в браузере при старте сервера. Если значение — строка, она используется как pathname URL. Чтобы открыть в конкретном браузере, задайте `process.env.BROWSER` (например `firefox`). Дополнительные аргументы — через `process.env.BROWSER_ARGS` (например `--incognito`).

`BROWSER` и `BROWSER_ARGS` можно задать в `.env`. См. [пакет `open`](https://github.com/sindresorhus/open#app).

## preview.proxy

- **Тип:** `Record<string, string | ProxyOptions>`
- **По умолчанию:** [`server.proxy`](./server-options#server-proxy)

Правила прокси для preview-сервера. Объект пар `{ key: options }`. Если ключ начинается с `^`, он трактуется как `RegExp`. Опция `configure` даёт доступ к экземпляру прокси.

Используется [`http-proxy-3`](https://github.com/sagemathinc/http-proxy-3). Полный список опций [здесь](https://github.com/sagemathinc/http-proxy-3#options).

## preview.cors

- **Тип:** `boolean | CorsOptions`
- **По умолчанию:** [`server.cors`](./server-options#server-cors)

CORS для preview-сервера.

Подробнее см. [`server.cors`](./server-options#server-cors).

## preview.headers

- **Тип:** `OutgoingHttpHeaders`

Заголовки ответа сервера.
