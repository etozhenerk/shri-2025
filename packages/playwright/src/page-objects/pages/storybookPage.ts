import { type Page } from '@playwright/test';

export class StorybookPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public get component() {
        // Ищем компонент по его data-testid внутри iframe Storybook
        return this.page.locator('#storybook-root');
    }
}
