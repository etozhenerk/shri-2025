import { test, expect } from '@shri/playwright';

test('TC-A11Y-HP-001: Главная страница должна быть доступна', async ({ actions, makeA11yScan }) => {
    // Arrange
    await actions.home.goto();

    // Act
    const violations = await makeA11yScan();

    // Assert
    expect(violations).toEqual([]);
});
