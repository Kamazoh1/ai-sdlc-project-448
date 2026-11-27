# Ревью изменения group-filter

Дифф: `git diff main...origin/group-filter` (коммиты `d32a145`…`da9c6a1`). Артефакты: `openspec/changes/group-filter/`. Сверка с `docs/security-requirements.md` и `docs/architecture.md` в версии ветки.

## Что проверено

**А. Соответствие артефактам.** Задачи 1.1–4.2 из `tasks.md` отражены в диффе: состояние `groupId` и `group-filter` перед `user-select` (`src/components/App.tsx:19`, `:39–48`), фильтрация пунктов по `groupIds` (`:24–25`, `:57`), сброс в обработчике смены группы без эффекта (`:28–34`), тесты (`src/components/App.test.tsx:70–148`), раздел `access-check-screen` в `openspec/traceability.md`. `src/domain` и `src/app` в диффе не меняются. Поведения экрана сверх proposal/design/spec в диффе нет. Остальная часть диффа (OpenSpec, скиллы, правила ast-grep, README, обновление зависимостей) — инструменты и документация, поведения приложения она не добавляет.

**Б. Ограничения СБ.**
1. Конфигурация в браузере — истинно: в `src` дифф не добавляет `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`; фильтр не пишет никуда за пределы `useState`.
2. Импорт целиком — истинно: `src/app/config-file.ts`, `storage.ts`, `ConfigTransfer.tsx` не изменены.
3. Только выбранные разрешения — истинно: `permissions.ts` и `PermissionsPanel.tsx` не изменены, фильтр не вызывает операций.
4. Независимые источники — истинно: `src/domain/access.ts` не изменён, `checkAccess` вызывается с тем же `userId` (`App.tsx:23`).

**В. Архитектура.** Единый модуль расчёта: доступ берётся только из `checkAccess`, отбор по `groupIds` — выбор пунктов списка, не расчёт. Время: `src/domain` не меняется. Слой приложения: `App.tsx` импортирует значения и типы только из `../app` (`:3–4`), к `localStorage` не обращается; граница типов соблюдена, новых общих типов нет.

**Г. Покрытие сценариев.**

| Сценарий | Тест |
| --- | --- |
| Фильтр при открытии экрана | `src/components/App.test.tsx:71` |
| Список сотрудников по умолчанию | `src/components/App.test.tsx:92` |
| Возврат к «Все группы» | `src/components/App.test.tsx:103` |
| Выбрана группа «Поддержка» | `src/components/App.test.tsx:85` |
| Сотрудник из выбранной группы | `src/components/App.test.tsx:127` |
| Сотрудник не из выбранной группы | `src/components/App.test.tsx:117` |
| Сброшенный сотрудник не возвращается | `src/components/App.test.tsx:138` |
| Проверка доступа без фильтра | `src/components/App.test.tsx:27` (существующий) |

## Находки

| № | Серьёзность | Где | Что нарушено | Пункт требования | Решение |
| --- | --- | --- | --- | --- | --- |

Итог: high — 0, medium — 0, low — 0; нарушений не найдено.
