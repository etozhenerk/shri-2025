import { type Locator, type Page } from '@playwright/test';

export class BasePage {
    readonly page: Page;
    readonly root: Locator;

    constructor(page: Page, testId: string) {
        this.page = page;
        this.root = page.getByTestId(testId);
    }
} 