import { ElementHandle, Page } from "puppeteer";

export class ScrappablePage {
	constructor(private readonly page: Page) {}

	async runPuppet<ret extends unknown>(callback: (page: Page) => ret) {
		return callback(this.page);
	}

	async asyncWait(time: number) {
		return new Promise((r) => setTimeout(r, time));
	}

	async awaitPageLoad() {
		return await this.actionAfterWait(() => this.asyncWait(2000));
	}

	async actionAfterWait(callback: (page: Page) => void) {
		await this.page.waitForNavigation();
		return callback(this.page);
	}

	async navigateAndWait(url: string, callback: (page: Page) => void) {
		await this.page.goto(url);
		return await this.actionAfterWait(callback);
	}
}
