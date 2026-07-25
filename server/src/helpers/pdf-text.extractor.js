const pdfParse = require("pdf-parse");

const PDFJS_VERSION = "v1.10.100";

function renderPageText(pageData) {
    return pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false,
    }).then((textContent) => {
        let lastY;
        let text = "";

        for (const item of textContent.items) {
            if (lastY === item.transform[5] || lastY == null) {
                text += item.str;
            } else {
                text += `\n${item.str}`;
            }
            lastY = item.transform[5];
        }

        return text;
    });
}

async function extractWithPassword(buffer, password) {
    const PDFJS = require(`pdf-parse/lib/pdf.js/${PDFJS_VERSION}/build/pdf.js`);
    global.PDFJS = PDFJS;
    PDFJS.disableWorker = true;

    let doc;
    try {
        doc = await PDFJS.getDocument({ data: buffer, password }).promise;
    } catch (error) {
        if (/password/i.test(error.message)) {
            throw new Error("Invalid PDF password. Check and try again.");
        }
        throw error;
    }

    let text = "";

    try {
        for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
            const page = await doc.getPage(pageNumber);
            const pageText = await renderPageText(page);
            text = `${text}\n\n${pageText}`;
        }
    } finally {
        doc.destroy();
    }

    return text;
}

async function extractPdfText(buffer, { password } = {}) {
    if (!password) {
        try {
            const parsed = await pdfParse(buffer);
            return parsed.text || "";
        } catch (error) {
            if (/password/i.test(error.message)) {
                throw new Error("PDF password is required for this statement.");
            }
            throw error;
        }
    }

    return extractWithPassword(buffer, password);
}

module.exports = {
    extractPdfText,
};
