const { suggestCategory } = require("../helpers/suggest-category");

const SKIP_LINE_PATTERNS = [
    /opening balance/i,
    /closing balance/i,
    /^total\b/i,
    /\bb\/f\b/i,
    /\bc\/f\b/i,
    /page \d+ of/i,
    /^s no\.?$/i,
    /^transaction$/i,
    /^transaction date$/i,
    /^cheque number/i,
    /^withdrawal$/i,
    /^deposit$/i,
    /^balance$/i,
    /transaction remarks/i,
    /amount \(inr\)/i,
    /^ground floor/i,
    /^barhu,/i,
    /statement of transactions in saving account/i,
    /^sincerly,?$/i,
    /^team icici bank/i,
    /^your base branch/i,
    /system generated statement/i,
    /never share your otp/i,
    /www\.icici\.bank\.in/i,
    /dial your bank/i,
    /registered mobile number/i,
    /legends for transactions/i,
    /^rchg - /i,
    /^dtax - /i,
    /^bpay - /i,
    /^idtx - /i,
    /^bbps - /i,
    /^inft - /i,
    /^bil - /i,
    /^onl - /i,
    /^neft - /i,
    /^pavc - /i,
    /^pac - /i,
    /^lnpy - /i,
    /^ccwd - /i,
    /^payc - /i,
    /^imps - /i,
    /^vat\/mat\/nfs - /i,
    /^inf - /i,
    /^eba - /i,
    /^smo - /i,
    /^vps\/ips - /i,
    /^top - /i,
    /^bctt - /i,
    /^uccbrn cms - /i,
    /^lccbrn cms - /i,
    /^n chg - /i,
    /^mmt - /i,
    /^t chg - /i,
    /^sgb - /i,
    /^icici bank limited$/i,
    /^animesh kumar$/i,
    /^\d+$/,
];

const STATEMENT_PERIOD_NUMERIC_PATTERN =
    /from\s*:?\s*(\d{2}[-/]\d{2}[-/]\d{4})\s+to\s*:?\s*(\d{2}[-/]\d{2}[-/]\d{4})/i;

const STATEMENT_PERIOD_PROSE_PATTERN =
    /for the period\s+([A-Za-z]+ \d{1,2}, \d{4})\s*-\s*([A-Za-z]+ \d{1,2}, \d{4})/i;

const DOT_DATE_LINE_PATTERN = /^(\d{1,2})?(\d{2})\.(\d{2})\.(\d{4})$/;
const SLASH_DATE_LINE_PATTERN = /^(\d{2})[-/](\d{2})[-/](\d{4})\s+(.*)$/;

function parseIndianAmount(value) {
    if (value == null || value === "") return null;
    const cleaned = String(value).replace(/,/g, "");
    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
}

function parseStatementDate(day, month, year) {
    return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDateToken(token) {
    const match = token.match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})$/);
    if (!match) return null;
    return parseStatementDate(match[1], match[2], match[3]);
}

function parseDotDateLine(line) {
    const match = line.match(DOT_DATE_LINE_PATTERN);
    if (!match) return null;
    return parseStatementDate(match[2], match[3], match[4]);
}

function extractStatementPeriod(text) {
    const numericMatch = text.match(STATEMENT_PERIOD_NUMERIC_PATTERN);
    if (numericMatch) {
        const start = parseDateToken(numericMatch[1]);
        const end = parseDateToken(numericMatch[2]);
        if (start && end) return { start, end };
    }

    const proseMatch = text.match(STATEMENT_PERIOD_PROSE_PATTERN);
    if (proseMatch) {
        const start = new Date(proseMatch[1]);
        const end = new Date(proseMatch[2]);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            return { start, end };
        }
    }

    return null;
}

