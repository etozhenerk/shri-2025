import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, test, expect } from 'vitest';

import { HistoryItem } from './HistoryItem';

describe('Доступность компонента HistoryItem', () => {
  test('не должен иметь нарушений доступности с хайлайтами', async () => {
    // Arrange
    const { container } = render(
      <HistoryItem
        fileName="test.csv"
        date="2024-01-15"
        hasHighlights={true}
        onClick={() => {}}
        onDelete={() => {}}
      />
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results.violations.length).toBe(0);
  });

  test('не должен иметь нарушений доступности без хайлайтов', async () => {
    // Arrange
    const { container } = render(
      <HistoryItem
        fileName="test.csv"
        date="2024-01-15"
        hasHighlights={false}
        onClick={() => {}}
        onDelete={() => {}}
      />
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results.violations.length).toBe(0);
  });
}); 