import { expect, test } from '../support/fixtures';
import { historyMock } from '../test-data/mocks/history';

test.beforeEach(async ({ actions }) => {
    // Готовим базовое состояние (два элемента в истории) перед каждым тестом
    await actions.history.seedHistory(historyMock);
});

test('TC-HIS-001: Отображение истории и работа с модальным окном', async ({ actions, pages }) => {
    await test.step('Шаг 1: Проверка отображения полного списка истории', async () => {
        await expect(pages.history.historyItems).toHaveCount(2);
    });

    await test.step('Шаг 2: Открытие и закрытие модального окна для успешного элемента', async () => {
        await actions.history.openHistoryItem(historyMock[0].fileName);
        await expect(pages.history.historyModal.backdrop).toHaveCSS('opacity', '1');

        await actions.history.closeModal();
        await expect(pages.history.historyModal.backdrop).toHaveCSS('opacity', '0');
    });

    await test.step('Шаг 3: Проверка, что модальное окно не открывается для элемента с ошибкой', async () => {
        await actions.history.openHistoryItem(historyMock[1].fileName);

        await expect(pages.history.historyModal.backdrop).toHaveCSS('opacity', '0');
    });
});

test('TC-HIS-002: Удаление одного элемента из истории', async ({ page, actions, pages }) => {
    await test.step('Шаг 1: Удаление элемента и проверка списка', async () => {
        const itemNameToDelete = historyMock[0].fileName;
        await actions.history.deleteHistoryItem(itemNameToDelete);

        await expect(pages.history.historyItems).toHaveCount(1);
        await expect(pages.history.getHistoryItemByName(itemNameToDelete)).not.toBeVisible();
    });

    await test.step('Шаг 2: Перезагрузка страницы и проверка персистентности', async () => {
        await page.reload();

        await expect(pages.history.historyItems).toHaveCount(1);
        await expect(pages.history.getHistoryItemByName(historyMock[0].fileName)).not.toBeVisible();
    });
});

test('TC-HIS-003: Полная очистка истории', async ({ pages, actions }) => {
    await test.step('Шаг 1: Очистка истории и проверка результата', async () => {
        await actions.history.clearHistory();

        await expect(pages.history.historyItems).toHaveCount(0);
        await expect(pages.history.clearHistoryButton).not.toBeVisible();
    });
});

test('TC-HIS-004: Отображение пустой истории', async ({ actions, pages }) => {
    // Предусловие: очищаем историю
    await actions.history.clearHistoryAndReload();

    await test.step('Шаг 1: Проверка состояния пустой страницы', async () => {
        await expect(pages.history.historyItems).toHaveCount(0);
        await expect(pages.history.clearHistoryButton).not.toBeVisible();
    });
});
