import { ScrappablePage } from "./page";
import config from "../config.json";

const biboxCredentials = {
	username: config.username,
	password: config.password,
};

export const loginIntoBibox = async (page: ScrappablePage) => {
	await page.navigateAndWait("https://bibox2.westermann.de", async (puppet) => {
		await page.asyncWait(2000);
		await puppet.type("#account", biboxCredentials.username);
		await puppet.type("#password", biboxCredentials.password);
		await puppet.click('button[name="action"]');
	});

	return await page.runPuppet(async (puppet): Promise<string> => {
		const request = await puppet.waitForRequest(
			(request) =>
				request.method().toUpperCase() !== "OPTIONS" &&
				request.url() == "https://backend.bibox2.westermann.de/api/user"
		);

		return request.headers()["authorization"];
	});
};
