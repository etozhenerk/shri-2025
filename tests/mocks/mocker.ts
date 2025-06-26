import { type Page, type Route } from '@playwright/test';

import { analysisErrorMock } from '../test-data/mocks/analysis-error';
import { successAnalysisMock } from '../test-data/mocks/analysis-success';

type MockResponse = Record<string, unknown> | string | number | unknown[];

export class Mocker {
    private readonly page: Page;
    private readonly mockedRoutes: Set<string>;

    constructor(page: Page) {
        this.page = page;
        this.mockedRoutes = new Set();
    }

    public async mock(
        url: string | RegExp,
        responseData: MockResponse,
        options: { status?: number; delay?: number; contentType?: string; headers?: Record<string, string> } = {}
    ) {
        const { status = 200, delay = 0, contentType = 'application/json', headers = {} } = options;
        const urlString = url.toString();
        if (this.mockedRoutes.has(urlString)) {
            await this.page.unroute(url);
        }

        await this.page.route(url, async (route: Route) => {
            if (delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            const body = contentType === 'application/json' ? JSON.stringify(responseData) : String(responseData);

            return route.fulfill({
                status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    ...headers,
                },
                contentType,
                body,
            });
        });

        this.mockedRoutes.add(urlString);
    }

    public async mockAnalysisSuccess(options: { delay?: number } = {}) {
        await this.mock('**/api/v1/analysis', successAnalysisMock, { ...options });
    }

    public async mockAnalysisError(options: { delay?: number } = {}) {
        await this.mock('**/api/v1/analysis', analysisErrorMock, { ...options, status: 500 });
    }

    public async unmockAll() {
        for (const url of this.mockedRoutes) {
            await this.page.unroute(url);
        }
        this.mockedRoutes.clear();
    }
} 