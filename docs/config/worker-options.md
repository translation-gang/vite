# Опции worker

Если не указано иное, опции этого раздела применяются к dev, build и preview.

## worker.format

- **Тип:** `'es' | 'iife'`
- **По умолчанию:** `'iife'`

Формат вывода бандла воркера.

## worker.plugins

- **Тип:** [`() => (Plugin | Plugin[])[]`](./shared-options#plugins)

Плагины Vite для бандлов воркеров. [config.plugins](./shared-options#plugins) в dev для воркеров недостаточно — для build настраивайте здесь.
Функция должна возвращать новые экземпляры плагинов (параллельные сборки воркеров через rolldown). Изменение `config.worker` в хуке `config` не учитывается.

## worker.rolldownOptions

- **Тип:** [`RolldownOptions`](https://rolldown.rs/reference/)

Опции Rolldown для сборки бандла воркера.

## worker.rollupOptions

- **Тип:** `RolldownOptions`
- **Устарело**

Псевдоним опции `worker.rolldownOptions`. Используйте `worker.rolldownOptions`.
