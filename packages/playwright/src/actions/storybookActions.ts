import { type Page } from '@playwright/test';

import { type Pages } from '../support/types';

const STORYBOOK_BASE_URL = 'http://localhost:6006';

export class StorybookActions {
    readonly page: Page;
    readonly pages: Pages;

    constructor(page: Page, pages: Pages) {
        this.page = page;
        this.pages = pages;
    }

    /**
     * Открывает указанную историю в Storybook.
     * @param storyId - ID истории, например, 'ui-button--primary'.
     */
    public async openStory(storyId: string): Promise<void> {
        await this.page.goto(`${STORYBOOK_BASE_URL}/iframe.html?id=${storyId}`, { waitUntil: 'domcontentloaded' });
    }
} 