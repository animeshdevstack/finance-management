function buildEffectiveDateRangeMatch(start, end, endInclusive = false) {
    const endOperator = endInclusive ? "$lte" : "$lt";
    return {
        $expr: {
            $and: [
                { $gte: [{ $ifNull: ["$transactionDate", "$createdAt"] }, start] },
                { [endOperator]: [{ $ifNull: ["$transactionDate", "$createdAt"] }, end] },
            ],
        },
    };
}

module.exports = {
    buildEffectiveDateRangeMatch,
};
