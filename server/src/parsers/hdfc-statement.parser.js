const { suggestCategory } = require("../helpers/suggest-category");

const SKIP_LINE_PATTERNS = [
    /^datenarration/i,
    /statement of account/i,
    /^hdfc bank/i,
    /account branch/i,
    /customer id|cust id/i,
    /account no/i,
    /ifsc|micr/i,
    /registered office/i,
    /page no/i,
    /^mr[a-z]/i,
    /^\d+ dongargaon/i,
    /aurangabad/i,
    /maharashtra india/i,
    /joint holders/i,
    /nomination/i,
    /^address:/i,
    /^city:/i,
    /^state:/i,
    /^phone no/i,
    /^email:/i,
    /^od limit/i,
    /^currency:/i,
    /^account type/i,
    /^branch code/i,
    /^a\/c open date/i,
    /^account status/i,
    /^rtgs\/neft ifsc/i,
    /^closing balance includes/i,
    /^contents of this statement/i,
    /^this statement/i,
    /gstin|gstn/i,
    /hdfcbank\.com/i,
    /^\*+/,
    /^from\s*:/i,
    /^to\s*:/i,
];

const STATEMENT_PERIOD_PATTERN =
    /from\s*:\s*(\d{2}\/\d{2}\/\d{4})\s*to\s*:\s*(\d{2}\/\d{2}\/\d{4})/i;

const DATE_PREFIX_PATTERN = /^(\d{2}\/\d{2}\/\d{2})(.*)$/;
const AMOUNT_TAIL_PATTERN =
    /(\d{2}\/\d{2}\/\d{2})((?:\d{1,3}(?:,\d{3})*\.\d{2}){2,3})$/;

function parseIndianAmount(value) {
    if (value == null || value === "") return null;
    const cleaned = String(value).replace(/,/g, "");
    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
}

function expandTwoDigitYear(year) {
    const yy = Number(year);
    return yy >= 70 ? 1900 + yy : 2000 + yy;
}

function parseShortDateToken(token) {
    const match = token.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    if (!match) return null;
    return new Date(expandTwoDigitYear(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function parseFullDateToken(token) {
    const match = token.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function extractStatementPeriod(text) {
    const match = text.match(STATEMENT_PERIOD_PATTERN);
    if (!match) return null;

    const start = parseFullDateToken(match[1]);
    const end = parseFullDateToken(match[2]);
    if (!start || !end) return null;

    return { start, end };
}

function shouldSkipLine(line) {
    return SKIP_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function extractAmountsFromLine(line) {
    const matches = line.match(/\d{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2}/g) || [];
    return matches.map(parseIndianAmount).filter((value) => value != null);
}

function parseAmountTail(line) {
    const match = line.match(AMOUNT_TAIL_PATTERN);
    if (!match) return null;

    const amounts = extractAmountsFromLine(match[2]);
    if (amounts.length < 2) return null;

    return { amounts };
}

function inferDirectionFromDescription(description, amount) {
    const text = String(description || "").toUpperCase();

    if (/PAYMENT FROM|CREDIT|DEPOSIT|RECEIVED|\bCR\b|PAID VIA CRED/.test(text)) {
        return { debit: null, credit: amount };
    }

    if (/PAYMENT TO|ACH D-|WITHDRAW|\bDR\b|EMI|DEBIT/.test(text)) {
        return { debit: amount, credit: null };
    }

    return { debit: amount, credit: null };
}

function resolveAmounts(amounts, previousBalance, description) {
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
        const resolved = inferDirectionFromDescription(description, txnAmount);

        if (previousBalance != null && balance !== previousBalance) {
            if (balance < previousBalance) {
                return { debit: txnAmount, credit: null, balance };
            }
            return { debit: null, credit: txnAmount, balance };
        }

        debit = resolved.debit;
        credit = resolved.credit;
    }

    if (debit === 0) debit = null;
    if (credit === 0) credit = null;

    return { debit, credit, balance };
}

function parseSingleLineTransaction(line, previousBalance) {
    const tailMatch = line.match(AMOUNT_TAIL_PATTERN);
    if (!tailMatch) return null;

    const amounts = extractAmountsFromLine(tailMatch[2]);
    if (amounts.length < 2) return null;

    const beforeTail = line.slice(0, tailMatch.index).trim();
    const dateMatch = beforeTail.match(DATE_PREFIX_PATTERN);
    if (!dateMatch) return null;

    const description = dateMatch[2].trim();
    if (!description) return null;

    const { debit, credit, balance } = resolveAmounts(
        amounts,
        previousBalance,
        description
    );

    if (!debit && !credit) return null;

    return {
        date: parseShortDateToken(dateMatch[1]),
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

    const finalizeBlock = (block) => {
        if (!block?.amounts?.length) return;

        const description = block.parts.join(" ").replace(/\s+/g, " ").trim();
        if (!description) return;

        const { debit, credit, balance } = resolveAmounts(
            block.amounts,
            previousBalance,
            description
        );

        if (!debit && !credit) return;

        transactions.push({
            date: block.date,
            description,
            debit,
            credit,
            balance,
        });

        if (balance != null) {
            previousBalance = balance;
        }
    };

    for (const line of lines) {
        if (shouldSkipLine(line)) continue;

        const singleLine = parseSingleLineTransaction(line, previousBalance);
        if (singleLine) {
            if (currentBlock) {
                finalizeBlock(currentBlock);
                currentBlock = null;
            }
            transactions.push(singleLine);
            if (singleLine.balance != null) {
                previousBalance = singleLine.balance;
            }
            continue;
        }

        const dateStart = line.match(DATE_PREFIX_PATTERN);
        const amountTail = parseAmountTail(line);

        if (dateStart && !amountTail) {
            if (currentBlock) {
                finalizeBlock(currentBlock);
            }
            currentBlock = {
                date: parseShortDateToken(dateStart[1]),
                parts: dateStart[2].trim() ? [dateStart[2].trim()] : [],
                amounts: null,
                awaitingTrailing: false,
            };
            continue;
        }

        if (amountTail) {
            if (currentBlock) {
                currentBlock.amounts = amountTail.amounts;
                currentBlock.awaitingTrailing = true;
            }
            continue;
        }

        if (currentBlock?.awaitingTrailing) {
            currentBlock.parts.push(line);
            continue;
        }

        if (currentBlock) {
            currentBlock.parts.push(line);
        }
    }

    if (currentBlock) {
        finalizeBlock(currentBlock);
    }

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

function parseHdfcStatementText(text) {
    const warnings = [];
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const rawTransactions = parseMultilineTransactions(lines);

    if (rawTransactions.length === 0) {
        warnings.push("No transactions found. Ensure this is a text-based HDFC PDF.");
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
    parseHdfcStatementText,
    extractAmountsFromLine,
    parseAmountTail,
};
