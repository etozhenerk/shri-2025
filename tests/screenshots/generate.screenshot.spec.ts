import { expect, test } from '@shri/playwright';

test('TC-GP-003: Скриншот состояния страницы "Генерация" в состоянии по умолчанию', async ({ page }) => {
    await page.goto('/generate');

    await test.step('Шаг 1: Сделать и сравнить скриншот страницы', async () => {
        await expect(page).toHaveScreenshot('generate-page.png', { fullPage: true });
    });
});
