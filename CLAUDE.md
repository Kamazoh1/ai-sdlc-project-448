# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

Симулятор политик доступа: React 19 + Mantine + TypeScript, сборка Vite, тесты Vitest. Серверной части нет, вся конфигурация (пользователи, группы, сервисы, разрешения) живёт в `localStorage` браузера. Учебный проект Хекслета: `.github/workflows/hexlet-check.yml` не удалять, не править и не переименовывать репозиторий.

## Команды

```bash
make setup        # npm ci + build (tsc --noEmit && vite build)
make dev          # dev-сервер Vite на :8080
make start        # vite preview собранного dist/ на :8080
make test         # vitest run
make lint         # oxlint + проверка форматирования oxfmt
make lint-fix     # oxfmt + oxlint --fix
make lint-arch    # ast-grep scan src по правилам из rules/*.yml
npm run typecheck # только tsc --noEmit
```

Один тест: `npx vitest run src/domain/access.test.ts` или `npx vitest run -t "часть имени теста"`.

CI (`.github/workflows/ci.yml`) гоняет `make setup`, `make test`, `make lint`, `make lint-arch`; `pages.yml` публикует `dist/` на GitHub Pages при пуше в `main` (поэтому `base: "./"` в `vite.config.ts`).

## Обязательные документы

Любое изменение сверяется с двумя документами — их проверяет независимое ревью диффа:

- `docs/architecture.md` — слои и правила импортов.
- `docs/security-requirements.md` — четыре ограничения СБ с проверяемыми следствиями.

## Архитектура

Три слоя, зависимости только сверху вниз:

- `src/domain` — `model.ts` (типы) и `access.ts` (`calculateAccess`). Чистые функции: без браузерных API и без чтения часов (`Date.now()`, `new Date()` без аргументов запрещены), момент приходит параметром `at`. Вся логика доступа — только здесь, экраны не пересчитывают доступ сами.
- `src/app` — `index.ts` экспортирует хук `useSimulator` (конфигурация, `checkAccess`, выдача/отзыв, экспорт/импорт) и реэкспортирует доменные типы. Только этот слой трогает `localStorage` (`storage.ts`) и берёт текущее время. `config-file.ts` — единый JSON-формат для экспорта, импорта и хранения (`version: 1`); `permissions.ts` — неизменяемые операции над конфигурацией; `seed.ts` — учебные данные.
- `src/components` — экраны на Mantine. Импортируют всё, включая типы, только из `../app`; `src/domain` и модуль хранилища не импортируют. Исключение — тесты компонентов могут брать из `src/app` seed, `STORAGE_KEY` и функции формата файла.

Новый общий тип объявляется в `src/domain` и при необходимости реэкспортируется из `src/app/index.ts`; типы самого слоя приложения (`GrantResult`, `ImportResult`) объявляются в `src/app/index.ts`.

## Ограничения, которые легко нарушить

- В `src` нет `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket` — данные не покидают браузер.
- Импорт: `parseConfigFile` проверяет файл целиком; при любой ошибке конфигурация и `localStorage` не меняются. Ссылки на несуществующие записи отвергают весь файл.
- Выдача и удаление меняют ровно одно разрешение; остальные записи остаются равными прежним.
- Доступ может иметь несколько источников (прямой и через группы); удаление одного источника не должно снимать доступ, пока есть другой.

## Тесты

Реализацию ведёт скилл `tdd`: вызывай его при добавлении новой логики и при исправлении багов.

Лежат рядом с кодом (`*.test.ts`, `*.test.tsx`), окружение jsdom. `src/test-setup.ts` очищает `localStorage` перед каждым тестом и подставляет заглушки `matchMedia` и `ResizeObserver` для Mantine.

## Spec-driven workflow

В репозитории настроен OpenSpec (`openspec/`, схема `spec-driven`, артефакты на русском; служебные заголовки и SHALL/MUST — на английском). Изменения ведутся через скиллы `openspec-*` в `.claude/skills/`.
