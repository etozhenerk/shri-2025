import { expect, test } from '@shri/playwright';

const TEST_OPTIONS = { maxDiffPixelRatio: 0.05 };

test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
});

test('TC-GP-003: Скриншот состояния страницы генерации по умолчанию', async ({ pages }) => {
    await test.step('Шаг 1: Сделать и сравнить скриншот страницы', async () => {
        await expect(pages.generate.root).toBeVisible();
        await expect(pages.generate.root).toHaveScreenshot('generate-page.png', TEST_OPTIONS);
    });
});
