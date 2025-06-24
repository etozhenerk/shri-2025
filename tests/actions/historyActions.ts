import { type Page } from '@playwright/test';

import { HistoryPage } from '../page-objects/pages/historyPage';

const STORAGE_KEY = 'tableHistory';

export class HistoryActions {
    readonly page: Page;
    readonly historyPage: HistoryPage;

    constructor(page: Page) {
        this.page = page;
        this.historyPage = new HistoryPage(page);
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
        const item = this.historyPage.getHistoryItemByName(name);

        await item.click();
    }

    public async deleteHistoryItem(name: string) {
        const item = this.historyPage.getHistoryItemByName(name);
        const deleteButton = this.historyPage.getDeleteButtonFromItem(item);

        await deleteButton.click();
    }

    public async clearHistory() {
        await this.historyPage.clearHistoryButton.click();
    }

    public async closeModal() {
        await this.historyPage.historyModal.closeButton.click();
    }
}
