const { parseIciciStatementText } = require("./icici-statement.parser");
const { parseHdfcStatementText } = require("./hdfc-statement.parser");

const PARSERS = {
    icici: parseIciciStatementText,
    hdfc: parseHdfcStatementText,
};

function parseStatementText(bank, text) {
    const parser = PARSERS[bank];
    if (!parser) {
        throw new Error("Unsupported bank selected");
    }
    return parser(text);
}

module.exports = {
    parseStatementText,
};
