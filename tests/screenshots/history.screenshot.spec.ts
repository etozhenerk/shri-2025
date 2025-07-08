import { expect, test } from '@shri/playwright';
import { historyMock } from '@tests/test-data/mocks/history';

const TEST_OPTIONS = { maxDiffPixelRatio: 0.05 };

test('TC-HY-008: Скриншот списка записей в истории', async ({ actions, pages }) => {
    await actions.history.seedHistory(historyMock);

    await test.step('Шаг 1: Сделать и сравнить скриншот списка с записями', async () => {
        await expect(pages.history.historyItems.first()).toBeVisible();
        await expect(pages.history.historyList).toHaveScreenshot('history-page-with-list.png', TEST_OPTIONS);
    });
});

test('TC-HY-009: Скриншот модального окна с деталями истории', async ({ actions, pages }) => {
    await actions.history.seedHistory(historyMock);
    await actions.history.openHistoryItem(historyMock[0].fileName);

    await test.step('Шаг 2: Сделать и сравнить скриншот модального окна', async () => {
        await expect(pages.history.historyModal.root).toBeVisible();
        await expect(pages.history.historyModal.root).toHaveScreenshot('history-modal.png', TEST_OPTIONS);
    });
});

test('TC-HY-010: Скриншот пустого списка истории', async ({ actions, pages }) => {
    await actions.history.clearHistoryAndReload();

    await test.step('Шаг 1: Сделать и сравнить скриншот пустой страницы', async () => {
        await expect(pages.history.root).toHaveScreenshot('history-page-empty.png', TEST_OPTIONS);
    });
});
