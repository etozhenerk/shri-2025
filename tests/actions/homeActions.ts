import * as fs from 'fs/promises';

import { type Page } from '@playwright/test';

import { HomePage } from '../page-objects/pages/homePage';

export class HomeActions {
    readonly page: Page;
    readonly homePage: HomePage;

    constructor(page: Page) {
        this.page = page;
        this.homePage = new HomePage(page);
    }

    public async goto() {
        await this.page.goto('/');
    }

    public async uploadFile(filePath: string) {
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        await this.homePage.dropzone.click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
    }

    public async uploadFileWithDragAndDrop(filePath: string, fileName: string) {
        const buffer = await fs.readFile(filePath);
        await this.homePage.dropzone.dispatchEvent('dragenter');
        const dataTransfer = await this.page.evaluateHandle(
            ({ buffer, fileName, fileType }) => {
                const dt = new DataTransfer();
                const file = new File([buffer], fileName, { type: fileType });
                dt.items.add(file);
                return dt;
            },
            {
                buffer,
                fileName,
                fileType: 'text/csv',
            }
        );

        await this.homePage.dropzone.dispatchEvent('drop', { dataTransfer });
    }

    public async send() {
        await this.homePage.sendButton.click();
    }

    public async clearFile() {
        await this.homePage.dropzoneClearButton.click();
    }
}
