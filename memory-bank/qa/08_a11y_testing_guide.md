# Руководство по тестированию доступности (a11y)

В проекте внедрена двухуровневая система автоматического тестирования доступности. Она помогает обнаруживать проблемы на ранних этапах и предотвращать регрессии.

## 1. Инструменты

- **`axe-core`**: Основной движок для анализа DOM на соответствие стандартам WCAG.
- **`jest-axe`**: Адаптер для использования `axe-core` в среде Vitest / React Testing Library.
- **`axe-playwright`**: Адаптер для использования `axe-core` в E2E-тестах на Playwright.

## 2. Уровни тестирования

### Интеграционные тесты (Vitest)

- **Цель**: Проверка доступности отдельных компонентов в изолированной среде.
- **Расположение**: Файлы `*.a11y.spec.tsx` рядом с компонентом.
- **Соглашение**: Названия тестов (`describe`, `test`) должны быть на русском языке.

**Пример (`Button.a11y.spec.tsx`):**
```typescript
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, test, expect } from 'vitest';
import { Button } from '../Button';

// Важно: в vitest.setup.ts настроен expect.extend(toHaveNoViolations)
// из 'jest-axe', поэтому toHaveNoViolations() доступен глобально.

describe('Доступность компонента Button', () => {
  test('не должен иметь нарушений доступности для основного варианта', async () => {
    // Arrange
    const { container } = render(<Button variant="primary">Нажми меня</Button>);

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
```

### E2E-тесты (Playwright)

- **Цель**: Проверка доступности целых страниц в реальном браузере. Позволяет выявлять проблемы, возникающие при взаимодействии компонентов (например, контрастность, структура заголовков, управление фокусом).
- **Расположение**: Директория `tests/accessibility/`.
- **Соглашение**: Плоская структура файлов, названия тестов на русском языке.

**Пример (`home.a11y.spec.ts`):**
```typescript
import { test, expect } from '@shri/playwright';
import AxeBuilder from '@axe-core/playwright';

test('Главная страница не должна иметь нарушений доступности', async ({ page, actions }) => {
  // Arrange
  await actions.home.goto();

  // Act
  const accessibilityScanResults = await new AxeBuilder({ page })
    .exclude('#luna-notifications-container') // Исключаем сторонние элементы
    .analyze();

  // Assert
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## 3. Запуск тестов

Для запуска всех тестов доступности используется единая команда:

```bash
npm run test:a11y
``` 