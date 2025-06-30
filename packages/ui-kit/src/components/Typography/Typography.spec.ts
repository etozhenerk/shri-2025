import { expect, test } from '@shri/playwright';

test('Компонент Typography, состояние: default @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--default');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-default.png');
});

test('Компонент Typography, состояние: size-l @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--size-l');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-size-l.png');
});

test('Компонент Typography, состояние: size-s @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--size-s');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-size-s.png');
});

test('Компонент Typography, состояние: color-light @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--color-light');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-color-light.png');
});

test('Компонент Typography, состояние: color-error @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--color-error');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-color-error.png');
});

test('Компонент Typography, состояние: weight-bold @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--weight-bold');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-weight-bold.png');
});

test('Компонент Typography, состояние: style-italic @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--style-italic');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-style-italic.png');
});

test('Компонент Typography, состояние: as-h1 @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--as-h-1');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-as-h1.png');
});

test('Компонент Typography, состояние: line-clamp @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-typography--line-clamp');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('typography-line-clamp.png');
}); 