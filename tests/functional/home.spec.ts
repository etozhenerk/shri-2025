import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '../support/fixtures';
import { successAnalysisMock } from '../test-data/mocks/analysis-success';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.beforeEach(async ({ actions, mocker }) => {
    await mocker.mock('**/aggregate*', successAnalysisMock, { delay: 200 });
    await actions.home.goto();
});

test('TC-HP-001: Успешная загрузка и обработка CSV файла через кнопку "Загрузить файл"', async ({
    pages,
    actions,
}) => {
    const filePath = path.join(__dirname, '..', 'test-data', 'test-data.csv');
    const fileName = 'test-data.csv';

    await test.step('Шаг 1: Нажать на кнопку "Загрузить файл" или на область для загрузки', async () => {
        // Этот шаг не проверяется в playwright, т.к. открытие системного окна - зона ответственности браузера
    });

    await test.step('Шаг 2: В системном окне выбора файла выбрать валидный `.csv` файл', async () => {
        await actions.home.uploadFile(filePath);
        await expect(pages.home.dropzone).toContainText(fileName);
        await expect(pages.home.sendButton).toBeEnabled();
    });

    await test.step('Шаг 3: Нажать кнопку "Отправить"', async () => {
        await actions.home.send();

        await expect(pages.home.loader).toBeVisible();
        await expect(pages.home.loader).toBeHidden({ timeout: 10000 });
        await expect(pages.home.highlightsGrid).toBeVisible();

        const cards = await pages.home.highlightCard.all();
        expect(cards.length).toBe(8);
    });
});

test('TC-HP-002: Успешная загрузка и обработка CSV файла через Drag-and-Drop', async ({ pages, actions }) => {
    const filePath = path.join(__dirname, '..', 'test-data', 'test-data.csv');
    const fileName = 'test-data.csv';

    await test.step('Шаг 1: Перетащить валидный `.csv` файл из файловой системы компьютера в область Dropzone на странице', async () => {
        await actions.home.uploadFileWithDragAndDrop(filePath, fileName);

        await expect(pages.home.dropzoneContent).toContainText(fileName);
        await expect(pages.home.dropzoneStatus).toContainText('файл загружен!');
        await expect(pages.home.sendButton).toBeEnabled();
    });

    await test.step('Шаг 2: Нажать кнопку "Отправить"', async () => {
        await actions.home.send();

        await expect(pages.home.loader).toBeVisible();
        await expect(pages.home.loader).toBeHidden({ timeout: 10000 });
        await expect(pages.home.highlightsGrid).toBeVisible();

        const cards = await pages.home.highlightCard.all();
        expect(cards.length).toBe(8);
    });
});
