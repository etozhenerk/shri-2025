import { expect, test } from '@shri/playwright';

test('Компонент HighlightCard, состояние: default @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-highlightcard--default');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('highlight-card-default.png');
}); 