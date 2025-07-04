import { expect, test } from '@shri/playwright';

test('Компонент Icons, состояние: size 24 @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-icons--size-24');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('icons-size-24.png');
});

test('Компонент Icons, состояние: size 48 @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-icons--size-48');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('icons-size-48.png');
}); 