import { type Page, type Locator } from '@playwright/test';

import { HistoryModal } from '../cross-page-objects/historyModal';

import { BasePage } from './basePage';

export class HistoryPage extends BasePage {
    constructor(page: Page) {
        super(page, 'history-page');
    }

    public historyModal = new HistoryModal(this.page);

    public get historyList() {
        return this.root.getByTestId('history-list');
    }

    public get historyItems() {
        return this.historyList.getByTestId('history-item');
    }

    public get historyListEmpty() {
        return this.root.getByTestId('history-list-empty');
    }

    public get generateMoreButton() {
        return this.root.getByTestId('generate-more-button');
    }

    public get clearHistoryButton() {
        return this.root.getByTestId('clear-history-button');
    }

    public getHistoryItem(id: string) {
        return this.root.getByTestId(`history-item-${id}`);
    }

    public getHistoryItemButton(id: string) {
        return this.getHistoryItem(id).getByTestId('history-item-button');
    }

    public getHistoryItemDeleteButton(id: string) {
        return this.getHistoryItem(id).getByTestId('history-item-delete-button');
    }

    public getHistoryItemByName(name: string) {
        return this.historyItems.filter({ hasText: name }).first();
    }

    public getErrorIconFromItem(itemLocator: Locator) {
        return itemLocator.getByTestId('file-status-error');
    }

    public getDeleteButtonFromItem(itemLocator: Locator) {
        return itemLocator.getByTestId('history-item-delete-button');
    }
}
