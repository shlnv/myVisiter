// /html/body/div[2]/div[1]/div/div/main/div/div/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div/div/div/div/div[1]/div[3]/div/div[1]/div[2]/div[2]/div[2]/div[2]/div/ul/li[1]/button
const fullXPathToSelector = (xpath) => {
    xpath = xpath.trim();
    xpath = xpath.slice(6);
    let result = xpath.replaceAll('/', ' > ');
    result = result.replaceAll('[', ':nth-child(');
    result = result.replaceAll(']', ')');
    return result;
};

module.exports = fullXPathToSelector;