function shouldSkipLine(line) {
    return SKIP_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function isDotDateLine(line) {
    return DOT_DATE_LINE_PATTERN.test(line);
}

function isAmountLine(line) {
    const amounts = extractAmountsFromLine(line);
    if (amounts.length === 0) return false;
    const stripped = line.replace(/[\d.,]/g, "").trim();
    return stripped.length === 0;
}

function extractAmountsFromLine(line) {
    const matches = line.match(/\d+\.\d{2}/g) || [];
    return matches.map(parseIndianAmount).filter((value) => value != null);
}

function popTrailingAmounts(parts) {
    const amounts = [];
    while (parts.length > 0) {
        const token = parts[parts.length - 1];
        if (!/^[\d,]+(?:\.\d{1,2})?$/.test(token)) break;
        amounts.unshift(parseIndianAmount(token));
        parts.pop();
    }
    return amounts;
}

function parseLegacySingleLineTransaction(line) {
    const match = line.match(SLASH_DATE_LINE_PATTERN);
    if (!match) return null;

    const [, day, month, year, rest] = match;
    const date = parseStatementDate(day, month, year);
    const parts = rest.trim().split(/\s+/);
    const amounts = popTrailingAmounts(parts);
    const description = parts.join(" ").trim();

    if (!description || amounts.length === 0) return null;

    let debit = null;
    let credit = null;

    if (amounts.length >= 3) {
        debit = amounts[amounts.length - 3] || null;
        credit = amounts[amounts.length - 2] || null;
    } else if (amounts.length === 2) {
        debit = amounts[0];
    } else {
        debit = amounts[0];
    }

    if (debit === 0) debit = null;
    if (credit === 0) credit = null;
    if (!debit && !credit) return null;

    return { date, description, debit, credit, balance: amounts[amounts.length - 1] ?? null };
}

function resolveTwoAmountTransaction(amount, balance, previousBalance) {
    if (previousBalance == null || balance === previousBalance) {
        return { debit: amount, credit: null };
    }

    if (balance < previousBalance) {
        return { debit: amount, credit: null };
    }

    return { debit: null, credit: amount };
}

function finalizeBlock(block, previousBalance) {
    const amountLines = block.lines.filter(isAmountLine);
    if (amountLines.length === 0) return null;

    const amounts = amountLines.flatMap(extractAmountsFromLine);
    if (amounts.length < 2) return null;

    const description = block.lines
        .filter((line) => !isAmountLine(line))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

    if (!description) return null;

    let debit = null;
    let credit = null;
    let balance = null;

    if (amounts.length >= 3) {
        debit = amounts[amounts.length - 3] || null;
        credit = amounts[amounts.length - 2] || null;
        balance = amounts[amounts.length - 1] ?? null;
    } else {
        const txnAmount = amounts[amounts.length - 2];
        balance = amounts[amounts.length - 1];
        const resolved = resolveTwoAmountTransaction(txnAmount, balance, previousBalance);
        debit = resolved.debit;
        credit = resolved.credit;
    }

    if (debit === 0) debit = null;
    if (credit === 0) credit = null;
    if (!debit && !credit) return null;

    return {
        date: block.date,
        description,
        debit,
        credit,
        balance,
    };
}

function parseMultilineTransactions(lines) {
    const transactions = [];
    let currentBlock = null;
    let previousBalance = null;

    const pushBlock = () => {
        if (!currentBlock) return;
        const parsed = finalizeBlock(currentBlock, previousBalance);
        if (parsed) {
            transactions.push(parsed);
            if (parsed.balance != null) {
                previousBalance = parsed.balance;
            }
        }
        currentBlock = null;
    };

    for (const line of lines) {
        if (shouldSkipLine(line)) continue;

        const legacy = parseLegacySingleLineTransaction(line);
        if (legacy) {
            pushBlock();
            transactions.push(legacy);
            if (legacy.balance != null) {
                previousBalance = legacy.balance;
            }
            continue;
        }

        if (isDotDateLine(line)) {
            pushBlock();
            currentBlock = { date: parseDotDateLine(line), lines: [] };
            continue;
        }

        if (currentBlock) {
            if (isAmountLine(line)) {
                currentBlock.lines.push(line);
                pushBlock();
            } else {
                currentBlock.lines.push(line);
            }
        }
    }

    pushBlock();
    return transactions;
}

function toPreviewTransaction(row) {
    let amount = 0;
    let type = "debit";

    if (row.debit) {
        amount = row.debit;
        type = "debit";
    } else if (row.credit) {
        amount = -row.credit;
        type = "credit";
    }

    return {
        date: formatLocalDate(row.date),
        description: row.description,
        amount,
        type,
        suggestedCategory: suggestCategory(row.description),
    };
}

function parseIciciStatementText(text) {
    const warnings = [];
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const rawTransactions = parseMultilineTransactions(lines);

    if (rawTransactions.length === 0) {
        warnings.push("No transactions found. Ensure this is a text-based ICICI PDF.");
    }

    let statementPeriod = extractStatementPeriod(text);
    if (!statementPeriod && rawTransactions.length > 0) {
        const dates = rawTransactions.map((row) => row.date.getTime());
        statementPeriod = {
            start: new Date(Math.min(...dates)),
            end: new Date(Math.max(...dates)),
        };
        warnings.push("Statement period inferred from transaction dates.");
    }

    const transactions = rawTransactions.map(toPreviewTransaction);

    return {
        statementPeriod: statementPeriod
            ? {
                  start: formatLocalDate(statementPeriod.start),
                  end: formatLocalDate(statementPeriod.end),
              }
            : null,
        transactions,
        warnings,
    };
}

module.exports = {
    parseIciciStatementText,
    extractAmountsFromLine,
    parseDotDateLine,
};
