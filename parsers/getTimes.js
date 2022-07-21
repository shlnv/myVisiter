const getTimes = async (page) => {
    console.log('getTimes function started');
    let htmls = [];
    let times = [];

    const timeSelector = `main > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > ul`
    console.log(timeSelector)

    const getTimeArray = async (page) => {
        console.log('getTimeArray function started')
        htmls = await page.$$eval(timeSelector + ' > li', tms => {
            console.log('parsed: ' + tms);
            return tms.map(tm => tm.outerHTML);
        });
        console.log('array of time htmls: ' + htmls);
        const timeExp = /\d{1,2}:\d{2}/;
        // \s[A-P]{2}
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