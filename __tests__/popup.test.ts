import { type Browser, type Page } from 'puppeteer';
import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import puppeteer from 'puppeteer';

const puppeteerArgs = [`--disable-extensions-except=${process.cwd()}/dist`, `--load-extension=${process.cwd()}/dist`];

const getExtensionURL = (browser: Browser) => {
    const targets = browser.targets();
    const extensionTarget = targets.find((target) => target.type() === 'service_worker');
    const partialExtensionUrl = extensionTarget?.url() || '';
    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    const [, , extensionId] = partialExtensionUrl.split('/');
    return `chrome-extension://${extensionId}/src/popup/index.html`;
};

describe('Popup', () => {
    let browser: Browser;
    let page: Page;

    beforeEach(async () => {
        browser = await puppeteer.launch({
            headless: 'new',
            slowMo: 200,
            args: puppeteerArgs,
        });
        [page] = await browser.pages();
    });

    afterEach(() => browser.close());

    test('Display popup', async () => {
        const extensionUrl = getExtensionURL(browser);

        const response = await page.goto(extensionUrl, { waitUntil: ['domcontentloaded', 'networkidle2'] });
        const title = await page.title();

        expect(response).toBeDefined();
        expect(response?.ok()).toBe(true);
        expect(title).toBe('Popup');
    });

    test('Create bookmark bar', async () => {
        const extensionUrl = getExtensionURL(browser);
        await page.goto(extensionUrl, { waitUntil: ['domcontentloaded', 'networkidle2'] });

        await page.type('input', 'My first bookmark bar 🚀');
        await page.keyboard.press('Enter');
        const createdBarName = await page.$$eval('button', (buttons) => {
            return buttons.some((button) => button.textContent?.includes('My first bookmark bar 🚀'));
        });

        expect(createdBarName).toBe(true);
    });
});
