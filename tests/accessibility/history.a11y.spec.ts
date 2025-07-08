import { test, expect } from '@shri/playwright';

import { historyMock } from '../test-data/mocks/history';

test('TC-A11Y-HY-001: Страница истории должна быть доступна', async ({ actions, makeA11yScan }) => {
    // Arrange
    await actions.history.goto();

    // Act
    const violations = await makeA11yScan();

    // Assert
    expect(violations).toEqual([]);
});

test('TC-A11Y-HY-002: Модальное окно истории должно быть доступно', async ({ actions, makeA11yScan }) => {
    // Arrange
    await actions.history.seedHistory(historyMock);
    await actions.history.goto();

    // Act
    await actions.history.clearHistory();
    const violations = await makeA11yScan();

    // Assert
    expect(violations).toEqual([]);
}); 