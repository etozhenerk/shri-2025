import { type Page } from '@playwright/test';

import { BasePage } from './basePage';

export class GeneratePage extends BasePage {
    constructor(page: Page) {
        super(page, 'generate-page');
    }

    public get generateButton() {
        return this.root.getByTestId('generate-button');
    }

    public get successMessage() {
        return this.root.getByTestId('generate-success-message');
    }

    public get errorMessage() {
        return this.root.getByTestId('generate-error-message');
    }

    public get loader() {
        return this.root.getByTestId('loader');
    }
} 