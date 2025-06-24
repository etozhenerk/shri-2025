import { type Page } from '@playwright/test';

import { type Pages } from '../support/types';

const STORAGE_KEY = 'tableHistory';

export class HistoryActions {
    readonly page: Page;
    readonly pages: Pages;

    constructor(page: Page, pages: Pages) {
        this.page = page;
        this.pages = pages;
    }

    public async goto() {
        await this.page.goto('/history');
    }

    public async seedHistory(data: unknown) {
        await this.goto();
        await this.page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), {
            key: STORAGE_KEY,
            data,
        });
        await this.page.reload();
    }

    public async clearHistoryAndReload() {
        await this.goto();
        await this.page.evaluate(() => localStorage.clear());
        await this.page.reload();
    }

    public async openHistoryItem(name: string) {
        const item = this.pages.history.getHistoryItemByName(name);

        await item.click();
    }

    public async deleteHistoryItem(name: string) {
        const item = this.pages.history.getHistoryItemByName(name);
        const deleteButton = this.pages.history.getDeleteButtonFromItem(item);

        await deleteButton.click();
    }

    public async clearHistory() {
        await this.pages.history.clearHistoryButton.click();
    }

    public async closeModal() {
        await this.pages.history.historyModal.closeButton.click();
    }
}
