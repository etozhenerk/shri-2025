import { test as base, expect } from '@playwright/test';

import { actionClasses } from '../actions';
import { mockClasses } from '../mocks';
import { pageClasses } from '../page-objects/pages';

type Pages = {
    [K in keyof typeof pageClasses]: InstanceType<(typeof pageClasses)[K]>;
};

type Actions = {
    [K in keyof typeof actionClasses]: InstanceType<(typeof actionClasses)[K]>;
};

type Mocker = InstanceType<typeof mockClasses.mocker>;

type MyFixtures = {
    pages: Pages;
    actions: Actions;
    mocker: Mocker;
};

const test = base
    .extend<{ _cleanLocalStorage: void; _fixTime: void }>({
        _cleanLocalStorage: [
            async ({ page }, use) => {
                await use();
                await page.evaluate(() => window.localStorage.clear());
            },
            { auto: true },
        ],
        _fixTime: [
            async ({ page }, use) => {
                await page.clock.setFixedTime(new Date('2024-05-21T10:00:00Z'));
                await use();
            },
            { auto: true },
        ],
    })
    .extend<MyFixtures>({
        pages: async ({ page }, use) => {
            const pages = {
                home: new pageClasses.home(page),
                generate: new pageClasses.generate(page),
                history: new pageClasses.history(page),
            };
            await use(pages);
        },
        actions: async ({ page }, use) => {
            const actions = {
                home: new actionClasses.home(page),
                generate: new actionClasses.generate(page),
                history: new actionClasses.history(page),
            };
            await use(actions);
        },
        mocker: async ({ page }, use) => {
            const mocker = new mockClasses.mocker(page);
            await use(mocker);
            await mocker.unmockAll();
        },
    });

export { test, expect }; 