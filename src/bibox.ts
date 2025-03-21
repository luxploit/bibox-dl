import puppeteer from "puppeteer";
import { loginIntoBibox } from "./login";
import { ScrappablePage } from "./page";
import { BiBoxBook, grabBooksFromShelf } from "./book";
import { syncBooksToDisk } from "./sync";

import fs from "fs/promises";

const main = async () => {
	const browser = await puppeteer.launch({
		headless: false,
		//slowMo: 250, // slow down by 250ms
	});

	try {
		await fs.mkdir(`books`);
	} catch {}

	const page = await browser.newPage();
	const srPage = new ScrappablePage(page);

	const token = await loginIntoBibox(srPage);
	const books = await grabBooksFromShelf(srPage);
	await browser.close();
	await syncBooksToDisk(token, books);
};

main();
