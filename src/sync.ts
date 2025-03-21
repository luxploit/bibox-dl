import pdfkit from "pdfkit";
import { BiBoxBook } from "./book";
import fs from "fs";
import fsp from "fs/promises";

export const syncBooksToDisk = async (token: string, books: BiBoxBook[]) => {
	for (const book of books) {
		const bookFileName = `${book.Title} ${book.Edition} ${book.Demo ? "(Demo)" : "(Full)"} (ISBN ${
			book.ISBN
		}).pdf`;

		if (!book.Available) continue;

		try {
			if (await fsp.stat(`books/${bookFileName}`)) {
				console.log(`Skipping Book ISBN: ${book.ISBN}`);
				continue;
			}
		} catch {
			//await fsp.mkdir(`temp/${book.ISBN}`);
		}

		const response = await (
			await fetch(`https://backend.bibox2.westermann.de/v1/api/sync/${book.Id}`, {
				headers: {
					Authorization: token,
				},
				referrer: "https://bibox2.westermann.de/",
				method: "GET",
			})
		).json();

		const pdfDoc = new pdfkit({ autoFirstPage: false });
		const output = fs.createWriteStream(`books/${bookFileName}`);
		pdfDoc.pipe(output);

		for (const page of response["pages"]) {
			const pdfPage = pdfDoc.addPage();

			const pngBytes = await fetch(page["images"][1]["url"]).then((res) => res.arrayBuffer());
			pdfDoc.image(pngBytes, 0, 0, {
				width: pdfDoc.page.width,
				height: pdfDoc.page.height,
			});
			console.log(`Adding page ${page["name"]}`);

			const addChapter = (
				chapters: any,
				pageNum: number,
				parent: PDFKit.PDFOutline | null = null
			) => {
				for (const chapter of chapters) {
					if (chapter["pagenumStart"] != pageNum) {
						if (chapter["children"] && chapter["children"].length > 0)
							addChapter(chapter["children"], pageNum, null);
						continue;
					}

					const ref = parent
						? parent.addItem(chapter["title"])
						: pdfDoc.outline.addItem(chapter["title"]);
					console.log(`Adding chapter ${chapter["title"]}`);
					if (chapter["children"] && chapter["children"].length > 0)
						addChapter(chapter["children"], pageNum, ref);
				}
			};

			if (page["name"].indexOf(".") === -1) {
				addChapter(response["chapters"], parseInt(page["name"]));
			}
		}

		pdfDoc.end();
	}
};
