# Руководство по написанию E2E-тестов (Playwright)

## Основные принципы

E2E-тесты эмулируют реальные пользовательские сценарии от начала и до конца. Они проверяют интеграцию всех частей приложения: UI, управление состоянием и взаимодействие с API (замоканным).

## Пакет `@shri/playwright`

Вся логика и утилиты для тестирования инкапсулированы в пакете `@shri/playwright`.

-   **Кастомные фикстуры**: Вместо прямого импорта Page Objects и Actions, мы используем кастомные фикстуры. Это делает код тестов чище и проще в поддержке.
    -   `pages`: Объект со всеми Page Objects.
    -   `actions`: Объект со всеми Actions.
    -   `mocker`: Утилита для мокирования API.
-   **Единый импорт**: Все необходимое для теста импортируется из `@shri/playwright`.

```ts
import { test, expect } from '@shri/playwright';
```

Подробное описание пакета и его API находится в [документации для разработчиков](../../docs/packages/playwright/index.md).

## Расположение файлов

-   **Тесты**: `tests/functional/`
-   **Тестовые данные**: `tests/test-data/`
-   **Моки**: `tests/test-data/mocks/`

## Правила написания тестов

1.  **Декларативность**: Тесты должны быть написаны в декларативном стиле, описывая *что* происходит, а не *как*. Используйте `actions` для выполнения сложных последовательностей действий.
2.  **Структура (AAA)**: Придерживайтесь структуры Arrange-Act-Assert.
3.  **Мокирование**: Всегда мокируйте API-запросы с помощью фикстуры `mocker`. Не полагайтесь на реальный бэкенд.
4.  **Запрет `describe`**: Не используйте `describe` или `test.describe`. Поддерживайте плоскую структуру тестов. [[memory:5297724022150961901]]

## Пример теста

```ts
// tests/functional/home.spec.ts
import { test, expect } from '@shri/playwright';

test('Пользователь может загрузить валидный файл', async ({ page, pages, actions, mocker }) => {
  // Arrange (Подготовка)
  await mocker.mock('analysis-success'); // Мокируем успешный ответ
  await actions.home.open();

  // Act (Действие)
  await actions.home.uploadFile('test-data.csv');

  // Assert (Проверка)
  await expect(pages.homePage.getHighlightsSection()).toBeVisible();
  await expect(page).toHaveURL(/generate/);
});
```

## Запуск тестов

-   `npm run test:e2e`: Запуск всех E2E тестов.
-   `npm run test:ui-snapshot`: Запуск UI-снэпшот тестов для пакета `@shri/ui-kit`.
-   `npm test`: Запуск всех тестов в проекте (unit, integration, e2e). 