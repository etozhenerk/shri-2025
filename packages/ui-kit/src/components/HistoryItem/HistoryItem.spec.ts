import { expect, test } from '@shri/playwright';

test('Компонент HistoryItem, состояние: with highlights @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-historyitem--with-highlights');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('history-item-with-highlights.png');
});

test('Компонент HistoryItem, состояние: without highlights @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-historyitem--without-highlights');

    // Act
    await expect(pages.storybook.component).toBeVisible();

    // Assert
    await expect(pages.storybook.component).toHaveScreenshot('history-item-without-highlights.png');
}); 