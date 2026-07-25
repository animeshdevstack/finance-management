const fs = require("fs");
const path = require("path");
const { parseHdfcStatementText } = require("./hdfc-statement.parser");

const fixturePath = path.join(__dirname, "__fixtures__", "hdfc.sample.txt");
const fixtureText = fs.readFileSync(fixturePath, "utf8");

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const result = parseHdfcStatementText(fixtureText);

assert(result.transactions.length === 5, `Expected 5 transactions, got ${result.transactions.length}`);
assert(
    result.statementPeriod?.start === "2026-07-01",
    `Expected start 2026-07-01, got ${result.statementPeriod?.start}`
);
assert(
    result.statementPeriod?.end === "2026-07-13",
    `Expected end 2026-07-13, got ${result.statementPeriod?.end}`
);

const creditRow = result.transactions.find((row) => row.description.includes("ARUN RAMESH"));
assert(creditRow?.amount === -30000, `Expected credit -30000, got ${creditRow?.amount}`);

const debitRow = result.transactions.find((row) => row.description.includes("AKASH DEVIDAS"));
assert(debitRow?.amount === 1000, `Expected debit 1000, got ${debitRow?.amount}`);

const achRow = result.transactions.find((row) => row.description.includes("L&TFINANCE"));
assert(achRow?.amount === 8628, `Expected ACH debit 8628, got ${achRow?.amount}`);
assert(achRow?.suggestedCategory === "Bill", "ACH row should map to Bill");

const swiggyRow = result.transactions.find((row) => row.description.includes("SWIGGY"));
assert(swiggyRow?.suggestedCategory === "Food", "Swiggy row should map to Food");
assert(swiggyRow?.amount === 264, "Swiggy row should be a debit");

console.log("hdfc-statement.parser.test.js passed");
