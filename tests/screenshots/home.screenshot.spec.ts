import { expect, test } from '@shri/playwright';

import { analysisErrorMock } from '../test-data/mocks/analysis-error';
import { successAnalysisMock } from '../test-data/mocks/analysis-success';

const TEST_OPTIONS = { maxDiffPixelRatio: 0.05 };

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('TC-HP-007: Скриншот секции загрузки файла в состоянии по умолчанию', async ({ pages }) => {
    await test.step('Шаг 1: Сделать и сравнить скриншот секции загрузки', async () => {
        await expect(pages.home.fileUploadSection).toHaveScreenshot('home-page-upload-section-default.png', TEST_OPTIONS);
    });
});

test('TC-HP-008: Скриншот секции с результатами после успешной обработки', async ({ actions, mocker, pages }) => {
    await mocker.mock('**/aggregate*', successAnalysisMock);

    await test.step('Шаг 1: Загрузить валидный `.csv` файл и дождаться отображения результатов', async () => {
        await actions.home.uploadFile('tests/test-data/test-data.csv');
        await actions.home.send();
        await expect(pages.home.highlightsGrid).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот секции с результатами', async () => {
        await expect(pages.home.highlightsGrid).toHaveScreenshot('home-page-highlights-section-success.png', TEST_OPTIONS);
    });
});

test('TC-HP-009: Скриншот секции загрузки файла с ошибкой обработки', async ({ actions, mocker, pages }) => {
    await test.step('Шаг 1: Загрузить валидный `.csv` файл и дождаться отображения ошибки', async () => {
        await mocker.mock('**/aggregate*', analysisErrorMock);
        await actions.home.uploadFile('tests/test-data/test-data.csv');
        await actions.home.send();
        await expect(pages.home.dropzoneError).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот секции загрузки с ошибкой', async () => {
        await expect(pages.home.fileUploadSection).toHaveScreenshot('home-page-upload-section-error.png', TEST_OPTIONS);
    });
});

test('TC-HP-010: Скриншот секции загрузки файла с выбранным файлом до отправки', async ({ actions, pages }) => {
    await test.step('Шаг 1: Загрузить валидный `.csv` файл', async () => {
        await actions.home.uploadFile('tests/test-data/test-data.csv');
        await expect(pages.home.sendButton).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот секции загрузки с выбранным файлом', async () => {
        await expect(pages.home.fileUploadSection).toHaveScreenshot('home-page-upload-section-with-file.png', TEST_OPTIONS);
    });
});

test('TC-HP-011: Скриншот секции загрузки файла в процессе обработки', async ({ actions, mocker, pages }) => {
    await test.step('Шаг 1: Загрузить валидный `.csv` файл и начать обработку', async () => {
        // Используем задержку в 1 час для имитации длительной загрузки
        await mocker.mock('**/aggregate*', { status: 'pending' }, { delay: 3600000 });
        await actions.home.uploadFile('tests/test-data/test-data.csv');
        await actions.home.send();
        await expect(pages.home.loader).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот секции загрузки в процессе обработки', async () => {
        await expect(pages.home.fileUploadSection).toHaveScreenshot('home-page-upload-section-loading.png', TEST_OPTIONS);
    });
});

test('TC-HP-012: Скриншот секции загрузки файла с ошибкой формата', async ({ actions, pages }) => {
    await test.step('Шаг 1: Загрузить файл неверного формата', async () => {
        await actions.home.uploadFile('tests/test-data/invalid-file.txt');
        await expect(pages.home.dropzoneError).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот секции загрузки с ошибкой формата', async () => {
        await expect(pages.home.fileUploadSection).toHaveScreenshot('home-page-upload-section-invalid-format.png', TEST_OPTIONS);
    });
});

test('TC-HP-013: Скриншот состояния плейсхолдера для хайлайтов', async ({ pages }) => {
    await test.step('Шаг 1: Сделать и сравнить скриншот секции хайлайтов', async () => {
        await expect(pages.home.highlightsPlaceholder).toBeVisible();
        await expect(pages.home.highlightsPlaceholder).toHaveScreenshot(
            'home-page-highlights-section-placeholder.png',
            TEST_OPTIONS
        );
    });
});
