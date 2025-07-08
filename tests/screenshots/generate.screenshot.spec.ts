import { expect, test } from '@shri/playwright';

const TEST_OPTIONS = { maxDiffPixelRatio: 0.05 };

test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
});

test('TC-GP-003: Скриншот состояния страницы "Генерация" по умолчанию', async ({ pages }) => {
    await test.step('Шаг 1: Сделать и сравнить скриншот страницы', async () => {
        await expect(pages.generate.root).toBeVisible();
        await expect(pages.generate.root).toHaveScreenshot('generate-page.png', TEST_OPTIONS);
    });
});

test('TC-GP-004: Скриншот состояния страницы "Генерация" в процессе генерации', async ({ pages, mocker }) => {
    await test.step('Шаг 1: Нажать на кнопку "Начать генерацию"', async () => {
        // Мокируем запрос с большой задержкой чтобы поймать состояние загрузки
        await mocker.mock('**/report*', 'col1,col2\\nval1,val2', {
            delay: 3600000, // 1 час задержки
            status: 200,
            contentType: 'text/csv',
        });
        
        await pages.generate.generateButton.click();
        await expect(pages.generate.loader).toBeVisible();
    });

    await test.step('Шаг 2: Сделать и сравнить скриншот основного контента страницы', async () => {
        await expect(pages.generate.root).toHaveScreenshot('generate-page-loading.png', TEST_OPTIONS);
    });
});

test('TC-GP-005: Скриншот состояния страницы "Генерация" после успешной генерации', async ({ pages, mocker }) => {
    await test.step('Шаг 1: Нажать на кнопку "Начать генерацию"', async () => {
        await mocker.mock('**/report*', 'col1,col2\\nval1,val2', {
            status: 200,
            contentType: 'text/csv',
            headers: {
                'Content-Disposition': 'attachment; filename="report.csv"',
            },
            delay: 200,
        });
        
        await pages.generate.generateButton.click();
    });

    await test.step('Шаг 2: Дождаться завершения генерации', async () => {
        await expect(pages.generate.successMessage).toBeVisible({ timeout: 10000 });
    });

    await test.step('Шаг 3: Сделать и сравнить скриншот основного контента страницы', async () => {
        await expect(pages.generate.root).toHaveScreenshot('generate-page-success.png', TEST_OPTIONS);
    });
});

test('TC-GP-006: Скриншот состояния страницы "Генерация" при ошибке', async ({ pages, mocker }) => {
    await test.step('Шаг 1: Нажать на кнопку "Начать генерацию"', async () => {
        await mocker.mock('**/report*', { error: 'Произошла серьезная ошибка' }, {
            status: 500,
            delay: 200,
        });
        
        await pages.generate.generateButton.click();
    });

    await test.step('Шаг 2: Дождаться ответа с ошибкой', async () => {
        await expect(pages.generate.errorMessage).toBeVisible({ timeout: 10000 });
    });

    await test.step('Шаг 3: Сделать и сравнить скриншот основного контента страницы', async () => {
        await expect(pages.generate.root).toHaveScreenshot('generate-page-error.png', TEST_OPTIONS);
    });
});
