import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, test, expect } from 'vitest';

import { Typography } from './Typography';

describe('Доступность компонента Typography', () => {
  test('не должен иметь нарушений доступности с базовыми пропсами', async () => {
    // Arrange
    const { container } = render(<Typography>Пример текста</Typography>);

    // Act
    const results = await axe(container);

    // Assert
    expect(results.violations.length).toBe(0);
  });

  test('не должен иметь нарушений доступности с aria-live', async () => {
    // Arrange
    const { container } = render(
      <Typography aria-live="polite">Сообщение об обновлении</Typography>
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results.violations.length).toBe(0);
  });

  test('не должен иметь нарушений доступности с aria-label', async () => {
    // Arrange
    const { container } = render(
      <Typography aria-label="Подпись для скрин-ридера">
        Визуальный текст
      </Typography>
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results.violations.length).toBe(0);
  });

  test('не должен иметь нарушений доступности как заголовок', async () => {
    // Arrange
    const { container } = render(
      <Typography as="h1" size="xl">
        Основной заголовок страницы
      </Typography>
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results.violations.length).toBe(0);
  });
}); 