import { type Browser, type Page } from 'puppeteer';
import { afterEach, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import {
    createBookmarks,
    createDirectory,
    generateBookmarks,
    generateDirectory,
    getBookmarkTitles,
    getBookmarksBarId,
    getDirectoryId,
} from './helpers';
import puppeteer from 'puppeteer';

const GENERATED_BOOKMARKS_COUNT = 25;
const CUSTOM_BARS_DIR = 'Bookmark Bars';
const DEFAULT_ACTIVE_BAR = 'My first bookmark bar 🚀';
const CREATED_BAR = 'New bookmark bar 🚀';

const puppeteerArgs = [`--disable-extensions-except=${process.cwd()}/dist`, `--load-extension=${process.cwd()}/dist`];

const getExtensionURL = (browser: Browser) => {
    const targets = browser.targets();
    const extensionTarget = targets.find((target) => target.type() === 'service_worker');
    const partialExtensionUrl = extensionTarget?.url() || '';
    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    const [, , extensionId] = partialExtensionUrl.split('/');
    return `chrome-extension://${extensionId}/src/popup/index.html`;
};

// eslint-disable-next-line max-lines-per-function
describe('Popup', () => {
    let browser: Browser;
    let page: Page;

    let generatedBookmarksActive: { title: string; url: string; parentId?: string }[];
    let generatedBookmarksInactive: { title: string; url: string; parentId?: string }[];
    let generatedDirectoryInactive: { title: string; parentId?: string };
    let generatedDirectoryInactiveEmpty: { title: string; parentId?: string };

    beforeAll(() => {
        generatedBookmarksActive = generateBookmarks(GENERATED_BOOKMARKS_COUNT);
        generatedBookmarksInactive = generateBookmarks(GENERATED_BOOKMARKS_COUNT);
        generatedDirectoryInactive = generateDirectory();
        generatedDirectoryInactiveEmpty = generateDirectory();
    });

    beforeEach(async () => {
        browser = await puppeteer.launch({
            // headless: false,
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

    test('Display popup with predefined data', async () => {
        const extensionUrl = getExtensionURL(browser);

        await page.goto(extensionUrl, { waitUntil: ['domcontentloaded', 'networkidle2'] });
        const customDirId = await getDirectoryId(page, CUSTOM_BARS_DIR);
        await createDirectory(page, generatedDirectoryInactive, customDirId);
        await createDirectory(page, generatedDirectoryInactiveEmpty, customDirId);
        await page.reload();
        const bookmarkBarTitle1 = await page.$$eval(
            'button',
            (buttons, dir) => {
                return buttons.some((button) => button.textContent?.includes(dir.title));
            },
            generatedDirectoryInactive,
        );
        const bookmarkBarTitle2 = await page.$$eval(
            'button',
            (buttons, dir) => {
                return buttons.some((button) => button.textContent?.includes(dir.title));
            },
            generatedDirectoryInactiveEmpty,
        );

        expect(bookmarkBarTitle1).toBe(true);
        expect(bookmarkBarTitle2).toBe(true);
    });

    test('Create new bookmark bar', async () => {
        const extensionUrl = getExtensionURL(browser);
        await page.goto(extensionUrl, { waitUntil: ['domcontentloaded', 'networkidle2'] });

        await page.type('input', CREATED_BAR);
        await page.keyboard.press('Enter');
        const createdBarName = await page.$$eval(
            'button',
            (buttons, createdBar) => {
                return buttons.some((button) => button.textContent?.includes(createdBar));
            },
            CREATED_BAR,
        );

        expect(createdBarName).toBe(true);
    });

    test('Switch bookmark bars', async () => {
        const extensionUrl = getExtensionURL(browser);

        await page.goto(extensionUrl, { waitUntil: ['domcontentloaded', 'networkidle2'] });
        const customDirId = await getDirectoryId(page, CUSTOM_BARS_DIR);
        const dirInactive = await createDirectory(page, generatedDirectoryInactive, customDirId);
        await createDirectory(page, generatedDirectoryInactiveEmpty, customDirId);
        await createBookmarks(page, generatedBookmarksInactive, dirInactive);
        const bookmarksBarId = await getBookmarksBarId(page);
        await createBookmarks(page, generatedBookmarksActive, bookmarksBarId);

        await page.reload();

        await page.evaluate((text) => {
            const buttons = document.querySelectorAll('button');
            buttons.forEach((button) => {
                if (button.textContent?.includes(text)) {
                    button.click();
                }
            });
        }, generatedDirectoryInactive.title);

        const activeBarTitles = await getBookmarkTitles(page, bookmarksBarId);
        const switchedBarTitles = await getBookmarkTitles(page, await getDirectoryId(page, DEFAULT_ACTIVE_BAR));

        expect(activeBarTitles).toHaveLength(GENERATED_BOOKMARKS_COUNT);
        expect(switchedBarTitles).toHaveLength(GENERATED_BOOKMARKS_COUNT);
        expect(activeBarTitles.sort((a, b) => a.localeCompare(b)).toString()).toEqual(
            generatedBookmarksInactive
                .map((bookmark) => bookmark.title)
                .sort((a, b) => a.localeCompare(b))
                .toString(),
        );
        expect(switchedBarTitles.sort((a, b) => a.localeCompare(b)).toString()).toEqual(
            generatedBookmarksActive
                .map((bookmark) => bookmark.title)
                .sort((a, b) => a.localeCompare(b))
                .toString(),
        );
    });
});
