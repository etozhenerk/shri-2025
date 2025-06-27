import { expect, test } from '@shri/playwright';

import { historyMock } from '../test-data/mocks/history';

test('TC-HY-008: Скриншот состояния страницы "История" с заполненным списком', async ({ page, actions }) => {
    await actions.history.seedHistory(historyMock);
    await page.goto('/history');

    await test.step('Шаг 1: Сделать и сравнить скриншот страницы', async () => {
        await expect(page).toHaveScreenshot('history-page-with-list.png');
    });
});

test('TC-HY-009: Скриншот состояния модального окна с деталями истории', async ({ page, actions, pages }) => {
    await actions.history.seedHistory(historyMock);
    await page.goto('/history');

    await test.step('Шаг 1: Кликнуть на первый элемент в списке истории', async () => {
        await actions.history.openHistoryItem(historyMock[0].fileName);

        await expect(pages.history.historyModal.root).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот модального окна', async () => {
        await expect(pages.history.historyModal.root).toHaveScreenshot('history-modal.png');
    });
});

test('TC-HY-010: Скриншот состояния пустой страницы "История"', async ({ page, actions }) => {
    await actions.history.clearHistoryAndReload();

    await test.step('Шаг 1: Сделать и сравнить скриншот страницы', async () => {
        await expect(page).toHaveScreenshot('history-page-empty.png');
    });
});
