import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, test, expect } from 'vitest';

import { Button } from '../Button';

describe('Доступность компонента Button', () => {
  test('не должен иметь нарушений доступности для основного варианта', async () => {
    // Arrange
    const { container } = render(<Button variant="primary">Нажми меня</Button>);

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });

  test('не должен иметь нарушений доступности для неактивного варианта', async () => {
    // Arrange
    const { container } = render(<Button disabled>Нажми меня</Button>);

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
}); 