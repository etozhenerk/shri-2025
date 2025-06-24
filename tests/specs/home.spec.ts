import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '../support/fixtures';
import { analysisErrorMock } from '../test-data/mocks/analysis-error';
import { successAnalysisMock } from '../test-data/mocks/analysis-success';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.beforeEach(async ({ actions, mocker }) => {
    await mocker.mock('**/aggregate*', successAnalysisMock, { delay: 200 });
    await actions.home.goto();
});

test('TC-HP-001: Успешная загрузка и анализ CSV файла через кнопку "Загрузить файл".', async ({ pages, actions }) => {
    const filePath = path.join(__dirname, '..', 'test-data', 'test-data.csv');
    const fileName = 'test-data.csv';

    await test.step('Шаги 1-2: Нажать "Загрузить" и выбрать валидный CSV файл', async () => {
        await actions.home.uploadFile(filePath);

        await expect(pages.home.dropzone).toContainText(fileName);
        await expect(pages.home.sendButton).toBeEnabled();
    });

    await test.step('Шаг 3: Нажать "Отправить" и проверить результат', async () => {
        await actions.home.send();

        // Проверяем, что лоадер появляется и исчезает
        await expect(pages.home.loader).toBeVisible();
        await expect(pages.home.loader).toBeHidden({ timeout: 10000 });

        // Проверяем, что появились карточки с результатами
        await expect(pages.home.highlightsGrid).toBeVisible();

        const cards = await pages.home.highlightCard.all();
        expect(cards.length).toBe(8);

        // Проверяем, что в историю добавилась запись
        await actions.history.goto();

        await expect(pages.history.historyList).toBeVisible();
    });
});

test('TC-HP-002: Успешная загрузка и анализ CSV файла через Drag-and-Drop.', async ({ pages, actions }) => {
    const filePath = path.join(__dirname, '..', 'test-data', 'test-data.csv');
    const fileName = 'test-data.csv';

    await test.step('Шаг 1: Перетащить валидный CSV файл', async () => {
        await actions.home.uploadFileWithDragAndDrop(filePath, fileName);

        await expect(pages.home.dropzoneContent).toContainText(fileName);
        await expect(pages.home.dropzoneStatus).toContainText('файл загружен!');
        await expect(pages.home.sendButton).toBeEnabled();
    });

    await test.step('Шаг 2: Нажать "Отправить" и проверить результат', async () => {
        await actions.home.send();

        // Проверяем, что лоадер появляется и исчезает
        await expect(pages.home.loader).toBeVisible();
        await expect(pages.home.loader).toBeHidden({ timeout: 10000 });

        // Проверяем, что появились карточки с результатами
        await expect(pages.home.highlightsGrid).toBeVisible();

        const cards = await pages.home.highlightCard.all();
        expect(cards.length).toBe(8);

        // Проверяем, что в историю добавилась запись
        await actions.history.goto();

        await expect(pages.history.historyList).toBeVisible();
    });
});

test('TC-HP-003: Попытка загрузки файла с неверным расширением.', async ({ pages, actions }) => {
    const filePath = path.join(__dirname, '..', 'test-data', 'invalid-file.txt');

    await test.step('Предусловие: Пользователь находится на главной странице', async () => {
        await actions.home.goto();

        await expect(pages.home.root).toBeVisible();
    });

    await test.step('Шаг 1: Попытка загрузить невалидный файл', async () => {
        await actions.home.uploadFile(filePath);

        await expect(pages.home.dropzoneError).toBeVisible();
        await expect(pages.home.dropzoneError).toHaveText('Можно загружать только *.csv файлы');
        await expect(pages.home.sendButton).toBeHidden();
    });
});

test('TC-HP-004: Кнопка "Отправить" неактивна до выбора файла.', async ({ pages, actions }) => {
    await test.step('Шаг 1: Осмотреть страницу сразу после загрузки', async () => {
        await actions.home.goto();

        await expect(pages.home.sendButton).toBeHidden();
    });
});

test('TC-HP-005: Загрузка файла с ошибкой', async ({ pages, actions, mocker }) => {
    const fileName = 'test-data.csv';
    const errorMessage = 'Неизвестная ошибка парсинга :(';

    await mocker.mock('**/aggregate*', analysisErrorMock, {
        status: 400,
        delay: 500,
    });

    await test.step('Шаг 1: Загрузка файла и отправка на анализ', async () => {
        await actions.home.uploadFile(`tests/test-data/${fileName}`);
        await expect(pages.home.fileDisplayName).toHaveText(fileName);
        await actions.home.send();
    });

    await test.step('Шаг 2: Проверка статуса обработки и ошибки', async () => {
        await expect(pages.home.loader).toBeVisible();
        await expect(pages.home.loader).toBeHidden({ timeout: 10000 });

        await expect(pages.home.dropzoneError).toBeVisible();
        await expect(pages.home.dropzoneError).toHaveText(errorMessage);
    });

    await test.step('Шаг 3: Проверка записи в истории', async () => {
        await actions.history.goto();

        await expect(pages.history.historyList).toBeVisible();

        const historyItem = pages.history.getHistoryItemByName(fileName);
        await expect(historyItem).toBeVisible();
    });
});

test('TC-HP-006: Отмена выбора файла', async ({ pages, actions }) => {
    const fileName = 'test-data.csv';

    await test.step('Шаг 1: Переход на страницу и загрузка файла', async () => {
        await actions.home.goto();
        await actions.home.uploadFile(`tests/test-data/${fileName}`);

        await expect(pages.home.fileDisplayName).toBeVisible();
    });

    await test.step('Шаг 2: Проверка отображения загруженного файла', async () => {
        await expect(pages.home.fileDisplayName).toHaveText(fileName);
        await expect(pages.home.sendButton).toBeEnabled();
    });

    await test.step('Шаг 3: Отмена выбора файла', async () => {
        await actions.home.clearFile();

        await expect(pages.home.fileDisplayName).not.toBeVisible();
    });

    await test.step('Шаг 4: Проверка возврата в исходное состояние', async () => {
        await expect(pages.home.sendButton).toBeHidden();
        await expect(pages.home.dropzone).toBeVisible();
    });
});
