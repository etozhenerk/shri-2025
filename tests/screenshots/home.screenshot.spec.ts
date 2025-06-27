import { expect, test } from '@shri/playwright';

import { analysisErrorMock } from '../test-data/mocks/analysis-error';
import { successAnalysisMock } from '../test-data/mocks/analysis-success';

const TEST_OPTIONS = { maxDiffPixelRatio: 0.05, fullPage: true };

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('TC-HP-007: Скриншот состояния страницы по умолчанию', async ({ page }) => {
    await test.step('Шаг 1: Сделать и сравнить скриншот страницы', async () => {
        await expect(page).toHaveScreenshot('home-page-default.png', TEST_OPTIONS);
    });
});

test('TC-HP-008: Скриншот состояния страницы с результатами', async ({ page, actions, mocker, pages }) => {
    await mocker.mock('**/aggregate*', successAnalysisMock, { delay: 200 });

    await test.step('Шаг 1: Загрузить валидный `.csv` файл и дождаться отображения результатов', async () => {
        await actions.home.uploadFile('tests/test-data/test-data.csv');
        await actions.home.send();

        await expect(pages.home.highlightsGrid).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот страницы', async () => {
        await expect(page).toHaveScreenshot('home-page-with-highlights.png', TEST_OPTIONS);
    });
});

test('TC-HP-009: Скриншот состояния страницы с ошибкой обработки', async ({ page, actions, mocker, pages }) => {
    await test.step('Шаг 1: Загрузить валидный `.csv` файл и дождаться отображения ошибки', async () => {
        await mocker.mock('**/aggregate*', analysisErrorMock, { delay: 200 });
        await actions.home.uploadFile('tests/test-data/test-data.csv');
        await actions.home.send();

        await expect(pages.home.dropzoneError).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот страницы', async () => {
        await expect(page).toHaveScreenshot('home-page-upload-error.png', TEST_OPTIONS);
    });
});
