import AxeBuilder from '@axe-core/playwright';
import { test as base, expect } from '@playwright/test';
import { type Result } from 'axe-core';

import { actionClasses } from '../actions';
import { mockClasses } from '../mocker';
import { pageClasses } from '../page-objects/pages';

import { type MyFixtures } from './types';

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
    .extend<MyFixtures & { makeA11yScan: () => Promise<Result[]> }>({
        pages: async ({ page }, use) => {
            const pages = {
                home: new pageClasses.home(page),
                generate: new pageClasses.generate(page),
                history: new pageClasses.history(page),
                storybook: new pageClasses.storybook(page),
            };
            await use(pages);
        },
        actions: async ({ page, pages }, use) => {
            const actions = {
                home: new actionClasses.home(page, pages),
                generate: new actionClasses.generate(page, pages),
                history: new actionClasses.history(page, pages),
                storybook: new actionClasses.storybook(page, pages),
            };
            await use(actions);
        },
        mocker: async ({ page }, use) => {
            const mocker = new mockClasses.mocker(page);
            await use(mocker);
            await mocker.unmockAll();
        },
        makeA11yScan: async ({ page }, use) => {
            const makeScan = async () => {
                const accessibilityScanResults = await new AxeBuilder({ page })
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                    .analyze();
                return accessibilityScanResults.violations;
            };
            await use(makeScan);
        },
    });

export { test, expect }; 