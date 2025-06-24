import { type Page } from '@playwright/test';

import { type Pages } from '../support/types';

export class GenerateActions {
    readonly page: Page;
    readonly pages: Pages;

    constructor(page: Page, pages: Pages) {
        this.page = page;
        this.pages = pages;
    }

    public async goto() {
        await this.page.goto('/generate');
    }

    public async startGeneration() {
        await this.pages.generate.generateButton.click();
    }
} 