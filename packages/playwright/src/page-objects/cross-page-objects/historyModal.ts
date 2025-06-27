import { type Page } from '@playwright/test';

export class HistoryModal {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public get root() {
        return this.page.getByTestId('history-modal');
    }

    public get closeButton() {
        return this.root.getByTestId('modal-close-button');
    }

    public get backdrop() {
        return this.page.getByTestId('modal-backdrop');
    }
}
