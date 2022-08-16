const getTimes = async (page) => {
    let htmls = [];
    let times = [];

    const timeSelector = `main > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > ul`;

    const getTimeArray = async (page) => {
        htmls = await page.$$eval(timeSelector + ' > li', tms => {
            return tms.map(tm => tm.outerHTML);
        });
        const timeExp = /\d{1,2}:\d{2}/;
        times = htmls.map(time => timeExp.exec(time)[0]);
    }
    const createTimeAndSelectorObjectArray = (timeSelector) => {
        let arr = [];
        for (let i = 0; i < times.length; i++) {
            let timeAndSelectorObject = {
                time: times[i],
                selector: timeSelector + ' > li:nth-child(' + +(i + 1) + ') > button[data-ng-click="chooseTime(s.Time)"]'
            };
            arr.push(timeAndSelectorObject);
        }
        return arr;
    }
    await page.waitForTimeout(2000);
    await getTimeArray(page);
    return createTimeAndSelectorObjectArray(timeSelector);
}

module.exports = getTimes;