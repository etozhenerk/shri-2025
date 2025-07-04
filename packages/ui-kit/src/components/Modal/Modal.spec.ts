import { expect, test } from '@shri/playwright';

test('Компонент Modal, состояние: default @ui-snapshot', async ({ actions, pages }) => {
    // Arrange
    await actions.storybook.openStory('ui-modal--default');

    // Act
    await pages.storybook.openModalButton.click();
    await expect(pages.storybook.modal).toBeVisible();

    // Assert
    await expect(pages.storybook.modal).toHaveScreenshot('modal-default.png');
}); 