const fs = require("fs");
const path = require("path");
const { parseIciciStatementText } = require("./icici-statement.parser");

const fixturePath = path.join(__dirname, "__fixtures__", "icici-multiline.sample.txt");
const fixtureText = fs.readFileSync(fixturePath, "utf8");

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const result = parseIciciStatementText(fixtureText);

assert(result.transactions.length === 10, `Expected 10 transactions, got ${result.transactions.length}`);
assert(
    result.statementPeriod?.start === "2026-07-21",
    `Expected start 2026-07-21, got ${result.statementPeriod?.start}`
);
assert(
    result.statementPeriod?.end === "2026-07-23",
    `Expected end 2026-07-23, got ${result.statementPeriod?.end}`
);

const iDirectRows = result.transactions.filter((row) =>
    /idirect|eba\/eq trade/i.test(row.description)
);
assert(iDirectRows.length === 7, `Expected 7 iDirect rows, got ${iDirectRows.length}`);
assert(
    iDirectRows.every((row) => row.suggestedCategory === "Investment"),
    "All iDirect rows should map to Investment"
);

const upiDebitRow = result.transactions.find((row) =>
    row.description.includes("7774881574-2@i/Payment")
);
assert(upiDebitRow?.suggestedCategory === "Uncategory", "UPI payment row should be Uncategory");
assert(upiDebitRow?.amount === 100, "UPI debit row should be 100");

const irctcRow = result.transactions.find((row) => row.description.includes("IRCTC"));
assert(irctcRow?.suggestedCategory === "Travelling", "IRCTC row should map to Travelling");
assert(irctcRow?.amount === 1402.7, "IRCTC row should be a debit");

const creditRow = result.transactions[result.transactions.length - 1];
assert(creditRow.amount < 0, "Last row should be a credit (negative amount)");
assert(creditRow.amount === -1402, `Expected credit -1402, got ${creditRow.amount}`);

console.log("icici-statement.parser.test.js passed");
