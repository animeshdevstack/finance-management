function buildEqualSplits(totalAmount, participantUserIds) {
    const count = participantUserIds.length;
    if (count === 0) {
        throw new Error("At least one participant is required");
    }

    const base = Math.floor((totalAmount * 100) / count) / 100;
    let remainder = Math.round(totalAmount * 100 - base * 100 * count);

    return participantUserIds.map((userId, index) => {
        let owedAmount = base;
        if (remainder > 0) {
            owedAmount = Math.round((owedAmount + 0.01) * 100) / 100;
            remainder -= 1;
        }

        return {
            userId,
            owedAmount,
        };
    });
}

function computeNetBalances(expenses, splits, memberUserIds) {
    const nets = new Map(memberUserIds.map((id) => [String(id), 0]));

    for (const expense of expenses) {
        const payerId = String(expense.paidByUserId);
        const payerNet = nets.get(payerId) ?? 0;
        nets.set(payerId, payerNet + Number(expense.totalAmount));
    }

    for (const split of splits) {
        const userId = String(split.userId);
        const current = nets.get(userId) ?? 0;
        nets.set(userId, current - Number(split.owedAmount));
    }

    return nets;
}

function simplifyDebts(netBalances, userNames) {
    const debtors = [];
    const creditors = [];

    for (const [userId, balance] of netBalances.entries()) {
        const rounded = Math.round(balance * 100) / 100;
        if (rounded < -0.01) {
            debtors.push({ userId, amount: -rounded });
        } else if (rounded > 0.01) {
            creditors.push({ userId, amount: rounded });
        }
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const payAmount = Math.min(debtors[i].amount, creditors[j].amount);
        const roundedPay = Math.round(payAmount * 100) / 100;

        if (roundedPay > 0) {
            settlements.push({
                fromUserId: debtors[i].userId,
                fromUserName: userNames.get(debtors[i].userId) || "User",
                toUserId: creditors[j].userId,
                toUserName: userNames.get(creditors[j].userId) || "User",
                amount: roundedPay,
            });
        }

        debtors[i].amount = Math.round((debtors[i].amount - roundedPay) * 100) / 100;
        creditors[j].amount = Math.round((creditors[j].amount - roundedPay) * 100) / 100;

        if (debtors[i].amount <= 0.01) i += 1;
        if (creditors[j].amount <= 0.01) j += 1;
    }

    return settlements;
}

module.exports = {
    buildEqualSplits,
    computeNetBalances,
    simplifyDebts,
};
