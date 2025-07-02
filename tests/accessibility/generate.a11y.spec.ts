import { test, expect } from '@shri/playwright';

test('TC-A11Y-GENERATE-01: Страница генерации должна быть доступна', async ({ actions, makeA11yScan }) => {
    // Arrange
    await actions.generate.goto();

    // Act
    const violations = await makeA11yScan();

    // Assert
    expect(violations).toEqual([]);
}); 