# Руководство по тестированию UI-компонентов

## Основные принципы

Тестирование UI-компонентов из пакета `@shri/ui-kit` строится на базе **Storybook** для визуализации и **Playwright** для снятия скриншотов. Наша цель — не проверять логику (она тестируется на интеграционном уровне), а гарантировать, что компонент корректно отображается во всех своих состояниях.

## Правила написания тестов и историй

1.  **Расположение файлов:**
    *   Все UI-компоненты находятся в `packages/ui-kit/src`.
    *   Для каждого компонента (например, `packages/ui-kit/src/Button/Button.tsx`) создается директория `__stories__`.
    *   Внутри нее создается файл с историями: `Button.stories.tsx`.
    *   Скриншот-тесты для компонентов лежат в `packages/ui-kit/__tests__`.

2.  **Структура истории:**
    *   Каждый файл `*.stories.tsx` содержит мета-информацию о компоненте и одну или несколько "историй" для каждого состояния.

3.  **Структура теста:**
    *   Тесты используют фикстуры из пакета `@shri/playwright`.
    *   Каждый тест открывает нужную историю в Storybook и делает скриншот.

4.  **Фокус на визуальных тестах:**
    *   Основной метод тестирования — **визуальный снимок (snapshot)** с помощью Playwright.
    *   Playwright сравнивает новый скриншот с эталонным. Любое визуальное расхождение приводит к падению теста.

## Запуск тестов

Для запуска тестов из корня проекта выполните:

```bash
npm run test:ui-snapshot
```

Эта команда запустит Storybook в headless-режиме и выполнит все тесты Playwright, отмеченные тегом `@ui-snapshot`.

## Пример

**История в Storybook:**

```tsx
// packages/ui-kit/src/Button/__stories__/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
```

**Скриншот-тест в Playwright:**

```ts
// packages/ui-kit/__tests__/Button.spec.ts
import { expect, test } from '@shri/playwright';

test('Компонент Button, состояние: primary @ui-snapshot', async ({ actions, pages }) => {
  // Arrange
  await actions.storybook.openStory('ui-button--primary');

  // Act
  await expect(pages.storybook.component).toBeVisible();

  // Assert
  await expect(pages.storybook.component).toHaveScreenshot('button-primary.png');
});
``` 