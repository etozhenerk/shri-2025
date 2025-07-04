# Пакет @shri/playwright

## Описание

`@shri/playwright` — это пакет, который инкапсулирует всю логику для E2E и скриншот-тестирования в проекте. Он предоставляет кастомные фикстуры, Page Objects и Actions, чтобы сделать тесты более чистыми, читаемыми и удобными в поддержке.

## Ключевая особенность: Кастомные фикстуры

Вместо того чтобы импортировать Page Objects и Actions напрямую в каждом тестовом файле, мы используем кастомные фикстуры Playwright, которые предоставляют все необходимое через параметры тестовой функции.

-   **`test` и `expect`**: Импортируются из `@shri/playwright`, а не из `@playwright/test`.
-   **`pages`**: Объект, содержащий экземпляры всех Page Objects (`homePage`, `generatePage`, `storybook`, и т.д.).
-   **`actions`**: Объект, содержащий экземпляры всех Actions (`homeActions`, `generateActions`, и т.д.).
-   **`mocker`**: Утилита для мокирования сетевых запросов.

## Структура пакета

-   `src/`: Исходный код утилит для тестирования.
    -   `actions/`: Действия-хелперы, инкапсулирующие повторяющиеся шаги.
    -   `page-objects/`: Page Object модели для всех страниц приложения.
    -   `support/`: Файлы поддержки, включая определение кастомных фикстур (`fixtures.ts`).
    -   `mocker/`: Утилита для мокирования API.
-   `package.json`: Зависимости пакета.

## Пример использования

```ts
// tests/functional/home.spec.ts

// Импортируем test и expect из нашего пакета
import { test, expect } from '@shri/playwright';

test('Пользователь может загрузить валидный файл', async ({ page, pages, actions, mocker }) => {
  // Мокируем успешный ответ API
  await mocker.mock('analysis-success');

  // Act: Выполняем действия
  await actions.home.open();
  await actions.home.uploadFile('test-data.csv');

  // Assert: Проверяем результат
  await expect(pages.homePage.getHighlightsSection()).toBeVisible();
  await expect(page).toHaveURL(/generate/);
}); 