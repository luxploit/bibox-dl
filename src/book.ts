import { ScrappablePage } from "./page";

export interface BiBoxBook {
	Id: number;
	Title: string;
	Subtitle: string;
	Edition: string;
	ISBN: string;
	NumberOfPages: number;
	Available: boolean;
	Demo: boolean;
}

export const grabBooksFromShelf = async (page: ScrappablePage) => {
	return await page.runPuppet(async (puppet): Promise<BiBoxBook[]> => {
		let books: BiBoxBook[] = [];

		const response = await (
			await puppet.waitForResponse(
				(response) =>
					response.request().method().toUpperCase() !== "OPTIONS" &&
					response.url() == "https://backend.bibox2.westermann.de/api/books"
			)
		).json();

		for (const element of response) {
			const book: BiBoxBook = {
				Id: element["id"],
				Title: element["title"],
				Subtitle: element["subtitle"],
				Edition: element["region"],
				ISBN: element["isbn"],
				NumberOfPages: element["pagenum"],
				Available: !element["removed"],
				Demo: element["demo"],
			};
			//console.log(book);
			console.log(
				`Found book: ${book.Title} ${book.Edition} | ISBN: ${book.ISBN} | Version: ${
					book.Demo ? "Demo" : "Full"
				}`
			);
			books.push(book);
		}

		return books;
	});
};
