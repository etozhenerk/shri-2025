import { type Page } from '@playwright/test';

import { GeneratePage } from '../page-objects/pages/generatePage';

export class GenerateActions {
    readonly page: Page;
    readonly generatePage: GeneratePage;

    constructor(page: Page) {
        this.page = page;
        this.generatePage = new GeneratePage(page);
    }

    public async goto() {
        await this.page.goto('/generate');
    }

    public async startGeneration() {
        await this.generatePage.generateButton.click();
    }
} 