import { type Page } from 'puppeteer';
import { faker } from '@faker-js/faker';


export const generateBookmarks = (count: number, parentId?: string) => {
    const generatedBookmarks = [] as { title: string; url: string; parentId?: string }[];
    for (let i = 0; i < count; ++i) {
        generatedBookmarks.push({
            title: faker.lorem.word({ length: 20 }),
            url: faker.internet.url(),
            parentId,
        });
    }
    return generatedBookmarks;
};

export const createBookmarks = async (
    page: Page,
    bookmarks: { title: string; url: string; parentId?: string }[],
    parentId?: string,
) => {
    await page.evaluate(
        (bm, id) => {
            bm.forEach(async (bookmark) => {
                bookmark.parentId = id;
                await chrome.bookmarks.create(bookmark);
            });
        },
        bookmarks,
        parentId,
    );
};

export const generateDirectory = (parentId?: string) => {
    return {
        title: faker.lorem.word({ length: 20 }),
        parentId,
    };
};

export const createDirectory = (page: Page, directory: { title: string; parentId?: string }, parentId?: string) => {
    return page.evaluate(
        async (dir, id) => {
            dir.parentId = id;
            const created = await chrome.bookmarks.create(dir);
            return created.id;
        },
        directory,
        parentId,
    );
};

export const getDirectoryId = (page: Page, title: string) => {
    return page.evaluate(async (t) => {
        const customDir = await chrome.bookmarks.search({ title: t });
        return customDir[0].id;
    }, title);
};

export const getBookmarksBarId = (page: Page) => {
    return page.evaluate(async () => {
        const bookmarks = await chrome.bookmarks.getTree();
        if (bookmarks[0].children === undefined) {
            return '';
        }
        return bookmarks[0].children[0].id;
    });
};

export const getBookmarkTitles = (page: Page, parentId: string) => {
    return page.evaluate(async (id) => {
        const children = await chrome.bookmarks.getChildren(id);
        return children.map((child) => child.title);
    }, parentId);
};
