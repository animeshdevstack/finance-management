const { CATEGORY_MAPPING_RULES } = require("../constants/category-mapping.rules");

const UNCATEGORY = "Uncategory";

function keywordMatches(text, keyword) {
    const escaped = keyword.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^A-Z0-9])${escaped}(?:[^A-Z0-9]|$)`).test(text);
}

function suggestCategory(description) {
    const text = String(description || "").toUpperCase();

    if (!text.trim()) {
        return UNCATEGORY;
    }

    for (const rule of CATEGORY_MAPPING_RULES) {
        if (rule.keywords.some((keyword) => keywordMatches(text, keyword))) {
            return rule.category;
        }
    }

    return UNCATEGORY;
}

module.exports = {
    suggestCategory,
    UNCATEGORY,
};
