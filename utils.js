const fullXPathToSelector = (xpath) => {
    xpath = xpath.trim();
    xpath = xpath.slice(6);
    let result = xpath.replaceAll('/', ' > ');
    result = result.replaceAll('[', ':nth-child(');
    result = result.replaceAll(']', ')');
    return result;
};

module.exports = fullXPathToSelector;

